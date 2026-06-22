"""
mastp/tools/java_parser.py
Static analysis tool for Spring Boot Java source files.
Extracts REST endpoints via line-by-line scanning (robust, no AST dependency).
"""
from __future__ import annotations

import re
from typing import List, Optional
from dataclasses import dataclass


@dataclass
class ParsedEndpoint:
    controller: str
    http_method: str
    path: str
    full_path: str
    method_name: str
    summary: str
    request_body: Optional[str]
    response_type: str
    requires_auth: bool
    required_roles: List[str]
    has_validation: bool
    annotations: List[str]
    complexity: str  # Low | Medium | High | Critical
    module_code: str = ""


def _estimate_complexity(method_body: str) -> str:
    keywords = ["if ", "else ", "for ", "while ", "switch ", "case ", "catch ", "&&", "||", "? "]
    count = sum(method_body.count(kw) for kw in keywords) + 1
    if count <= 4:   return "Low"
    elif count <= 9: return "Medium"
    elif count <= 14: return "High"
    else:            return "Critical"


def _extract_roles(pre_authorize: str) -> List[str]:
    roles = re.findall(r"hasRole\(['\"]([^'\"]+)['\"]\)", pre_authorize)
    any_roles = re.findall(r"hasAnyRole\(([^)]+)\)", pre_authorize)
    for block in any_roles:
        roles.extend(re.findall(r"['\"]([^'\"]+)['\"]", block))
    return [r.replace("ROLE_", "") for r in roles]


HTTP_VERBS = {
    "GetMapping": "GET",
    "PostMapping": "POST",
    "PutMapping": "PUT",
    "DeleteMapping": "DELETE",
    "PatchMapping": "PATCH",
}


def parse_controller_source(
    source: str,
    controller_name: str,
    module_code: str,
) -> List[ParsedEndpoint]:
    """
    Line-by-line Spring Boot controller parser.
    Looks for @*Mapping → collect annotations → find public method → extract metadata.
    """
    endpoints: List[ParsedEndpoint] = []

    # Class base path
    base_match = re.search(r'@RequestMapping\s*\(\s*["\']([^"\']+)["\']', source)
    base_path = base_match.group(1) if base_match else ""
    if base_path and not base_path.startswith("/"):
        base_path = "/" + base_path

    # Class @PreAuthorize
    class_pre_auth = ""
    cp = re.search(r'@PreAuthorize\("([^"]+)"\)\s*\n[\s\S]{0,200}?public\s+class', source)
    if cp:
        class_pre_auth = cp.group(1)

    # @Operation summaries → {method_name: summary}
    op_map: dict[str, str] = {}
    for m in re.finditer(
        r'@Operation\(summary\s*=\s*"([^"]+)"\)[\s\S]{0,300}?public\s+\S[\s\S]{0,50}?\s(\w+)\s*\(',
        source
    ):
        op_map[m.group(2)] = m.group(1)

    lines = source.splitlines()
    n = len(lines)
    seq = 0
    i = 0

    while i < n:
        raw = lines[i]
        stripped = raw.strip()

        # Check if this line has a @*Mapping annotation
        http_method = None
        sub_path = ""
        for ann, verb in HTTP_VERBS.items():
            if f"@{ann}" in stripped:
                http_method = verb
                # Extract path from annotation
                pm = re.search(rf'@{ann}\s*\(\s*["\']([^"\']*)["\']', stripped)
                if pm:
                    sub_path = pm.group(1)
                break

        if http_method is None:
            i += 1
            continue

        # Found a mapping annotation — now collect the full annotation block
        # and find the method signature
        ann_block_lines = [stripped]
        j = i + 1
        method_name = None
        has_validation = "@Valid" in stripped
        requires_auth = "@AuthenticationPrincipal" in stripped
        required_roles: List[str] = []
        request_body: Optional[str] = None
        response_type = "ApiResponse<Object>"
        ann_collected: List[str] = [stripped]
        complexity = "Low"

        while j < min(i + 25, n):
            jline = lines[j].strip()

            # Collect auth / validation from surrounding annotation lines
            if "@Valid" in jline:
                has_validation = True
            if "@AuthenticationPrincipal" in jline:
                requires_auth = True
            if "@PreAuthorize" in jline:
                requires_auth = True
                pm = re.search(r'@PreAuthorize\("([^"]+)"\)', jline)
                if pm:
                    required_roles = _extract_roles(pm.group(1))
            if "@RequestBody" in jline:
                rbm = re.search(r'@RequestBody\s+(?:@\w+\s+)*(\w+(?:\.\w+)*)', jline)
                if rbm:
                    request_body = rbm.group(1)
            if "@Valid" in jline and "@RequestBody" in jline:
                # e.g.  @Valid @RequestBody AuthDTOs.LoginRequest request
                rbm2 = re.search(r'@RequestBody\s+(?:@\w+\s+)*(\w+(?:\.\w+)*)', jline)
                if rbm2:
                    request_body = rbm2.group(1)

            ann_collected.append(jline)

            # Detect method signature: "public ResponseEntity<...> methodName("
            sig_match = re.search(
                r'public\s+ResponseEntity[<\s][\s\S]*?\s+(\w+)\s*\(',
                jline
            )
            if sig_match:
                method_name = sig_match.group(1)
                # Extract response type
                rt = re.search(r'ResponseEntity<ApiResponse<([^>]+)>>', jline)
                if rt:
                    response_type = rt.group(1)

                # Collect method body (simplified: 20 lines after signature)
                body_snippet = "\n".join(lines[j+1:j+20])
                complexity = _estimate_complexity(body_snippet)
                break

            j += 1

        if method_name is None:
            i += 1
            continue

        # Apply class-level auth if no method-level
        if not requires_auth and class_pre_auth:
            requires_auth = True
            if not required_roles:
                required_roles = _extract_roles(class_pre_auth)

        full_path = base_path.rstrip("/") + ("/" + sub_path.lstrip("/") if sub_path else "")
        full_path = full_path.replace("//", "/") or "/"

        summary = op_map.get(method_name, f"{http_method} {full_path}")
        seq += 1

        endpoints.append(ParsedEndpoint(
            controller=controller_name,
            http_method=http_method,
            path=sub_path or "/",
            full_path=full_path,
            method_name=method_name,
            summary=summary,
            request_body=request_body,
            response_type=response_type,
            requires_auth=requires_auth,
            required_roles=required_roles,
            has_validation=has_validation,
            annotations=ann_collected[:5],
            complexity=complexity,
            module_code=module_code,
        ))

        i = j + 1

    return endpoints


def parse_java_file(filepath: str, module_code: str) -> List[ParsedEndpoint]:
    """Read a Java file and parse all REST endpoints."""
    import os
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Java file not found: {filepath}")
    with open(filepath, "r", encoding="utf-8") as f:
        source = f.read()
    controller_name = os.path.basename(filepath).replace(".java", "")
    return parse_controller_source(source, controller_name, module_code)
