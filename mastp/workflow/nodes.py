"""
mastp/workflow/nodes.py
LangGraph node implementations for MASTP V3 agents.
"""
from __future__ import annotations

import json
import re
import os
import csv
import uuid
import hashlib
import logging
import platform
import subprocess
from typing import List, Optional
from difflib import SequenceMatcher

from mastp.state import MVPState
from mastp.prompts import (
    CODE_ANALYSIS_SYSTEM, CODE_ANALYSIS_USER,
    BR_EXTRACTION_SYSTEM, BR_EXTRACTION_USER,
    FUNCTION_INVENTORY_SYSTEM, FUNCTION_INVENTORY_USER,
    TEST_CASE_SYSTEM, TEST_CASE_USER,
    TEST_STRATEGY_SYSTEM, TEST_STRATEGY_USER, TARGETED_REPAIR_USER,
    JUNIT_GENERATOR_SYSTEM, JUNIT_GENERATOR_USER,
    SERVICE_BR_EXTRACTION_SYSTEM, SERVICE_BR_EXTRACTION_USER,
)

logger = logging.getLogger("mastp")

# ─── LLM setup ────────────────────────────────────────────────────────────────

import time

def _invoke_with_retry(llm, messages, max_retries=10):
    """Invoke LLM with built-in retry backoff for 429/503 Resource Exhausted errors."""
    for attempt in range(max_retries):
        try:
            return llm.invoke(messages)
        except Exception as e:
            error_str = str(e).lower()
            if "429" in error_str or "resource_exhausted" in error_str or "503" in error_str:
                wait_time = 15
                import re
                match = re.search(r'retry in ([\d\.]+)s', error_str)
                if match:
                    try:
                        wait_time = float(match.group(1)) + 2.0
                    except ValueError:
                        pass
                else:
                    wait_time = 15 * (2 ** attempt)
                
                if attempt < max_retries - 1:
                    logger.warning(f"  ⏳ HTTP 429/503 detected. Backing off for {wait_time:.1f}s (Attempt {attempt+1}/{max_retries})...")
                    time.sleep(wait_time)
                else:
                    raise e
            else:
                raise e

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
        # Disable automatic SDK retries to prevent nested retry explosions
        return ChatGoogleGenerativeAI(model=model, temperature=temperature, google_api_key=api_key, max_retries=0)
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
    elif "deepseek" in model.lower() or "nvidia" in model.lower():
        from langchain_openai import ChatOpenAI
        api_key = os.getenv("NVIDIA_API_KEY", "")
        if not api_key:
            raise EnvironmentError("NVIDIA_API_KEY not set in environment.")
        return ChatOpenAI(
            model=model, 
            temperature=temperature, 
            api_key=api_key, 
            base_url="https://integrate.api.nvidia.com/v1", 
            max_tokens=16384,
            model_kwargs={"extra_body": {"chat_template_kwargs": {"thinking": False}}}
        )
    else:
        raise ValueError(f"Unsupported model: {model}")


# ─── JSON parsing helper ──────────────────────────────────────────────────────

def _extract_json(text) -> dict:
    """Extract JSON from LLM response — handles ```json ... ``` markers and truncated outputs."""
    import json_repair
    
    if isinstance(text, list):
        text = "".join([c.get("text", "") if isinstance(c, dict) else str(c) for c in text])
    elif not isinstance(text, str):
        text = str(text)
        
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
    r"\[.*?\]",               # Catch all [Hành động], [Actor], [Điều kiện]
    r"Xác minh \[.*?\]",      # Catch generic descriptions
    r"\bplaceholder\b",
]

def _has_placeholders(text: str) -> bool:
    """Check if the text contains placeholder values from LLM hallucinations."""
    if not text:
        return False
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


# ─── Production Readiness Helpers (Deduplication & Quality Gate) ───────────────

def _normalize_text(text: str) -> str:
    """Lowercase and remove non-alphanumeric characters for comparison."""
    text = text.lower().strip()
    return re.sub(r"[^a-z0-9\s]", "", text)

def _jaccard_sim(str1: str, str2: str) -> float:
    a = set(str1.split())
    b = set(str2.split())
    if not a or not b: return 0.0
    return len(a.intersection(b)) / len(a.union(b))

def _deduplicate_brs(rules: list[dict]) -> list[dict]:
    """Remove semantic duplicate business rules and merge their sources. (Rule Normalizer)"""
    SEQUENCE_THRESHOLD = 0.85
    JACCARD_THRESHOLD = 0.80
    
    unique_rules = []
    for rule in rules:
        is_dup = False
        desc_norm = _normalize_text(rule.get("description", ""))
        
        # Ensure source is a list
        if not isinstance(rule.get("source"), list):
            rule["source"] = [rule.get("source")] if rule.get("source") else []
            
        for existing in unique_rules:
            # Never merge rules with different priorities
            if rule.get("priority") != existing.get("priority"):
                continue
                
            ex_norm = _normalize_text(existing.get("description", ""))
            
            # Exact Match, Sequence Match, or Jaccard
            seq_ratio = SequenceMatcher(None, desc_norm, ex_norm).ratio()
            jac_ratio = _jaccard_sim(desc_norm, ex_norm)
            
            if desc_norm == ex_norm or seq_ratio >= SEQUENCE_THRESHOLD or jac_ratio >= JACCARD_THRESHOLD:
                is_dup = True
                
                # Merge sources
                for s in rule["source"]:
                    if s and s not in existing.get("source", []):
                        existing.setdefault("source", []).append(s)
                
                # Keep highest confidence
                existing["confidence"] = max(existing.get("confidence", 0.0), rule.get("confidence", 0.0))
                break
                
        if not is_dup:
            unique_rules.append(rule)
            
    return unique_rules

def _evaluate_tc_quality(tc: dict, existing_tcs: list[dict]) -> tuple[int, list[str]]:
    """Evaluate TC quality on a 0-100 scale and return (score, [errors]). (Change Request #3)"""
    score = 0
    errors = []
    
    # 1. Clear action (20)
    procedure = tc.get("test_case_procedure", "")
    lines = [l.strip() for l in procedure.replace("\\n", "\n").split("\n") if l.strip()]
    if len(procedure) >= 15:
        score += 20
    else:
        errors.append("Procedure lacks numbered steps or is too short")
            
    # 2. Expected result (20)
    expected = (tc.get("expected_result") or "").lower()
    has_outcome = any(x in expected for x in ["success", "fail", "error", "true", "false", "thành công", "thất bại", "lỗi", "mã", "200", "400", "401", "403", "404", "409", "500"])
    if len(expected) >= 10 and has_outcome:
        score += 20
    else:
        errors.append("Expected result missing clear outcome")
        
    # 3. Concrete test data (20)
    desc_val = (tc.get("test_case_description") or "")
    proc_val = (tc.get("test_case_procedure") or "")
    pre_val = (tc.get("pre_condition") or "")
    
    if _has_placeholders(desc_val):
        return (0, ["Contains template placeholders"])  # Immediate fail if description is just a template

    if not _has_placeholders(proc_val + "\n" + pre_val):
        text = (proc_val + " " + pre_val).lower()
        has_concrete_value = "@luxeway.vn" in text or re.search(r"\b\d{2,}\b", text) or re.search(r"\b[a-z]+-\d+\b", text)
        if has_concrete_value:
            score += 20
        else:
            errors.append("Lacks concrete test data (e.g. @luxeway.vn, real IDs)")
    else:
        errors.append("Contains template placeholders in procedure/pre-condition")
            
    # 4. Linked Business Rule (20)
    linked = tc.get("linked_br", [])
    if isinstance(linked, list) and len(linked) > 0:
        score += 20
    elif isinstance(linked, str) and len(linked) > 0 and linked.lower() not in ["none", "n/a", "null", "không có", ""]:
        score += 20
    else:
        errors.append("Missing Linked Business Rule")
        
    # 5. Non-duplicate content (20)
    proc_norm = _normalize_text(procedure)
    is_dup = False
    for ex in existing_tcs:
        ex_proc_norm = _normalize_text(ex.get("test_case_procedure", ""))
        if SequenceMatcher(None, proc_norm, ex_proc_norm).ratio() > 0.85:
            is_dup = True
            break
    if not is_dup:
        score += 20
    else:
        errors.append("Duplicate scenario detected")
        
    return score, errors


