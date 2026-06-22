"""
mastp/workflow/nodes.py
LangGraph node implementations for the 3 MVP agents.
"""
from __future__ import annotations

import json
import re
import os
import uuid
import hashlib
import logging
from typing import List, Optional

from mastp.state import MVPState
from mastp.prompts import (
    CODE_ANALYSIS_SYSTEM, CODE_ANALYSIS_USER,
    BR_EXTRACTION_SYSTEM, BR_EXTRACTION_USER,
    FUNCTION_INVENTORY_SYSTEM, FUNCTION_INVENTORY_USER,
    TEST_CASE_SYSTEM, TEST_CASE_USER,
)

logger = logging.getLogger("mastp")

# ─── LLM setup ────────────────────────────────────────────────────────────────

def _get_llm(model: str = None, temperature: float = 0.2, node_type: str = "generic"):
    """Get LLM client. Supports Anthropic (primary), OpenAI (fallback), or Google GenAI."""
    model = model or os.getenv("MASTP_MODEL", "claude-sonnet-4-5")

    if "claude" in model.lower():
        from langchain_anthropic import ChatAnthropic
        api_key = os.getenv("ANTHROPIC_API_KEY", "")
        if not api_key:
            raise EnvironmentError("ANTHROPIC_API_KEY not set in environment.")
        return ChatAnthropic(model=model, temperature=temperature, api_key=api_key)
    elif "gpt" in model.lower():
        from langchain_openai import ChatOpenAI
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key:
            raise EnvironmentError("OPENAI_API_KEY not set in environment.")
        return ChatOpenAI(model=model, temperature=temperature, api_key=api_key)
    elif "gemini" in model.lower():
        from langchain_google_genai import ChatGoogleGenerativeAI
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            raise EnvironmentError("GEMINI_API_KEY not set in environment.")
        return ChatGoogleGenerativeAI(model=model, temperature=temperature, google_api_key=api_key)
    elif "grok" in model.lower():
        from langchain_openai import ChatOpenAI
        api_key = os.getenv("XAI_API_KEY", "")
        if not api_key:
            raise EnvironmentError("XAI_API_KEY not set in environment.")
        return ChatOpenAI(model=model, temperature=temperature, api_key=api_key, base_url="https://api.x.ai/v1", max_tokens=3000)
    elif "llama" in model.lower() or "groq" in model.lower() or "mixtral" in model.lower():
        from langchain_openai import ChatOpenAI
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            raise EnvironmentError("GROQ_API_KEY not set in environment.")
        return ChatOpenAI(model=model, temperature=temperature, api_key=api_key, base_url="https://api.groq.com/openai/v1", max_tokens=3000)
    else:
        raise ValueError(f"Unsupported model: {model}")


# ─── JSON parsing helper ──────────────────────────────────────────────────────

