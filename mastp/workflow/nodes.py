"""
mastp/workflow/nodes.py
LangGraph node implementations for the 3 MVP agents.
"""
from __future__ import annotations

import json
import re
import os
import uuid
import logging
from typing import List, Optional

from mastp.state import MVPState
from mastp.prompts import (
    CODE_ANALYSIS_SYSTEM, CODE_ANALYSIS_USER,
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
        return ChatOpenAI(model=model, temperature=temperature, api_key=api_key, base_url="https://api.x.ai/v1", max_tokens=6000)
    elif "llama" in model.lower() or "groq" in model.lower() or "mixtral" in model.lower():
        from langchain_openai import ChatOpenAI
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            raise EnvironmentError("GROQ_API_KEY not set in environment.")
        return ChatOpenAI(model=model, temperature=temperature, api_key=api_key, base_url="https://api.groq.com/openai/v1", max_tokens=6000)
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

    # ── LLM Analysis ─────────────────────────────────────────────────────
    # Determine base path from source
    base_path_match = re.search(r'@RequestMapping\("([^"]+)"\)', source_code)
    base_path = base_path_match.group(1) if base_path_match else f"/{module_code.lower()}"

    user_prompt = CODE_ANALYSIS_USER.format(
        controller_name=controller_file.replace(".java", ""),
        module_code=module_code,
        module_name=module_name,
        base_url=base_url,
        base_path=base_path,
        source_code=source_code[:8000],  # Truncate for context window
    )

    max_retries = 3
    endpoints = []
    llm = _get_llm(state.get("llm_model"), temperature=0.1, node_type="code_analysis")

    for attempt in range(max_retries):
        try:
            logger.info(f"  📡 LLM call attempt {attempt + 1}/{max_retries}...")
            messages = [
                {"role": "user", "content": f"SYSTEM CONTEXT:\n{CODE_ANALYSIS_SYSTEM}\n\n---\n\n{user_prompt}"}
            ]
            response = llm.invoke(messages)
            result = _extract_json(response.content)
            endpoints = result.get("endpoints", [])

            if len(endpoints) == 0 and attempt < max_retries - 1:
                logger.warning(f"  ⚠ No endpoints extracted on attempt {attempt + 1}. Retrying...")
                user_prompt += "\n\nIMPORTANT: The previous attempt extracted 0 endpoints. Re-examine EVERY @GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PatchMapping annotation in the code."
                continue

            logger.info(f"  ✓ Extracted {len(endpoints)} endpoints")
            break

        except Exception as e:
            logger.warning(f"  ⚠ Attempt {attempt + 1} failed: {e}")
            if attempt == max_retries - 1:
                state["errors"] = state.get("errors", []) + [f"Code analysis LLM failed: {e}"]
                state["endpoints"] = []
                state["quality_scores"] = {**state.get("quality_scores", {}), "code_analysis": 0.0}
                return state

    # ── Quality scoring ───────────────────────────────────────────────────
    # If it extracted at least 1 endpoint successfully, consider it 100% (since some modules are very small)
    quality = 1.0 if len(endpoints) > 0 else 0.0
    logger.info(f"  📊 Quality score: {quality:.2f} ({len(endpoints)} endpoints)")

    state["endpoints"] = endpoints
    state["quality_scores"] = {**state.get("quality_scores", {}), "code_analysis": quality}
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
    endpoints = state.get("endpoints", [])

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
    BATCH_SIZE = 5
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
                        "Replace ALL placeholders with real values: testcustomer@luxeway.vn, P@ssword123!, http://localhost:8080/auth/login"
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