def _parse_endpoints_statically(source_code: str, base_path: str, module_code: str, module_name: str) -> tuple[list[dict], float]:
    endpoints = []
    confidence = 1.0
    mapping_iter = list(re.finditer(r'@(Get|Post|Put|Delete|Patch)Mapping\s*\(([^)]*)\)', source_code, re.IGNORECASE))
    if not mapping_iter:
        return [], 0.0
        
    for i, match in enumerate(mapping_iter):
        http_method = match.group(1).upper()
        mapping_args = match.group(2)
        
        path_match = re.search(r'["\']([^"\']+)["\']', mapping_args)
        path = path_match.group(1) if path_match else ''
        full_path = (base_path + path).replace('//', '/')
        
        start_idx = match.end()
        end_idx = mapping_iter[i+1].start() if i+1 < len(mapping_iter) else len(source_code)
        method_block = source_code[start_idx:min(start_idx+500, end_idx)]
        
        sig_match = re.search(r'(?:public|protected|private)\s+([\w<>\?,\s\.]+)\s+(\w+)\s*\(([^)]*)\)', method_block)
        if sig_match:
            raw_resp = sig_match.group(1).strip()
            function_name = sig_match.group(2)
            params = sig_match.group(3)
            
            input_dto = 'Unknown'
            req_body_match = re.search(r'@RequestBody\s+(?:@Valid\s+)?([\w\.]+)', params)
            if req_body_match:
                input_dto = req_body_match.group(1)
                
            response_type = raw_resp
            inner_match = re.search(r'ResponseEntity\s*<\s*([\w<>\?,\s\.]+)\s*>', raw_resp)
            if inner_match:
                response_type = inner_match.group(1).strip()
                
            endpoints.append({
                'capability_id': f'CAP-{module_code}-{len(endpoints)+1:03d}',
                'function_id': f'CAP-{module_code}-{len(endpoints)+1:03d}', # Keep for backward compat
                'function_name': function_name,
                'business_name': f'{function_name} in {module_name}',
                'endpoint_method': http_method,
                'endpoint_path': full_path,
                'input_dto': input_dto,
                'response_type': response_type,
                'domain_group': module_name
            })
        else:
            confidence -= 0.1
            
    return endpoints, max(0.0, confidence)

def _classify_risk(endpoints: list[dict]) -> list[dict]:
    """Deterministically tag endpoints with risk categories."""
    for ep in endpoints:
        path = ep.get("endpoint_path", "").lower()
        method = ep.get("endpoint_method", "").upper()
        
        tags = []
        if any(term in path for term in ["login", "register", "auth", "token", "password", "otp", "verify"]):
            tags.append("SECURITY")
            tags.append("IDENTITY")
        if any(term in path for term in ["pay", "checkout", "transaction", "balance", "wallet", "deposit", "withdraw"]):
            tags.append("FINANCIAL")
        if method in ["POST", "PUT", "PATCH", "DELETE"]:
            tags.append("STATE_MUTATION")
            
        if "SECURITY" in tags or "FINANCIAL" in tags:
            ep["risk_level"] = "HIGH"
        elif "STATE_MUTATION" in tags:
            ep["risk_level"] = "MEDIUM"
        else:
            ep["risk_level"] = "LOW"
            
        ep["risk_tags"] = tags
    return endpoints

def _extract_static_rules(source_code: str, file_name: str) -> list[dict]:
    """Statically extract rules from exceptions and validation annotations."""
    rules = []
    
    # Extract exceptions
    throws = re.finditer(r'throw\s+new\s+([A-Za-z]+Exception)\s*\(\s*["\']([^"\']+)["\']', source_code)
    for t in throws:
        exc_type = t.group(1)
        exc_msg = t.group(2)
        rules.append({
            "description": f"Must throw {exc_type} with message '{exc_msg}' when validation fails",
            "source": [file_name],
            "confidence": 1.0,
            "priority": "High" if "Security" in exc_type or "Auth" in exc_type else "Medium"
        })
        
    # Extract annotations with message
    annots = re.finditer(r'@(NotNull|NotBlank|Size|Min|Max|Email|Pattern)\s*\([^)]*message\s*=\s*["\']([^"\']+)["\'][^)]*\)', source_code)
    for a in annots:
        ann_type = a.group(1)
        ann_msg = a.group(2)
        rules.append({
            "description": f"Field validation: {ann_msg} (via @{ann_type})",
            "source": [file_name],
            "confidence": 1.0,
            "priority": "High"
        })
        
    return rules