def _extract_json(text: str) -> dict:
    """Extract JSON from LLM response — handles ```json ... ``` markers and truncated outputs."""
    import json_repair
    
    # Try ```json ... ``` first
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*(?:```|$)", text, re.IGNORECASE)
    json_str = match.group(1) if match else text
    
    try:
        # json_repair will automatically fix missing brackets, trailing commas, and truncated arrays
        decoded = json_repair.loads(json_str)
        if isinstance(decoded, dict):
            return decoded
        elif isinstance(decoded, list):
            # If it's a list, wrap it in a dict assuming it's the test_cases list
            return {"extracted_array": decoded}
    except Exception as e:
        logger.warning(f"json_repair failed: {e}")
        pass

    # Last resort: attempt to fix common issues
    cleaned = text.replace("\n", " ").replace("\t", " ")
    match = re.search(r"\{.*\}", cleaned)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Cannot extract valid JSON from LLM response. First 500 chars:\n{text[:500]}")


# ─── Placeholder detector ─────────────────────────────────────────────────────

PLACEHOLDER_PATTERNS = [
    r"\byour_\w+\b",
    r"\bvalid_\w+\b",
    r"\bexample_\w+\b",
    r"<[A-Z_]{2,}>",
    r"\[YOUR_\w+\]",
    r"\bplaceholder\b",
]

def _has_placeholders(text: str) -> bool:
    return any(re.search(p, text, re.IGNORECASE) for p in PLACEHOLDER_PATTERNS)


# ─── Context Chunking Strategy (Critical Issue #1 fix) ───────────────────────
# Agent 03 Context Overflow Prevention:
# Large modules (Booking, Payment, Contract) can have 8,000+ lines of code
# across Controller + Service + Validator. Naively truncating at 8,000 chars
# can silently drop entire endpoint definitions mid-function.
# Solution: split by @*Mapping boundaries so each chunk is a complete method.

CHUNK_CHAR_LIMIT = 5_500  # Safe limit: leaves ~500 chars for prompt overhead within 6k TPM


def _chunk_source_code(source_code: str, limit: int = CHUNK_CHAR_LIMIT) -> list[str]:
    """Split source code into chunks at @*Mapping method boundaries.
    
    Each chunk ends right before the next HTTP mapping annotation so
    no endpoint definition is ever split across two prompts.
    """
    if len(source_code) <= limit:
        return [source_code]

    # Split at @GetMapping / @PostMapping / etc. boundaries
    boundaries = [m.start() for m in re.finditer(
        r"@(?:Get|Post|Put|Delete|Patch)Mapping", source_code
    )]

    if not boundaries:
        # Fallback: split by line count
        lines = source_code.splitlines()
        chunks, current = [], []
        current_len = 0
        for line in lines:
            if current_len + len(line) > limit and current:
                chunks.append("\n".join(current))
                current, current_len = [], 0
            current.append(line)
            current_len += len(line)
        if current:
            chunks.append("\n".join(current))
        return chunks

    # Build chunks from boundary positions
    chunks = []
    chunk_start = 0
    for boundary in boundaries[1:]:  # skip first — it's the start
        if boundary - chunk_start >= limit:
            chunks.append(source_code[chunk_start:boundary])
            chunk_start = boundary
    chunks.append(source_code[chunk_start:])  # last chunk
    return [c for c in chunks if c.strip()]


def _load_service_context(source_root: str, module_code: str, max_chars: int = 3_000) -> str:
    """Load companion Service file for dependency + BR enrichment context (Stage B).
    
    Returns a truncated excerpt of the Service file if found, or empty string.
    This gives the Code Analysis Agent visibility into BookingService,
    PaymentService, etc. without exploding the context window.
    """
    controller_name_base = None
    controller_dir = os.path.join(source_root, "controller")
    service_dir = os.path.join(source_root, "service")

    if not os.path.exists(service_dir):
        return ""

    # Try to find Service file matching module (e.g. BookingService.java)
    # Look for *Service.java files related to this module code
    candidates = [
        f for f in os.listdir(service_dir)
        if f.endswith("Service.java") or f.endswith("ServiceImpl.java")
    ]

    # Match heuristically: module code letters appear in service name
    module_lower = module_code.lower()
    best = None
    for cand in candidates:
        if module_lower in cand.lower():
            best = cand
            break

    if not best and candidates:
        # Fallback: take first available service
        best = candidates[0]

    if not best:
        return ""

    service_path = os.path.join(service_dir, best)
    try:
        with open(service_path, "r", encoding="utf-8") as f:
            content = f.read()
        logger.info(f"  ✓ Loaded service context: {best} ({len(content)} chars, using first {max_chars})")
        return f"\n\n--- SERVICE CONTEXT ({best}) ---\n" + content[:max_chars]
    except Exception:
        return ""


def _stable_br_key(text: str) -> str:
    """Generate a deterministic, stable key from a business rule description.
    
    Stable BR IDs (Remaining Issue #2): Using hash prevents ID drift when AI
    re-orders or renames rules between runs, preserving traceability.
    """
    normalized = re.sub(r"\s+", "_", text.lower().strip())
    normalized = re.sub(r"[^a-z0-9_]", "", normalized)[:40]
    short_hash = hashlib.md5(text.encode()).hexdigest()[:6]
    return f"{normalized}_{short_hash}"


# ─────────────────────────────────────────────────────────────────────────────
# NODE 1 — Code Analysis Agent
# ─────────────────────────────────────────────────────────────────────────────

def code_analysis_node(state: MVPState) -> MVPState:
    """
    Read Java controller source and extract REST endpoints via LLM.
    Also attempts regex-based parsing as fallback/enrichment.
    """
    logger.info("🔍 [CODE ANALYSIS] Starting analysis...")
    state = dict(state)
    state["current_node"] = "code_analysis"

    module_code = state["module_code"]
    module_name = state["module_name"]
    base_url = state.get("base_url", "http://localhost:8080")

    # ── Load source files ────────────────────────────────────────────────
    source_root = state["source_root"]
    controller_file = state.get("controller_file", f"{module_code}Controller.java")
    controller_path = os.path.join(source_root, "controller", controller_file)

    if not os.path.exists(controller_path):
        logger.warning(f"Controller file not found: {controller_path}")
        state["errors"] = state.get("errors", []) + [f"Controller not found: {controller_path}"]
        state["endpoints"] = []
        state["quality_scores"] = {**state.get("quality_scores", {}), "code_analysis": 0.0}
        return state

    with open(controller_path, "r", encoding="utf-8") as f:
        source_code = f.read()

    state["source_code"] = source_code
    logger.info(f"  ✓ Loaded {controller_file} ({len(source_code)} chars)")

    # Stage B: Load Service context for dependency enrichment (non-blocking)
    service_context = _load_service_context(source_root, module_code)

    # ── Context Chunking (Critical Issue #1 fix) ─────────────────────────
    # Split source into chunks at @Mapping boundaries instead of hard truncation.
    # Each chunk = a set of complete endpoint methods.
    source_chunks = _chunk_source_code(source_code)
    if len(source_chunks) > 1:
        logger.info(f"  📦 Source split into {len(source_chunks)} chunk(s) to prevent context overflow")

    # ── LLM Analysis — run per chunk, merge results ───────────────────────
    base_path_match = re.search(r'@RequestMapping\("([^"]+)"\)', source_code)
    base_path = base_path_match.group(1) if base_path_match else f"/{module_code.lower()}"

    max_retries = 3
    all_endpoints = []
    llm = _get_llm(state.get("llm_model"), temperature=0.1, node_type="code_analysis")

    for chunk_idx, chunk in enumerate(source_chunks):
        # Append service context only to first chunk (avoids duplication)
        enriched_chunk = chunk + (service_context if chunk_idx == 0 else "")
        if len(enriched_chunk) > CHUNK_CHAR_LIMIT + 1000:
            enriched_chunk = enriched_chunk[:CHUNK_CHAR_LIMIT + 1000]

        user_prompt = CODE_ANALYSIS_USER.format(
            controller_name=controller_file.replace(".java", ""),
            module_code=module_code,
            module_name=module_name,
            base_url=base_url,
            base_path=base_path,
            source_code=enriched_chunk,
        )
        if len(source_chunks) > 1:
            user_prompt += f"\n\nNOTE: This is chunk {chunk_idx + 1} of {len(source_chunks)}. Extract ONLY endpoints defined in this chunk."

        chunk_endpoints = []
        for attempt in range(max_retries):
            try:
                if len(source_chunks) > 1:
                    logger.info(f"  📡 LLM call: chunk {chunk_idx + 1}/{len(source_chunks)}, attempt {attempt + 1}/{max_retries}...")
                else:
                    logger.info(f"  📡 LLM call attempt {attempt + 1}/{max_retries}...")
                messages = [
                    {"role": "user", "content": f"SYSTEM CONTEXT:\n{CODE_ANALYSIS_SYSTEM}\n\n---\n\n{user_prompt}"}
                ]
                response = llm.invoke(messages)
                result = _extract_json(response.content)
                chunk_endpoints = result.get("endpoints", [])

                if len(chunk_endpoints) == 0 and attempt < max_retries - 1:
                    logger.warning(f"  ⚠ No endpoints extracted on attempt {attempt + 1}. Retrying...")
                    user_prompt += "\n\nIMPORTANT: The previous attempt extracted 0 endpoints. Re-examine EVERY @GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PatchMapping annotation in the code."
                    continue

                break

            except Exception as e:
                logger.warning(f"  ⚠ Attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    state["errors"] = state.get("errors", []) + [f"Code analysis LLM failed: {e}"]

        # Re-sequence endpoint IDs to avoid collisions across chunks
        offset = len(all_endpoints)
        for i, ep in enumerate(chunk_endpoints):
            ep["endpoint_id"] = f"EP-{module_code}-{offset + i + 1:03d}"
        all_endpoints.extend(chunk_endpoints)

    endpoints = all_endpoints
    logger.info(f"  ✓ Extracted {len(endpoints)} endpoints")

    if not endpoints:
        state["errors"] = state.get("errors", []) + ["Code analysis: 0 endpoints after all chunks"]
        state["endpoints"] = []
        state["quality_scores"] = {**state.get("quality_scores", {}), "code_analysis": 0.0}
        return state

    # ── Quality scoring ───────────────────────────────────────────────────
    quality = 1.0 if len(endpoints) > 0 else 0.0
    logger.info(f"  📊 Quality score: {quality:.2f} ({len(endpoints)} endpoints)")

    state["endpoints"] = endpoints
    state["quality_scores"] = {**state.get("quality_scores", {}), "code_analysis": quality}
    return state


# ─────────────────────────────────────────────────────────────────────────────
# NODE 1.5 — Business Rule Extraction Agent (Agent 05)
# ─────────────────────────────────────────────────────────────────────────────

def business_rule_node(state: MVPState) -> MVPState:
    """
    Extract Business Rules from Controller + Service layer source code.
    
    Runs after code_analysis_node. Reads the service_code already loaded
    by _load_service_context(). Outputs business_rules[] which feeds into
    both function_inventory_node (linked_br) and test_case_node (BR test types).
    """
    logger.info("📖 [BR EXTRACTION] Extracting business rules...")
    state = dict(state)
    state["current_node"] = "business_rule_extraction"

    module_code = state["module_code"]
    module_name = state["module_name"]
    source_root  = state["source_root"]
    controller_code = state.get("source_code", "") or ""

    # Load service code (full pass — chunked separately from controller analysis)
    service_code = state.get("service_code", "") or ""
    if not service_code:
        svc_raw = _load_service_context(source_root, module_code, max_chars=6_000)
        # Strip the "--- SERVICE CONTEXT --- " header added by _load_service_context
        service_code = svc_raw.split("---\n", 1)[-1] if "---\n" in svc_raw else svc_raw
        state["service_code"] = service_code

    if not controller_code and not service_code:
        logger.warning("  ⚠ No source code available for BR extraction. Skipping.")
        state["business_rules"] = []
        state["quality_scores"] = {**state.get("quality_scores", {}), "br_extraction": 0.0}
        return state

    # Chunk controller code to avoid overflow
    controller_chunks = _chunk_source_code(controller_code[:4_000])
    controller_excerpt = controller_chunks[0] if controller_chunks else controller_code[:4_000]

    # Service code: first 5,000 chars is usually enough for BR extraction
    service_excerpt = service_code[:5_000]

    all_rules = []
    seq_end = 20  # initial target; we collect all rules found

    user_prompt = BR_EXTRACTION_USER.format(
        module_code=module_code,
        module_name=module_name,
        controller_code=controller_excerpt,
        service_code=service_excerpt if service_excerpt else "(No service file found for this module)",
        seq_end=seq_end,
    )

    llm = _get_llm(state.get("llm_model"), temperature=0.1, node_type="br_extraction")
    max_retries = 3

    for attempt in range(max_retries):
        try:
            logger.info(f"  📡 BR LLM call attempt {attempt + 1}/{max_retries}...")
            messages = [
                {"role": "user", "content": f"SYSTEM CONTEXT:\n{BR_EXTRACTION_SYSTEM}\n\n---\n\n{user_prompt}"}
            ]
            response = llm.invoke(messages)
            result   = _extract_json(response.content)
            all_rules = result.get("business_rules", [])

            if not all_rules and attempt < max_retries - 1:
                logger.warning(f"  ⚠ No BRs extracted on attempt {attempt + 1}. Retrying...")
                user_prompt += (
                    "\n\nIMPORTANT: Zero business rules were returned. "
                    "Look for if-throw blocks, @NotNull/@Min/@Max annotations, and enum status transitions. "
                    "Extract EVERY condition you see, even if you are only 60% confident."
                )
                continue

            # Apply stable br_key using hash to prevent ID drift across runs
            for i, rule in enumerate(all_rules):
                rule["br_id"]  = f"BR-{module_code}-{i + 1:03d}"
                rule["br_key"] = rule.get("br_key") or _stable_br_key(
                    rule.get("description", f"rule_{i}")
                )
            break

        except Exception as e:
            logger.warning(f"  ⚠ BR attempt {attempt + 1} failed: {e}")
            if attempt == max_retries - 1:
                state["errors"] = state.get("errors", []) + [f"BR extraction failed: {e}"]

    # Filter out uncertain hallucinations (confidence < 0.5)
    confirmed = [r for r in all_rules if r.get("confidence", 1.0) >= 0.5]
    dropped   = len(all_rules) - len(confirmed)
    if dropped:
        logger.info(f"  🗑️ Dropped {dropped} uncertain rules (confidence < 0.5)")

    quality = min(1.0, len(confirmed) / max(5, 1))  # expect at least 5 BRs for a real module
    quality = 1.0 if confirmed else 0.0
    logger.info(f"  ✓ Extracted {len(confirmed)} business rules (quality: {quality:.2f})")

    state["business_rules"] = confirmed
    state["quality_scores"]  = {**state.get("quality_scores", {}), "br_extraction": quality}
    return state


# ─────────────────────────────────────────────────────────────────────────────
# NODE 2 — Function Inventory Agent
# ─────────────────────────────────────────────────────────────────────────────

def function_inventory_node(state: MVPState) -> MVPState:
    """
    Build unified Function Inventory from endpoint analysis.
    Each endpoint → one Function entry with priority, estimation, etc.
    """
    logger.info("📦 [FUNCTION INVENTORY] Building inventory...")
    state = dict(state)
    state["current_node"] = "function_inventory"

    module_code = state["module_code"]
    module_name = state["module_name"]
    endpoints   = state.get("endpoints", [])

    # Pull BR data from Agent 05 — pass as context to the LLM
    business_rules = state.get("business_rules", [])
    br_summary = ""
    if business_rules:
        br_lines = [f"  - [{r['priority']}] {r['description']} (br_id: {r['br_id']})" for r in business_rules]
        br_summary = "\n".join(br_lines)
        logger.info(f"  📖 Injecting {len(business_rules)} business rules into Function Inventory")
    else:
        br_summary = "(No business rules extracted for this module)"

    if not endpoints:
        logger.warning("  ⚠ No endpoints to process. Generating minimal inventory.")
        state["functions"] = []
        state["quality_scores"] = {**state.get("quality_scores", {}), "function_inventory": 0.0}
        return state

    # ── Default business rules per module ─────────────────────────────────
    DEFAULT_BR = {
        "AA": (
            "BR-AA-001: Account must be email-verified before login (mandatory, blocking)\n"
            "BR-AA-002: Password must be 8-128 characters, contain uppercase, digit, special char\n"
            "BR-AA-003: Account locked after 5 consecutive failed login attempts\n"
            "BR-AA-004: OTP expires after 5 minutes\n"
            "BR-AA-005: Password reset token is single-use"
        ),
        "BL": (
            "BR-BL-001: Customer KYC must be verified before booking\n"
            "BR-BL-002: Booking dates must not overlap existing bookings for the same vehicle\n"
            "BR-BL-003: Cancellation within 24h before pickup incurs 50% penalty\n"
            "BR-BL-004: Customer must pay deposit before booking is confirmed"
        ),
        "PGI": (
            "BR-PGI-001: VNPay callback must contain valid HMAC-SHA512 signature\n"
            "BR-PGI-002: Payment amount must match booking total exactly\n"
            "BR-PGI-003: Refund only allowed for cancelled bookings\n"
            "BR-PGI-004: Transaction ID must be unique"
        ),
    }
    business_rules_text = DEFAULT_BR.get(module_code, f"No specific business rules defined for {module_code}")

    target_count = len(endpoints)
    user_prompt = FUNCTION_INVENTORY_USER.format(
        module_code=module_code,
        module_name=module_name,
        controller_name=f"{module_code}Controller",
        target_count=target_count,
        endpoints_json=json.dumps(endpoints, indent=2),
        business_rules_text=business_rules_text,
    )

    max_retries = 3
    functions = []
    llm = _get_llm(state.get("llm_model"), temperature=0.2, node_type="function_inventory")

    for attempt in range(max_retries):
        try:
            logger.info(f"  📡 LLM call attempt {attempt + 1}/{max_retries}...")
            messages = [
                {"role": "user", "content": f"SYSTEM CONTEXT:\n{FUNCTION_INVENTORY_SYSTEM}\n\n---\n\n{user_prompt}"}
            ]
            response = llm.invoke(messages)
            result = _extract_json(response.content)
            functions = result.get("functions", [])

            if len(functions) < max(1, target_count // 2) and attempt < max_retries - 1:
                logger.warning(f"  ⚠ Only {len(functions)}/{target_count} functions on attempt {attempt + 1}. Retrying...")
                user_prompt += f"\n\nIMPORTANT: Only {len(functions)} functions generated but {target_count} endpoints were provided. Generate one function per endpoint."
                continue

            logger.info(f"  ✓ Generated {len(functions)} functions")
            break

        except Exception as e:
            logger.warning(f"  ⚠ Attempt {attempt + 1} failed: {e}")
            if attempt == max_retries - 1:
                state["errors"] = state.get("errors", []) + [f"Function inventory LLM failed: {e}"]
                state["functions"] = []
                state["quality_scores"] = {**state.get("quality_scores", {}), "function_inventory": 0.0}
                return state

    # ── Ensure IDs are properly formatted ─────────────────────────────────
    for idx, func in enumerate(functions, start=1):
        if not func.get("function_id") or not func["function_id"].startswith(f"FUNC-{module_code}"):
            func["function_id"] = f"FUNC-{module_code}-{idx:03d}"
        func.setdefault("module_code", module_code)
        func.setdefault("module_name", module_name)

    # 100% if all endpoints were converted to functions
    quality = 1.0 if len(functions) >= len(endpoints) and len(functions) > 0 else 0.0
    logger.info(f"  📊 Quality score: {quality:.2f} ({len(functions)} functions)")

    state["functions"] = functions
    state["quality_scores"] = {**state.get("quality_scores", {}), "function_inventory": quality}
    return state


# ─────────────────────────────────────────────────────────────────────────────
# NODE 3 — Test Case Agent
# ─────────────────────────────────────────────────────────────────────────────

def test_case_node(state: MVPState) -> MVPState:
    """
    Generate detailed, executable test cases for all functions.
    Exports to Excel and optionally Postman collection.
    """
    logger.info("✅ [TEST CASE] Generating test cases...")
    state = dict(state)
    state["current_node"] = "test_case"

    module_code = state["module_code"]
    module_name = state["module_name"]
    functions = state.get("functions", [])

    if not functions:
        logger.warning("  ⚠ No functions to generate TCs for.")
        state["test_cases"] = []
        state["quality_scores"] = {**state.get("quality_scores", {}), "test_case": 0.0}
        return state

    target_count = state.get("target_tcs", max(len(functions) * 10, 80))
    function_count = len(functions)
    seq_end = target_count

    # Process in batches if many functions
    # Groq Llama 3 8B tends to ignore instructions if there are too many functions in one prompt.
    # Setting BATCH_SIZE = 1 forces the LLM to focus deeply on generating 4-6 test cases per function.
    BATCH_SIZE = 1
    all_test_cases = []
    tc_counter = 0
    llm = _get_llm(state.get("llm_model"), temperature=0.3, node_type="test_case")

    func_batches = [functions[i:i + BATCH_SIZE] for i in range(0, len(functions), BATCH_SIZE)]

    for batch_idx, func_batch in enumerate(func_batches):
        batch_target = max(10, target_count // len(func_batches))
        logger.info(f"  📡 Batch {batch_idx + 1}/{len(func_batches)}: {len(func_batch)} functions → ~{batch_target} TCs")

        user_prompt = TEST_CASE_USER.format(
            module_code=module_code,
            module_name=module_name,
            functions_json=json.dumps(func_batch, indent=2),
            target_count=batch_target,
            function_count=len(func_batch),
            seq_end=tc_counter + batch_target,
        )

        max_retries = 3
        batch_tcs = []

        for attempt in range(max_retries):
            try:
                messages = [
                    {"role": "user", "content": f"SYSTEM CONTEXT:\n{TEST_CASE_SYSTEM}\n\n---\n\n{user_prompt}"}
                ]
                response = llm.invoke(messages)
                result = _extract_json(response.content)
                batch_tcs = result.get("test_cases", [])

                # Check for placeholders
                placeholder_count = sum(
                    1 for tc in batch_tcs
                    if _has_placeholders(tc.get("test_case_procedure", ""))
                )
                if placeholder_count > 0 and attempt < max_retries - 1:
                    logger.warning(f"  ⚠ {placeholder_count} TCs have placeholders. Retrying with stricter instruction...")
                    user_prompt += (
                        f"\n\nCRITICAL: {placeholder_count} test cases still have placeholder values like 'valid_email', 'your_password', etc. "
                        "Replace ALL placeholders with real values (e.g., testcustomer@luxeway.vn, P@ssword123!). "
                        "DO NOT use generic text like [Hành động], [METHOD], [ENDPOINT]. USE THE REAL DATA FROM THE FUNCTION INVENTORY."
                    )
                    continue

                if len(batch_tcs) < max(3, batch_target // 3) and attempt < max_retries - 1:
                    logger.warning(f"  ⚠ Only {len(batch_tcs)}/{batch_target} TCs generated. Retrying...")
                    user_prompt += f"\n\nIMPORTANT: Only {len(batch_tcs)} test cases generated but {batch_target} requested. Generate more test cases covering Security and Boundary types."
                    continue

                break

            except Exception as e:
                logger.warning(f"  ⚠ Batch {batch_idx + 1} attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    logger.error(f"  ✗ Batch {batch_idx + 1} failed after {max_retries} retries")
                    state["warnings"] = state.get("warnings", []) + [f"Batch {batch_idx + 1} failed: {e}"]

        # Assign sequential IDs
        for tc in batch_tcs:
            tc_counter += 1
            tc["test_case_id"] = f"TC-{module_code}-{tc_counter:03d}"
            tc.setdefault("module_code", module_code)
            tc.setdefault("module_name", module_name)
            tc.setdefault("round1_result", "Untested")
            tc.setdefault("round1_date", "")
            tc.setdefault("round1_tester", "")
            tc.setdefault("round2_result", "Untested")
            tc.setdefault("round2_date", "")
            tc.setdefault("round2_tester", "")
            tc.setdefault("round3_result", "Untested")
            tc.setdefault("round3_date", "")
            tc.setdefault("round3_tester", "")
            tc.setdefault("note", "")

        all_test_cases.extend(batch_tcs)
        logger.info(f"  ✓ Batch {batch_idx + 1}: {len(batch_tcs)} TCs generated (total: {len(all_test_cases)})")

    # ── Export to Excel ────────────────────────────────────────────────────
    os.makedirs("mastp_output", exist_ok=True)
    excel_path = f"mastp_output/TC_{module_code}_{module_name.replace(' ', '_').replace('&', 'and')}.xlsx"

    try:
        from mastp.tools.excel_exporter import write_test_cases_to_excel
        write_test_cases_to_excel(all_test_cases, excel_path, module_code, module_name)
        logger.info(f"  💾 Exported {len(all_test_cases)} TCs to {excel_path}")
        state["excel_path"] = excel_path
    except Exception as e:
        logger.error(f"  ✗ Excel export failed: {e}")
        state["warnings"] = state.get("warnings", []) + [f"Excel export failed: {e}"]

    # ── Quality scoring ────────────────────────────────────────────────────
    # 100% if it generated at least 4 test cases per function on average
    expected_minimum = max(len(functions) * 4, 1)
    quality = min(1.0, len(all_test_cases) / expected_minimum)
    logger.info(f"  📊 Quality score: {quality:.2f} ({len(all_test_cases)} TCs generated)")

    state["test_cases"] = all_test_cases
    state["quality_scores"] = {**state.get("quality_scores", {}), "test_case": quality}
    return state