# ─────────────────────────────────────────────────────────────────────────────
# NODE 1 — Code Analysis Agent (Static Extractor with Fallback)
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

    base_path_match = re.search(r'@RequestMapping\([\'"\s]*([^\'"]+)[\'"]\s*\)', source_code)
    base_path = base_path_match.group(1) if base_path_match else f"/{module_code.lower()}"

    endpoints, parse_confidence = _parse_endpoints_statically(source_code, base_path, module_code, module_name)
    
    if parse_confidence >= 0.85 and len(endpoints) > 0:
        logger.info(f"  ✓ Static Parser extracted {len(endpoints)} capabilities (confidence: {parse_confidence:.2f})")
    else:
        logger.warning(f"  ⚠ Static Parser confidence too low ({parse_confidence:.2f}). Falling back to LLM...")
        
        # ── Context Chunking (Critical Issue #1 fix) ─────────────────────────
        source_chunks = _chunk_source_code(source_code)
        if len(source_chunks) > 1:
            logger.info(f"  📦 Source split into {len(source_chunks)} chunk(s) to prevent context overflow")

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
                    response = _invoke_with_retry(llm, messages)
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
                ep["capability_id"] = f"CAP-{module_code}-{offset + i + 1:03d}"
                if "function_name" not in ep:
                    ep["function_name"] = ep.get("function_id", f"function_{offset + i + 1}")
            all_endpoints.extend(chunk_endpoints)

        endpoints = all_endpoints
        
    endpoints = _classify_risk(endpoints)
    logger.info(f"  ✓ Extracted & Classified {len(endpoints)} capabilities")

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

    static_rules = _extract_static_rules(controller_code, f"{module_code}Controller.java")
    static_rules += _extract_static_rules(service_code, f"{module_code}Service.java")
    logger.info(f"  ✓ Static Extractor found {len(static_rules)} business rules.")

    all_rules = list(static_rules)
    seq_end = 20  # initial target; we collect all rules found

    user_prompt = BR_EXTRACTION_USER.format(
        module_code=module_code,
        module_name=module_name,
        controller_code=controller_excerpt,
        service_code=service_excerpt if service_excerpt else "(No service file found for this module)",
        seq_end=seq_end,
    )

    llm = _get_llm(state.get("llm_model"), temperature=0.1, node_type="br_extraction")
    max_retries = 10

    for attempt in range(max_retries):
        try:
            logger.info(f"  📡 BR LLM call attempt {attempt + 1}/{max_retries}...")
            messages = [
                {"role": "user", "content": f"SYSTEM CONTEXT:\n{BR_EXTRACTION_SYSTEM}\n\n---\n\n{user_prompt}"}
            ]
            response = _invoke_with_retry(llm, messages)
            result   = _extract_json(response.content)
            ai_rules = result.get("business_rules", [])
            
            for r in ai_rules:
                r["confidence"] = 0.8
                r["source"] = [f"{module_code}Controller.java", f"{module_code}Service.java"]
                
            all_rules.extend(ai_rules)

            if not ai_rules and attempt < max_retries - 1:
                logger.warning(f"  ⚠ No AI BRs extracted on attempt {attempt + 1}. Retrying...")
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

    # Deduplication stage
    total_before = len(confirmed)
    confirmed = _deduplicate_brs(confirmed)
    total_after = len(confirmed)
    duplicates_removed = total_before - total_after
    
    if duplicates_removed > 0:
        logger.info(f"  ♻️ Deduplicated {duplicates_removed} business rules")
    
    state["metrics"] = state.get("metrics", {})
    state["metrics"]["total_rules_before_dedup"] = total_before
    state["metrics"]["total_rules_after_dedup"] = total_after
    state["metrics"]["duplicate_rules_removed"] = duplicates_removed

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
    Build unified Capability Inventory from endpoint analysis (Deterministic).
    """
    logger.info("📦 [CAPABILITY INVENTORY] Building inventory...")
    state = dict(state)
    state["current_node"] = "function_inventory"

    module_code = state["module_code"]
    module_name = state["module_name"]
    endpoints   = state.get("endpoints", [])
    business_rules = state.get("business_rules", [])

    if not endpoints:
        logger.warning("  ⚠ No endpoints to process. Generating minimal inventory.")
        state["functions"] = []
        state["quality_scores"] = {**state.get("quality_scores", {}), "function_inventory": 0.0}
        return state

    functions = []
    for ep in endpoints:
        func = {
            "function_id": ep.get("capability_id", ep.get("endpoint_id", f"CAP-{module_code}-000")),
            "capability_id": ep.get("capability_id", ep.get("endpoint_id", f"CAP-{module_code}-000")),
            "module_code": module_code,
            "module_name": module_name,
            "function_name": ep.get("business_name", ep.get("function_name", "Unknown")),
            "description": f"{ep.get('endpoint_method')} {ep.get('endpoint_path')}",
            "priority": "High" if ep.get("risk_level") == "HIGH" else "Medium",
            "complexity": "Medium",
            "risk_level": ep.get("risk_level", "LOW"),
            "risk_tags": ep.get("risk_tags", []),
            "technical_mapping": {
                "endpoint_method": ep.get("endpoint_method"),
                "endpoint_path": ep.get("endpoint_path"),
                "input_dto": ep.get("input_dto"),
                "response_type": ep.get("response_type")
            },
            # For MVP, loosely link all BRs to the module. A refined semantic search can be added later.
            "linked_br": [br["br_id"] for br in business_rules] 
        }
        functions.append(func)

    logger.info(f"  ✓ Mapped {len(functions)} Capabilities deterministically")
    
    state["functions"] = functions
    state["quality_scores"] = {**state.get("quality_scores", {}), "function_inventory": 1.0}
    return state


# ─────────────────────────────────────────────────────────────────────────────
# NODE 2.5 — Test Strategy Agent (Agent 06)
# ─────────────────────────────────────────────────────────────────────────────

def test_strategy_node(state: MVPState) -> MVPState:
    """
    Generate Coverage Matrix based on Capability Inventory and Risk Tags.
    """
    logger.info("🧠 [TEST STRATEGY] Generating Coverage Matrix...")
    state = dict(state)
    state["current_node"] = "test_strategy"
    
    module_code = state["module_code"]
    functions = state.get("functions", [])
    
    if not functions:
        state["coverage_matrix"] = {}
        return state

    user_prompt = TEST_STRATEGY_USER.format(
        module_code=module_code,
        target_count=len(functions),
        capabilities_json=json.dumps(functions, indent=2)
    )

    llm = _get_llm(state.get("llm_model"), temperature=0.1, node_type="test_strategy")
    max_retries = 3
    coverage_matrix = {}

    for attempt in range(max_retries):
        try:
            logger.info(f"  📡 Strategy LLM call attempt {attempt + 1}/{max_retries}...")
            messages = [
                {"role": "user", "content": f"SYSTEM CONTEXT:\n{TEST_STRATEGY_SYSTEM}\n\n---\n\n{user_prompt}"}
            ]
            response = _invoke_with_retry(llm, messages)
            result = _extract_json(response.content)
            matrix_list = result.get("coverage_matrix", [])
            
            if not matrix_list and attempt < max_retries - 1:
                logger.warning("  ⚠ Matrix was empty. Retrying...")
                continue
                
            # Convert list to dict keyed by capability_id
            for m in matrix_list:
                cap_id = m.get("capability_id")
                if cap_id:
                    coverage_matrix[cap_id] = m
            
            break

        except Exception as e:
            logger.warning(f"  ⚠ Strategy Attempt {attempt + 1} failed: {e}")
            if attempt == max_retries - 1:
                state["errors"] = state.get("errors", []) + [f"Strategy LLM failed: {e}"]

    state["coverage_matrix"] = coverage_matrix
    logger.info(f"  ✓ Coverage Matrix generated for {len(coverage_matrix)} capabilities.")
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

    # Process in batches based on function complexity
    # Groq Llama 3 8B tends to ignore instructions if there are too many functions in one prompt.
    # Dynamic batching groups 2-5 functions together to minimize requests while keeping accuracy.
    func_batches = []
    current_batch = []
    current_complexity = 0
    
    for f in functions:
        risk = f.get("risk_level", "Low")
        comp_score = 3 if risk == "Critical" else (2 if risk == "High" else 1)
        
        # Max 5 functions per batch, or cut off early if cumulative complexity > 6
        if len(current_batch) >= 5 or (current_complexity + comp_score > 6 and current_batch):
            func_batches.append(current_batch)
            current_batch = []
            current_complexity = 0
            
        current_batch.append(f)
        current_complexity += comp_score
        
    if current_batch:
        func_batches.append(current_batch)

    all_test_cases = []
    tc_counter = 0
    llm = _get_llm(state.get("llm_model"), temperature=0.3, node_type="test_case")

    for batch_idx, func_batch in enumerate(func_batches):
        batch_target = 0
        for f in func_batch:
            batch_target += f.get("estimated_tcs", 10)
            
        logger.info(f"  📡 Batch {batch_idx + 1}/{len(func_batches)}: {len(func_batch)} functions → ~{batch_target} TCs")

        # Extract BR summary again for Test Case Generator
        business_rules = state.get("business_rules", [])
        if business_rules:
            br_lines = [f"  - [{r['priority']}] {r['description']} (br_id: {r['br_id']})" for r in business_rules]
            business_rules_text = "\n".join(br_lines)
        else:
            business_rules_text = "(No business rules extracted for this module)"

        coverage_matrix = state.get("coverage_matrix", {})
        batch_matrix = []
        for f in func_batch:
            cid = f.get("capability_id")
            if cid and cid in coverage_matrix:
                batch_matrix.append(coverage_matrix[cid])
                
        user_prompt = TEST_CASE_USER.format(
            module_code=module_code,
            module_name=module_name,
            functions_json=json.dumps(func_batch, indent=2),
            business_rules_text=business_rules_text,
            target_count=batch_target,
            function_count=len(func_batch),
            seq_end=tc_counter + batch_target,
            coverage_matrix_text=json.dumps(batch_matrix, indent=2) if batch_matrix else "[]",
        )

        max_retries = 3
        valid_tcs_accumulated = []
        import time
        backoff_delays = [2, 5, 10]
        
        current_prompt = user_prompt

        for attempt in range(max_retries):
            try:
                messages = [
                    {"role": "user", "content": f"SYSTEM CONTEXT:\n{TEST_CASE_SYSTEM}\n\n---\n\n{current_prompt}"}
                ]
                
                # API 503 Retry Wrapper (Independent from Logic Retries)
                response = None
                for api_attempt in range(4):
                    try:
                        response = _invoke_with_retry(llm, messages)
                        break
                    except Exception as api_err:
                        if "503" in str(api_err) and api_attempt < 3:
                            delay = backoff_delays[api_attempt]
                            logger.info(f"  ⏳ HTTP 503 detected on API call. Backing off for {delay} seconds...")
                            time.sleep(delay)
                        else:
                            raise api_err
                
                result = _extract_json(response.content)
                batch_tcs_raw = result.get("test_cases", [])

                # Quality Gate (Change Request #3 & #4)
                low_quality_count = 0
                error_reasons = {}
                
                for tc in batch_tcs_raw:
                    if not isinstance(tc, dict):
                        continue
                    score, errors = _evaluate_tc_quality(tc, all_test_cases + valid_tcs_accumulated)
                    tc["quality_score"] = score
                    if score >= 80:
                        valid_tcs_accumulated.append(tc)
                    else:
                        low_quality_count += 1
                        for err in errors:
                            error_reasons[err] = error_reasons.get(err, 0) + 1
                            
                    if attempt == max_retries - 1 and score < 80:
                        tc["note"] = f"[MANUAL REVIEW REQUIRED] Low Quality Score ({score})"
                        valid_tcs_accumulated.append(tc)
                
                state["metrics"] = state.get("metrics", {})
                state["metrics"]["low_quality_tc_count"] = state["metrics"].get("low_quality_tc_count", 0) + low_quality_count

                if attempt < max_retries - 1 and len(batch_tcs_raw) > 0:
                    logger.warning(f"\n  [Quality Gate Result - Attempt {attempt+1}]")
                    logger.warning(f"  Generated: {len(batch_tcs_raw)}")
                    logger.warning(f"  PASS: {len(batch_tcs_raw) - low_quality_count}")
                    logger.warning(f"  FAIL: {low_quality_count}")
                    if error_reasons:
                        logger.warning(f"  Reasons:")
                        for err, count in error_reasons.items():
                            logger.warning(f"  - {err}: {count}")

                # Layer 1 Quality Gate: Coverage Matrix Fulfillment
                missing_coverage = []
                missing_summary = {}
                existing_summary = {"happy": 0, "negative": 0, "security": 0, "boundary": 0}

                for m in batch_matrix:
                    cid = m.get("capability_id") or m.get("Capability_ID")
                    
                    # Fuzzy key extraction for min_reqs
                    min_reqs = {}
                    for k, v in m.items():
                        if "minimum" in k.lower() or "quotas" in k.lower():
                            if isinstance(v, dict):
                                min_reqs = {rk.lower(): rv for rk, rv in v.items()}
                                break
                    
                    # Fallback default if LLM failed to output coverage_minimum
                    if not min_reqs:
                        min_reqs = {"happy": 1, "negative": 1, "security": 1, "boundary": 0}
                        
                    counts = {"happy": 0, "negative": 0, "security": 0, "boundary": 0}
                    for tc in valid_tcs_accumulated:
                        if tc.get("function_id") == cid or tc.get("capability_id") == cid:
                            t_type = tc.get("test_case_type", "").lower()
                            if "positive" in t_type or "happy" in t_type: counts["happy"] += 1
                            elif "negative" in t_type: counts["negative"] += 1
                            elif "security" in t_type: counts["security"] += 1
                            elif "boundary" in t_type: counts["boundary"] += 1
                    
                    for qt, count in counts.items():
                        existing_summary[qt] += count

                    missing_for_cid = {}
                    for qt, req in min_reqs.items():
                        if counts[qt] < req:
                            missing_for_cid[qt] = req - counts[qt]
                            missing_coverage.append(f"{cid} ({req - counts[qt]} {qt})")
                            
                    if missing_for_cid:
                        missing_summary[cid] = missing_for_cid
                            
                if missing_coverage and attempt < max_retries - 1:
                    logger.warning(f"  ⚠ Coverage Matrix unfulfilled: {', '.join(missing_coverage)}. Triggering TARGETED REPAIR...")
                    
                    # Switch to Targeted Repair Prompt
                    current_prompt = TARGETED_REPAIR_USER.format(
                        module_code=module_code,
                        missing_coverage_json=json.dumps(missing_summary, indent=2),
                        functions_json=json.dumps(func_batch, indent=2),
                        business_rules_text=business_rules_text,
                        existing_summary_json=json.dumps(existing_summary, indent=2),
                        existing_count=len(valid_tcs_accumulated)
                    )
                    continue

                break

            except Exception as e:
                logger.warning(f"  ⚠ Batch {batch_idx + 1} attempt {attempt + 1} failed logic gate: {e}")
                if attempt == max_retries - 1:
                    logger.error(f"  ✗ Batch {batch_idx + 1} failed after {max_retries} attempts")
                    state["warnings"] = state.get("warnings", []) + [f"Batch {batch_idx + 1} failed: {e}"]

        batch_tcs = valid_tcs_accumulated

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
    import time
    ts = int(time.time())
    excel_path = f"mastp_output/TC_{module_code}_{module_name.replace(' ', '_').replace('&', 'and')}_{ts}.xlsx"

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

    # ── Coverage Metrics ───────────────────────────────────────────────────
    covered_brs = set()
    for tc in all_test_cases:
        linked = tc.get("linked_br", [])
        if isinstance(linked, list):
            covered_brs.update(linked)
        elif isinstance(linked, str):
            covered_brs.update([b.strip() for b in linked.split(",") if b.strip()])
            
    all_br_ids = set(r.get("br_id") for r in state.get("business_rules", []))
    uncovered_rules = list(all_br_ids - covered_brs)
    
    state["metrics"] = state.get("metrics", {})
    state["metrics"]["covered_business_rules"] = len(covered_brs.intersection(all_br_ids))
    state["metrics"]["uncovered_rules"] = uncovered_rules

    state["test_cases"] = all_test_cases
    state["quality_scores"] = {**state.get("quality_scores", {}), "test_case": quality}
    return state


# ─────────────────────────────────────────────────────────────────────────────
# NODE 4 — Service Inventory Builder (V3 Phase 1, Pure Static)
# ─────────────────────────────────────────────────────────────────────────────

def service_inventory_node(state: MVPState) -> MVPState:
    """
    Phase 1 (Static, 0 LLM calls):
    Extract @Service class inventory with structured parameter schema.
    Outputs: state["service_inventory"]
    """
    logger.info("🔬 [SERVICE INVENTORY] Static extraction of @Service classes...")
    state = dict(state)
    state["current_node"] = "service_inventory"

    from mastp.tools.service_parser import parse_service_directory, ServiceMethodParam
    source_root = state["source_root"]
    module_code = state["module_code"]
    service_dir = os.path.join(source_root, "service")

    parsed_services = parse_service_directory(service_dir)

    controller_file = state.get("controller_file", "")
    relevant = []
    if controller_file.endswith("Controller.java"):
        prefix = controller_file.replace("Controller.java", "").lower()
        relevant = [s for s in parsed_services if s.class_name.lower().startswith(prefix)]
    
    if not relevant:
        module_lower = module_code.lower()
        relevant = [s for s in parsed_services if module_lower in s.class_name.lower()]

    if not relevant:
        logger.warning(f"Could not find exact service match for {controller_file}. Falling back to processing all services.")
        relevant = parsed_services

    inventory = []
    for svc in relevant:
        # Serialize structured params (Issue 3: name+type, not raw strings)
        serialized_methods = []
        for m in svc.methods:
            params_serialized = [
                {"name": p.name, "type": p.type}
                if hasattr(p, "name") else {"name": "param", "type": str(p)}
                for p in m.parameters
            ]
            serialized_methods.append({
                "method_name": m.method_name,
                "return_type": m.return_type,
                "parameters": params_serialized,
                "throws": m.throws,
                "is_transactional": m.is_transactional,
                "body_snippet": m.body_snippet[:500],
            })

        inventory.append({
            "class_name": svc.class_name,
            "package": svc.package,
            "dependencies": [{"type": d.type, "field": d.field} for d in svc.dependencies],
            "methods": serialized_methods,
            "source_file": svc.source_file,
            "source_code": svc.source_code,
        })

    logger.info(f"  ✓ Service Inventory: {len(inventory)} class(es) extracted")
    state["service_inventory"] = inventory
    return state


# ─────────────────────────────────────────────────────────────────────────────
# NODE 4b — Service Business Rule Extraction (Issue 1)
# 1 LLM request per @Service class — extracts method-level BRs for JUnit
# ─────────────────────────────────────────────────────────────────────────────

def service_br_extraction_node(state: MVPState) -> MVPState:
    """
    For each @Service class, call LLM ONCE to extract method-level Business Rules.

    Budget: 1 req per service class (50 classes = 50 requests).
    Output: state["service_business_rules"] = [{class_name, service_rules: [...]}]
    """
    logger.info("📐 [SERVICE BR] Extracting per-service Business Rules...")
    state = dict(state)
    state["current_node"] = "service_br_extraction"

    service_inventory = state.get("service_inventory") or []
    if not service_inventory:
        logger.warning("  ⚠ No service inventory found. Skipping Service BR extraction.")
        state["service_business_rules"] = []
        return state

    llm = _get_llm(state.get("llm_model"), temperature=0.1, node_type="service_br_extraction")
    all_service_rules: list[dict] = []

    for svc in service_inventory:
        class_name = svc["class_name"]
        methods = svc.get("methods", [])
        source_code = svc.get("source_code", "")

        # Build compact method summary for prompt
        methods_summary = "\n".join([
            f"  - {m['method_name']}({', '.join(p['type'] + ' ' + p['name'] for p in m.get('parameters', []))})"
            f" : {m['return_type']}"
            f"{' [throws ' + ', '.join(m['throws']) + ']' if m.get('throws') else ''}"
            for m in methods
        ])

        # Trim source code to 3000 chars to stay within token budget
        trimmed_source = source_code[:3000] if source_code else "(source not available)"

        user_prompt = SERVICE_BR_EXTRACTION_USER.format(
            class_name=class_name,
            package=svc["package"],
            methods_summary=methods_summary,
            source_code=trimmed_source,
        )

        logger.info(f"  📡 BR extraction LLM call: {class_name}...")
        try:
            messages = [
                {"role": "user", "content": (
                    f"SYSTEM CONTEXT:\n{SERVICE_BR_EXTRACTION_SYSTEM}\n\n---\n\n{user_prompt}"
                )}
            ]
            response = _invoke_with_retry(llm, messages)
            raw = response.content
            if isinstance(raw, list):
                raw = "".join(
                    block.get("text", "") if isinstance(block, dict) else str(block) 
                    for block in raw
                )
            elif not isinstance(raw, str):
                raw = str(raw)

            # Parse JSON from ```json ... ``` fence
            json_match = re.search(r'```json\s*([\s\S]+?)\s*```', raw)
            if json_match:
                data = json.loads(json_match.group(1))
            else:
                # Try parsing raw as JSON directly
                data = json.loads(raw.strip())

            service_rules = data.get("service_rules", [])

            # Assign sequential IDs if missing
            for i, rule in enumerate(service_rules, 1):
                if not rule.get("rule_id"):
                    rule["rule_id"] = f"SBR-{class_name}-{i:03d}"

            all_service_rules.append({
                "class_name": class_name,
                "service_rules": service_rules,
            })
            logger.info(f"  ✓ {class_name}: {len(service_rules)} service rule(s) extracted")

        except json.JSONDecodeError as e:
            logger.warning(f"  ⚠ JSON parse failed for {class_name}: {e} — skipping BR extraction")
            all_service_rules.append({"class_name": class_name, "service_rules": []})
        except Exception as e:
            logger.error(f"  ✗ BR extraction failed for {class_name}: {e}")
            all_service_rules.append({"class_name": class_name, "service_rules": []})

    state["service_business_rules"] = all_service_rules
    total_rules = sum(len(x["service_rules"]) for x in all_service_rules)
    logger.info(f"  ✓ Service BR extraction complete: {total_rules} rules across {len(all_service_rules)} class(es)")
    return state


# ─────────────────────────────────────────────────────────────────────────────
# Assertion Quality Gate Helpers
# ─────────────────────────────────────────────────────────────────────────────

_ASSERTION_PATTERNS = [
    r'\bassertEquals\s*\(',
    r'\bassertNotNull\s*\(',
    r'\bassertNull\s*\(',
    r'\bassertTrue\s*\(',
    r'\bassertFalse\s*\(',
    r'\bassertThrows\s*\(',
    r'\bassertThat\s*\(',
    r'\bassertSame\s*\(',
    r'\bassertNotSame\s*\(',
    r'\bverify\s*\(',
]


def _count_assertions(java_source: str) -> dict:
    """Count assertions per @Test method. Returns {method_name: count}."""
    results = {}
    test_blocks = re.split(r'@Test\b', java_source)
    for i, block in enumerate(test_blocks[1:], 1):
        name_match = re.search(r'void\s+(\w+)\s*\(', block)
        method_name = name_match.group(1) if name_match else f"test_{i}"
        count = sum(len(re.findall(p, block)) for p in _ASSERTION_PATTERNS)
        results[method_name] = count
    return results


def _validate_assertions(java_source: str, class_name: str) -> tuple[bool, list[str]]:
    """Check every @Test has at least 1 assertion. Returns (valid, warnings)."""
    counts = _count_assertions(java_source)
    warnings = [
        f"{class_name}.{m}: ZERO assertions — no validation in this test"
        for m, c in counts.items() if c == 0
    ]
    return len(warnings) == 0, warnings


# ─────────────────────────────────────────────────────────────────────────────
# Template Engine — Java Test Class Scaffold (Issue 4)
# Python generates the boilerplate; LLM only fills @Test bodies
# ─────────────────────────────────────────────────────────────────────────────

# Standard imports that cover 95% of use cases in Spring Boot service tests
_JUNIT_FIXED_IMPORTS = [
    "import org.junit.jupiter.api.Test;",
    "import org.junit.jupiter.api.DisplayName;",
    "import org.junit.jupiter.api.extension.ExtendWith;",
    "import org.mockito.InjectMocks;",
    "import org.mockito.Mock;",
    "import org.mockito.junit.jupiter.MockitoExtension;",
    "import org.mockito.ArgumentCaptor;",
    "import static org.junit.jupiter.api.Assertions.*;",
    "import static org.mockito.ArgumentMatchers.*;",
    "import static org.mockito.Mockito.*;",
    "import java.util.Optional;",
    "import java.util.List;",
    "import java.util.Collections;",
    "import java.math.BigDecimal;",
]


def _build_test_class_scaffold(svc: dict, llm_output: str) -> str:
    """
    Build the Java test class boilerplate DETERMINISTICALLY from service inventory.
    Python controls: package, imports, @ExtendWith, @Mock fields, @InjectMocks.
    LLM only generates: the @Test method bodies ({{TEST_METHODS}} placeholder).
    """
    class_name = svc["class_name"]
    package = svc["package"]
    deps = svc.get("dependencies", [])

    # @Mock fields — dynamic injection based on usage in LLM output
    mock_fields_list = []
    for d in deps:
        if d['field'] in llm_output:
            mock_fields_list.append(f"    @Mock\n    private {d['type']} {d['field']};")
    mock_fields = "\n\n".join(mock_fields_list)
    # camelCase instance name for @InjectMocks
    instance_name = class_name[0].lower() + class_name[1:]

    imports_block = "\n".join(_JUNIT_FIXED_IMPORTS)

    return (
        f"package {package};\n\n"
        f"{imports_block}\n\n"
        f"@ExtendWith(MockitoExtension.class)\n"
        f"class {class_name}Test {{\n\n"
        f"{mock_fields}\n\n"
        f"    @InjectMocks\n"
        f"    private {class_name} {instance_name};\n\n"
        f"    // ── GENERATED TEST METHODS ─────────────────────────────────────────\n"
        f"{{TEST_METHODS}}\n"
        f"}}\n"
    )


# ─────────────────────────────────────────────────────────────────────────────
# NODE 5 — JUnit Generator Agent (Template Engine — Issue 4)
# Budget: 1 request per @Service class
# ─────────────────────────────────────────────────────────────────────────────

def junit_generator_node(state: MVPState) -> MVPState:
    """
    Template Engine approach (Issue 4):
      1. Python builds class scaffold (package + imports + @Mock + @InjectMocks).
      2. LLM generates ONLY the @Test method bodies.
      3. Python assembles final .java file: scaffold.replace({TEST_METHODS}, llm_output).
      4. Python Assertion Quality Gate validates the assembled file.
    """
    logger.info("⚗️  [JUNIT GENERATOR] Building test classes (Template Engine)...")
    state = dict(state)
    state["current_node"] = "junit_generator"

    service_inventory = state.get("service_inventory") or []
    service_br_rules = state.get("service_business_rules") or []

    if not service_inventory:
        logger.warning("  ⚠ No service inventory. Skipping JUnit generation.")
        state["generated_junit_files"] = []
        state["junit_metadata"] = []
        return state

    # Build BR lookup: class_name → list of service_rules
    sbr_by_class: dict[str, list[dict]] = {
        r["class_name"]: r.get("service_rules", [])
        for r in service_br_rules
    }

    output_dir = os.path.join("mastp_output", "junit")
    os.makedirs(output_dir, exist_ok=True)

    llm = _get_llm(state.get("llm_model"), temperature=0.2, node_type="junit_generator")
    generated_files: list[str] = []
    junit_metadata: list[dict] = []

    for svc in service_inventory:
        class_name = svc["class_name"]

        # Filter out DTO-mapping helpers
        testable_methods = [
            m for m in svc.get("methods", [])
            if not re.match(r'^(to|map|build|from)[A-Z]', m["method_name"])
        ]
        if not testable_methods:
            logger.info(f"  ↳ Skipping {class_name}: no testable public methods.")
            continue

        # Build mock field names text for LLM context
        mock_fields_text = "\n".join(
            f"  - {d['type']} {d['field']}"
            for d in svc.get("dependencies", [])
        ) or "  (no dependencies)"

        # Format service BRs for LLM prompt
        class_rules = sbr_by_class.get(class_name, [])
        if class_rules:
            rules_lines = [
                f"  [{r.get('rule_id', '?')}] {r.get('method_name', '?')}(): "
                f"{r.get('description', '')} | confidence={r.get('confidence', 0.8)}\n"
                f"    + Positive: {r.get('test_scenario_positive', 'verify success')}\n"
                f"    - Negative: {r.get('test_scenario_negative', 'verify exception')}"
                for r in class_rules
            ]
            service_rules_text = "\n".join(rules_lines)
        else:
            service_rules_text = (
                "(No specific business rules extracted. "
                "Generate standard happy-path and not-found tests for each method.)"
            )

        # Format methods for LLM — compact but structured
        methods_for_prompt = [
            {
                "method_name": m["method_name"],
                "return_type": m["return_type"],
                "parameters": m.get("parameters", []),
                "throws": m.get("throws", []),
            }
            for m in testable_methods
        ]

        user_prompt = JUNIT_GENERATOR_USER.format(
            class_name=class_name,
            mock_fields_text=mock_fields_text,
            methods_json=json.dumps(methods_for_prompt, indent=2),
            service_rules_text=service_rules_text,
        )

        logger.info(f"  📡 JUnit LLM call: {class_name} ({len(class_rules)} SBRs, {len(testable_methods)} methods)...")
        try:
            messages = [
                {"role": "user", "content": (
                    f"SYSTEM CONTEXT:\n{JUNIT_GENERATOR_SYSTEM}\n\n---\n\n{user_prompt}"
                )}
            ]
            
            max_agent_retries = 3
            quality_report = {}
            java_code = ""
            
            for attempt in range(1, max_agent_retries + 1):
                response = _invoke_with_retry(llm, messages)
                llm_output = response.content
                if isinstance(llm_output, list):
                    llm_output = "".join(
                        block.get("text", "") if isinstance(block, dict) else str(block) 
                        for block in llm_output
                    )
                elif not isinstance(llm_output, str):
                    llm_output = str(llm_output)

                llm_output = re.sub(r'^```(?:java)?\s*', '', llm_output, flags=re.MULTILINE)
                llm_output = re.sub(r'```\s*$', '', llm_output, flags=re.MULTILINE)
                if re.search(r'^\s*(?:package|import|@ExtendWith|class\s+\w+)', llm_output, re.MULTILINE):
                    body_match = re.search(r'class\s+\w+\s*\{([\s\S]+)\}\s*$', llm_output)
                    if body_match:
                        llm_output = body_match.group(1)
                    llm_output = re.sub(r'\s*@(?:Mock|InjectMocks)[^\n]*\n[^\n]*\n', '', llm_output)
                llm_output = llm_output.strip()

                scaffold = _build_test_class_scaffold(svc, llm_output)
                java_code = scaffold.replace(
                    "{TEST_METHODS}",
                    "\n" + _indent(llm_output, 4) + "\n"
                )

                # Evaluate Quality Gate
                quality = _evaluate_test_quality(java_code, class_name)
                quality_report = {
                    "service": class_name,
                    "generation": {"attempts": attempt},
                    "quality_score": quality["score"],
                    "status": "PASS" if quality["passed"] else "FAIL",
                    "hard_failures": quality["hard_failures"],
                    "violations": quality["violations"],
                    "metrics": quality["metrics"]
                }
                
                if quality["passed"]:
                    logger.info(f"  ✓ Quality Gate PASS for {class_name} on attempt {attempt} (Score: {quality['score']})")
                    break
                else:
                    logger.warning(f"  ⚠ Quality Gate FAIL for {class_name} on attempt {attempt} (Score: {quality['score']})")
                    if attempt < max_agent_retries:
                        feedback_msg = "QUALITY GATE FAILED\n\nViolations:\n"
                        for hf in quality["hard_failures"]:
                            feedback_msg += f"- HARD FAILURE: {hf}\n"
                        for v in quality["violations"]:
                            feedback_msg += f"- PENALTY {v['penalty']}: {v['rule']}\n"
                        feedback_msg += "\nRequired fix: Address all violations. Ensure persistence layers use ArgumentCaptor. Do not use LENIENT. Add assertions. Return the corrected @Test methods ONLY."
                        
                        messages.append({"role": "assistant", "content": "Assistant generated invalid code:\n" + llm_output})
                        messages.append({"role": "user", "content": feedback_msg})
                    else:
                        logger.error(f"  ✗ Max retries exhausted for {class_name}. Proceeding with sub-optimal code.")

            # Save quality report
            report_dir = os.path.join("mastp_output", "quality_reports")
            os.makedirs(report_dir, exist_ok=True)
            with open(os.path.join(report_dir, f"{class_name}_quality.json"), "w", encoding="utf-8") as f:
                json.dump(quality_report, f, indent=2)

            # ── Write to disk ─────────────────────────────────────────────────
            out_path = os.path.join(output_dir, f"{class_name}Test.java")
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(java_code)

            generated_files.append(out_path)
            logger.info(f"  ✓ Written: {out_path} ({len(java_code)} chars)")

            # ── Extract @DisplayName → traceability mapping ───────────────────
            # Match both BR-XX and SBR-XX patterns
            for m in re.finditer(
                r'@DisplayName\("((?:SBR|BR)-[\w-]+):\s*([^"]+)"\)\s*@Test[\s\S]{0,300}?void\s+(\w+)',
                java_code
            ):
                rule_id, desc, test_method = m.group(1), m.group(2), m.group(3)
                junit_metadata.append({
                    "ut_id": f"UT-{class_name}-{test_method}",
                    "class_name": class_name,
                    "method_name": test_method,
                    "rule_id": rule_id,
                    "display_name": f"{rule_id}: {desc}",
                })

        except Exception as e:
            logger.error(f"  ✗ JUnit generation failed for {class_name}: {e}")
            state.setdefault("errors", []).append(f"JUnit failed: {class_name}: {e}")
            continue

    state["generated_junit_files"] = generated_files
    state["junit_metadata"] = junit_metadata
    logger.info(
        f"  ✓ JUnit generation complete: {len(generated_files)} files, "
        f"{len(junit_metadata)} test methods mapped"
    )
    return state


def _indent(text: str, spaces: int) -> str:
    """Indent all non-empty lines of text by N spaces."""
    pad = " " * spaces
    return "\n".join(pad + line if line.strip() else line for line in text.splitlines())


# ─────────────────────────────────────────────────────────────────────────────
# NODE 6 — Compile Validation (Issue 6: ONLY test-compile, separate from test run)
# ─────────────────────────────────────────────────────────────────────────────

def _get_mvn_command(project_root: str) -> str:
    """Prefer mvnw/mvnw.cmd wrapper over global mvn."""
    if platform.system() == "Windows":
        wrapper = os.path.join(project_root, "mvnw.cmd")
        return wrapper if os.path.exists(wrapper) else "mvn"
    wrapper = os.path.join(project_root, "mvnw")
    return wrapper if os.path.exists(wrapper) else "mvn"


def compile_validation_node(state: MVPState) -> MVPState:
    """
    Step 1 of 2 for Maven execution (Issue 6).
    ONLY runs mvn test-compile — catches import/symbol errors.
    mvn test (runtime errors) is handled in jacoco_node.

    Also auto-patches pom.xml with JaCoCo/Mockito if needed.
    """
    logger.info("🔨 [COMPILE VALIDATION] Step 1/2 — mvn test-compile...")
    state = dict(state)
    state["current_node"] = "compile_validation"

    generated_files = state.get("generated_junit_files") or []
    if not generated_files:
        logger.warning("  ⚠ No generated JUnit files to compile. Skipping.")
        state["compile_results"] = []
        return state

    source_root = state.get("source_root", "")
    project_root = state.get("project_root")
    if not project_root:
        normalized_root = source_root.replace("\\", "/")
        if "src/main" in normalized_root:
            project_root = normalized_root.split("src/main")[0]
        else:
            project_root = normalized_root.split("src")[0]

    # ── Auto-patch pom.xml (idempotent) ──────────────────────────────────────
    logger.info("  🔧 Checking pom.xml configuration...")
    try:
        from mastp.tools.pom_patcher import ensure_jacoco_configured
        patch_result = ensure_jacoco_configured(project_root)
        if patch_result.get("error"):
            logger.warning(f"  ⚠ pom_patcher: {patch_result['error']}")
        elif patch_result.get("already_configured"):
            logger.info("  ✓ pom.xml already configured (JaCoCo + Mockito present)")
        elif patch_result.get("patched"):
            for ch in patch_result.get("changes", []):
                logger.info(f"  + pom.xml patched: {ch}")
    except Exception as e:
        logger.warning(f"  ⚠ pom_patcher unavailable: {e}")

    mvn_cmd = _get_mvn_command(project_root)
    logger.info(f"  ✓ Maven command: {mvn_cmd}")

    # ── Run test-compile ONLY ─────────────────────────────────────────────────
    try:
        result = subprocess.run(
            [mvn_cmd, "test-compile", "-q"],
            cwd=project_root,
            capture_output=True,
            text=True,
            timeout=120,
        )
        compile_ok = result.returncode == 0
        compile_output = result.stderr or result.stdout
    except subprocess.TimeoutExpired:
        compile_ok = False
        compile_output = "Maven test-compile timed out after 120s"
        logger.error(f"  ✗ {compile_output}")
    except FileNotFoundError:
        compile_ok = False
        compile_output = f"Maven command not found: {mvn_cmd}"
        logger.error(f"  ✗ {compile_output}")

    compile_results = []
    for java_file in generated_files:
        class_name = os.path.basename(java_file).replace(".java", "")
        if compile_ok:
            status = "PASS"
            error_log = ""
            logger.info(f"  ✓ COMPILE PASS: {class_name}")
        elif class_name in compile_output:
            status = "COMPILE_ERROR"
            error_log = compile_output[:500]
            logger.warning(f"  ✗ COMPILE_ERROR: {class_name}")
        else:
            status = "COMPILE_ERROR"
            error_log = compile_output[:200]
            logger.warning(f"  ✗ COMPILE_ERROR (global): {class_name}")

        compile_results.append({
            "class_name": class_name,
            "java_file": java_file,
            "status": status,
            "error_log": error_log,
        })

    passed = sum(1 for r in compile_results if r["status"] == "PASS")
    failed = len(compile_results) - passed
    logger.info(f"  📊 Compile: {passed} PASS | {failed} COMPILE_ERROR (NO AI retry)")

    state["compile_results"] = compile_results
    return state


# ─────────────────────────────────────────────────────────────────────────────
# NODE 7 — JaCoCo Runner (Issue 6: Step 2/2 — mvn test; Issue 7: simple CSV output)
# ─────────────────────────────────────────────────────────────────────────────

def jacoco_node(state: MVPState) -> MVPState:
    """
    Step 2 of 2 for Maven execution (Issue 6).
    Runs mvn test (runtime errors) + jacoco:report.
    Only executes if at least 1 class passed compile.

    Issue 7 — Simple CSV output:
    {class_name, line_coverage (%), branch_coverage (%), coverage_status: PASS/PARTIAL/FAIL}
    """
    logger.info("📊 [JACOCO] Step 2/2 — mvn test + jacoco:report...")
    state = dict(state)
    state["current_node"] = "jacoco"

    compile_results = state.get("compile_results") or []
    passed = [r for r in compile_results if r["status"] == "PASS"]

    if not passed:
        logger.warning("  ⚠ No classes passed compile. Skipping JaCoCo execution.")
        state["jacoco_metrics"] = []
        state["jacoco_report_path"] = None
        return state

    source_root = state.get("source_root", "")
    project_root = state.get("project_root")
    if not project_root:
        normalized_root = source_root.replace("\\", "/")
        if "src/main" in normalized_root:
            project_root = normalized_root.split("src/main")[0]
        else:
            project_root = normalized_root.split("src")[0]
    mvn_cmd = _get_mvn_command(project_root)

    # ── Run mvn test (triggers surefire test execution + JaCoCo bound to test phase) ──
    try:
        logger.info(f"  📡 Running: {mvn_cmd} test jacoco:report -q")
        result = subprocess.run(
            [mvn_cmd, "test", "jacoco:report", "-q"],
            cwd=project_root,
            capture_output=True,
            text=True,
            timeout=300,
        )
        if result.returncode != 0:
            # Tests may fail at runtime — that's expected, continue to parse CSV
            logger.warning(f"  ⚠ mvn test returned code {result.returncode} (runtime failures are OK)")
            logger.warning(f"  Stderr excerpt: {result.stderr[:400]}")
    except subprocess.TimeoutExpired:
        logger.error("  ✗ mvn test timed out after 300s")
        state["jacoco_metrics"] = []
        return state
    except FileNotFoundError:
        logger.error("  ✗ Maven command not found")
        state["jacoco_metrics"] = []
        return state

    # ── Parse jacoco.csv (Issue 7: simple output) ─────────────────────────────
    jacoco_csv = os.path.join(project_root, "target", "site", "jacoco", "jacoco.csv")
    metrics: list[dict] = []

    if not os.path.exists(jacoco_csv):
        logger.warning(f"  ⚠ jacoco.csv not found: {jacoco_csv}")
        state["jacoco_metrics"] = []
        state["jacoco_report_path"] = None
        return state

    target_classes = {r["class_name"] for r in passed}
    try:
        with open(jacoco_csv, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                raw_class = row.get("CLASS", "")
                base_class = raw_class.split("/")[-1] if "/" in raw_class else raw_class
                if base_class not in target_classes:
                    continue
                try:
                    lm = int(row.get("LINE_MISSED", 0))
                    lc = int(row.get("LINE_COVERED", 0))
                    bm = int(row.get("BRANCH_MISSED", 0))
                    bc = int(row.get("BRANCH_COVERED", 0))
                    total_l = lm + lc
                    total_b = bm + bc
                    line_pct = round(lc / total_l * 100, 1) if total_l else 0.0
                    branch_pct = round(bc / total_b * 100, 1) if total_b else 0.0
                    overall_pct = round((lc + bc) / (total_l + total_b) * 100, 1) \
                        if (total_l + total_b) else 0.0
                    # Issue 7: simple status
                    if overall_pct >= 70:
                        cov_status = "PASS"
                    elif overall_pct >= 40:
                        cov_status = "PARTIAL"
                    else:
                        cov_status = "FAIL"

                    metrics.append({
                        "class_name": base_class,
                        "line_coverage": line_pct,
                        "branch_coverage": branch_pct,
                        "coverage": overall_pct,
                        "coverage_status": cov_status,
                    })
                    logger.info(
                        f"    {base_class}: {line_pct}% line | {branch_pct}% branch "
                        f"→ {cov_status}"
                    )
                except (ValueError, ZeroDivisionError):
                    continue
    except Exception as e:
        logger.error(f"  ✗ Failed to parse jacoco.csv: {e}")

    report_html = os.path.join(project_root, "target", "site", "jacoco", "index.html")
    report_path = report_html if os.path.exists(report_html) else jacoco_csv

    logger.info(f"  ✓ JaCoCo metrics: {len(metrics)} class(es) parsed from {jacoco_csv}")
    state["jacoco_metrics"] = metrics
    state["jacoco_report_path"] = report_path
    return state


# ─────────────────────────────────────────────────────────────────────────────
# NODE 8 — Traceability Matrix (Issue 8: adds Coverage column)
# ─────────────────────────────────────────────────────────────────────────────

def traceability_node(state: MVPState) -> MVPState:
    """
    Build deterministic Traceability Matrix.

    Issue 8 — Full column set:
    BR | Method | Unit Test | Compile | Test (runtime) | Coverage% | Coverage Status

    Sources:
      - business_rules + service_business_rules → BR list
      - test_cases → TC IDs via linked_br
      - junit_metadata → UT methods via @DisplayName rule_id
      - compile_results → PASS / COMPILE_ERROR
      - jacoco_metrics → coverage% and coverage_status
    """
    logger.info("🔗 [TRACEABILITY] Building Traceability Matrix (V3 — with Coverage column)...")
    state = dict(state)
    state["current_node"] = "traceability"

    # Merge module-level BRs + service-level SBRs
    business_rules = state.get("business_rules") or []
    service_br_data = state.get("service_business_rules") or []

    # Flatten SBRs into a unified list with the same schema as business_rules
    unified_rules = list(business_rules)
    for sbr_entry in service_br_data:
        for rule in sbr_entry.get("service_rules", []):
            unified_rules.append({
                "br_id": rule.get("rule_id", "?"),
                "description": rule.get("description", ""),
                "source": [rule.get("source", "service logic")],
                "confidence": rule.get("confidence", 0.8),
            })

    if not unified_rules:
        logger.warning("  ⚠ No business rules found. Traceability matrix will be empty.")
        state["traceability_matrix"] = []
        return state

    test_cases = state.get("test_cases") or []
    junit_metadata = state.get("junit_metadata") or []
    compile_results = state.get("compile_results") or []
    jacoco_metrics = state.get("jacoco_metrics") or []

    # Build lookup maps
    tc_by_br: dict[str, list[str]] = {}
    for tc in test_cases:
        linked = tc.get("linked_br", [])
        tc_id = tc.get("test_case_id", "")
        if isinstance(linked, str):
            linked = [b.strip() for b in linked.split(",") if b.strip()]
        for br in linked:
            tc_by_br.setdefault(br, []).append(tc_id)

    ut_by_br: dict[str, list[dict]] = {}
    for meta in junit_metadata:
        rule_id = meta.get("rule_id", "")
        if rule_id:
            ut_by_br.setdefault(rule_id, []).append(meta)

    compile_map: dict[str, str] = {r["class_name"]: r["status"] for r in compile_results}

    # JaCoCo: class_name → {coverage, coverage_status}
    jacoco_map: dict[str, dict] = {m["class_name"]: m for m in jacoco_metrics}

    rows: list[dict] = []
    for rule in unified_rules:
        br_id = rule.get("br_id", "?")
        description = rule.get("description", "")
        source = rule.get("source", [])
        source_str = source[0] if isinstance(source, list) and source else str(source)
        confidence = rule.get("confidence", 0.8)

        tc_ids = tc_by_br.get(br_id, [])
        ut_entries = ut_by_br.get(br_id, [])

        if not tc_ids and not ut_entries:
            rows.append({
                "rule_id": br_id,
                "rule_description": description,
                "rule_source": source_str,
                "rule_confidence": confidence,
                "test_case_id": "NONE",
                "unit_test_method": "NONE",
                "compile_status": "N/A",
                "test_execution": "NOT TESTED",
                "coverage_pct": "N/A",
                "coverage_status": "NOT COVERED",
            })
            continue

        max_len = max(len(tc_ids), len(ut_entries), 1)
        for i in range(max_len):
            tc_id = tc_ids[i] if i < len(tc_ids) else "N/A"
            ut_meta = ut_entries[i] if i < len(ut_entries) else None

            if ut_meta:
                ut_class = ut_meta["class_name"]
                ut_method = ut_meta["method_name"]
                c_status = compile_map.get(ut_class, "UNKNOWN")
                jm = jacoco_map.get(ut_class)
                if jm:
                    test_exec = "PASS"
                    cov_pct = jm.get("coverage", 0.0)
                    cov_status = jm.get("coverage_status", "FAIL")
                elif c_status == "COMPILE_ERROR":
                    test_exec = "COMPILE_ERROR"
                    cov_pct = "N/A"
                    cov_status = "NOT COVERED"
                else:
                    test_exec = "SKIPPED"
                    cov_pct = "N/A"
                    cov_status = "NOT COVERED"
            else:
                ut_method = "N/A"
                c_status = "N/A"
                test_exec = "N/A"
                cov_pct = "N/A"
                cov_status = "N/A"

            rows.append({
                "rule_id": br_id,
                "rule_description": description,
                "rule_source": source_str,
                "rule_confidence": confidence,
                "test_case_id": tc_id,
                "unit_test_method": ut_method,
                "compile_status": c_status,
                "test_execution": test_exec,
                "coverage_pct": cov_pct,
                "coverage_status": cov_status,
            })

    # ── Export CSV ────────────────────────────────────────────────────────────
    import time
    os.makedirs("mastp_output", exist_ok=True)
    ts = int(time.time())
    module_code = state.get("module_code", "XX")
    csv_path = f"mastp_output/traceability_matrix_{module_code}_{ts}.csv"

    fieldnames = [
        "rule_id", "rule_description", "rule_source", "rule_confidence",
        "test_case_id", "unit_test_method",
        "compile_status", "test_execution", "coverage_pct", "coverage_status",
    ]
    try:
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        logger.info(f"  💾 Traceability CSV: {csv_path} ({len(rows)} rows)")
    except Exception as e:
        logger.error(f"  ✗ CSV export failed: {e}")

    # ── Export Markdown ───────────────────────────────────────────────────────
    md_path = csv_path.replace(".csv", ".md")
    try:
        module_name = state.get("module_name", "Module")
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(f"# MASTP V3 Traceability Matrix — {module_name}\n\n")
            # Issue 8 — full 10-column table
            f.write(
                "| Rule ID | Description | Source | Conf | TC ID | Unit Test | "
                "Compile | Test Run | Coverage% | Cov Status |\n"
            )
            f.write("|---|---|---|---|---|---|---|---|---|---|\n")
            for row in rows:
                f.write(
                    f"| {row['rule_id']} "
                    f"| {str(row['rule_description'])[:45]} "
                    f"| {row['rule_source']} "
                    f"| {row['rule_confidence']} "
                    f"| {row['test_case_id']} "
                    f"| {row['unit_test_method']} "
                    f"| {row['compile_status']} "
                    f"| {row['test_execution']} "
                    f"| {row['coverage_pct']} "
                    f"| {row['coverage_status']} |\n"
                )
        logger.info(f"  💾 Traceability Markdown: {md_path}")
    except Exception as e:
        logger.warning(f"  ⚠ Markdown export failed: {e}")

    state["traceability_matrix"] = rows
    state["traceability_csv_path"] = csv_path
    return state



def _evaluate_test_quality(java_code: str, class_name: str) -> dict:
    import re
    score = 100
    violations = []
    hard_failures = []
    
    # ── METRICS ──────────────────────────────────────────────────────────────
    metrics = {
        "test_count": 0,
        "mock_count": java_code.count('@Mock'),
        "assertion_count": java_code.count('assert'),
        "captor_count": java_code.count('ArgumentCaptor'),
        "exception_cases": java_code.count('assertThrows')
    }
    
    # Check LENIENT
    if "Strictness.LENIENT" in java_code:
        score -= 40
        hard_failures.append("Strictness.LENIENT is forbidden.")
        violations.append({"rule": "LENIENT_MOCKING", "penalty": -40})
        
    # Check Generic Exceptions
    generic_ex_pattern = r'assertThrows\s*\(\s*(RuntimeException|Exception|Throwable|Error)\.class'
    if re.search(generic_ex_pattern, java_code):
        score -= 10
        hard_failures.append("Generic Exception (RuntimeException/Exception) used instead of Domain Exception.")
        violations.append({"rule": "GENERIC_EXCEPTION", "penalty": -10})

    # Check thenReturn(null)
    if '.thenReturn(null)' in java_code:
        score -= 5
        violations.append({"rule": "NULL_MOCK_RETURN", "penalty": -5})
        
    # Check persistence save(any())
    persistence_regex = r'(?:[a-zA-Z0-9_]*(?:[Rr]epository|[Dd]ao|[Mm]apper))\s*\.\s*(?:save|update|delete|saveAll)\s*\(\s*(?:ArgumentMatchers\.)?any\('
    if re.search(persistence_regex, java_code):
        score -= 25
        hard_failures.append("Persistence mutation used any() instead of ArgumentCaptor.")
        violations.append({"rule": "PERSISTENCE_ANY", "penalty": -25})
        
    # Count tests
    test_methods = re.findall(r'@Test\s*(?:@[^\n]+\n)*\s*void\s+([A-Za-z0-9_]+)\(', java_code)
    metrics["test_count"] = len(test_methods)
    if not test_methods:
        score -= 30
        hard_failures.append("No test methods found.")
        violations.append({"rule": "NO_TEST_METHODS", "penalty": -30})
        
    # Check each test body
    for method_match in re.finditer(r'@Test\s*(?:@[^\n]+\n)*\s*void\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{([^}]*)\}', java_code):
        body = method_match.group(1)
        has_assert = 'assert' in body
        has_verify = 'verify(' in body
        if not has_assert and not has_verify:
            score -= 15
            hard_failures.append("Assertion-free test detected.")
            violations.append({"rule": "ASSERTION_FREE_TEST", "penalty": -15})
        elif 'assertNotNull(' in body and body.count('assert') == 1:
            score -= 15
            violations.append({"rule": "ONLY_ASSERT_NOT_NULL", "penalty": -15})
            
    # Boundary and Exceptions
    if metrics["exception_cases"] == 0:
        score -= 10
        violations.append({"rule": "NO_EXCEPTION_ASSERTION", "penalty": -10})
        
    if 'null' not in java_code.lower() and 'empty' not in java_code.lower() and 'zero' not in java_code.lower():
        score -= 10
        violations.append({"rule": "NO_BOUNDARY_TEST", "penalty": -10})
        
    return {
        "score": score,
        "violations": violations,
        "hard_failures": hard_failures,
        "passed": score >= 85 and len(hard_failures) == 0,
        "metrics": metrics
    }
