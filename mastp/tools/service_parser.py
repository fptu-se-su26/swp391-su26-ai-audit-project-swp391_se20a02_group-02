"""
mastp/tools/service_parser.py  — MASTP V3 upgraded schema
Static analysis for Spring Boot Service layer classes.

Schema upgrade (Issue 3):
  parameters now structured as [{name, type}] instead of raw strings.
  This allows JUnit Generator to produce accurate @Mock declarations.

Design Principle:
  Pure Python, zero LLM calls. Deterministic and fast.
"""
from __future__ import annotations

import re
import os
from typing import List, Optional
from dataclasses import dataclass


@dataclass
class ServiceDependency:
    """One constructor-injected or @Autowired dependency in a service class."""
    type: str    # e.g. "UserRepository"
    field: str   # e.g. "userRepository"


@dataclass
class ServiceMethodParam:
    """One parameter in a service method (structured, not raw string)."""
    name: str   # e.g. "userId"
    type: str   # e.g. "String"  |  "BookingRequest"  |  "List<Vehicle>"


@dataclass
class ServiceMethod:
    """One public method extracted from a @Service class."""
    method_name: str
    return_type: str
    parameters: List[ServiceMethodParam]   # Structured [{name, type}]
    throws: List[str]                       # Declared checked exceptions
    is_transactional: bool
    body_snippet: str                       # First 500 chars of body for BR extraction


@dataclass
class ParsedService:
    """Full inventory of a @Service class ready for JUnit generation."""
    class_name: str
    package: str
    dependencies: List[ServiceDependency]
    methods: List[ServiceMethod]
    source_file: str
    source_code: str = ""   # Full source, kept for Service BR Extraction


# ─── Regex helpers ────────────────────────────────────────────────────────────

_FINAL_FIELD_RE = re.compile(
    r'private\s+final\s+([\w<>, \[\]]+?)\s+(\w+)\s*;'
)

_AUTOWIRED_FIELD_RE = re.compile(
    r'@Autowired[\s\S]{0,100}?private\s+([\w<>, \[\]]+?)\s+(\w+)\s*;'
)

_METHOD_SIG_RE = re.compile(
    r'(?:@Transactional[^\n]*\n\s*)?'
    r'public\s+'
    r'([\w<>, \[\]?.]+?)\s+'
    r'(\w+)\s*'
    r'\(([^)]*)\)'
    r'(?:\s+throws\s+([\w,\s]+?))?'
    r'\s*\{'
)

_PACKAGE_RE = re.compile(r'^package\s+([\w.]+)\s*;', re.MULTILINE)

# Common Java annotations on parameters to strip
_PARAM_ANNOTATION_RE = re.compile(r'@\w+(?:\([^)]*\))?\s*')


def _is_service_class(source: str) -> bool:
    return bool(re.search(r'@Service\b', source))


def _parse_params(params_raw: str) -> List[ServiceMethodParam]:
    """
    Parse a raw parameter string into structured ServiceMethodParam list.
    Input:  "String userId, BookingRequest req, @Valid CreateDto dto"
    Output: [ServiceMethodParam(name="userId", type="String"), ...]
    """
    if not params_raw.strip():
        return []

    result: List[ServiceMethodParam] = []
    # Split by comma at top-level (handle generics like Map<String, Object>)
    depth = 0
    current = ""
    for ch in params_raw:
        if ch in "<([":
            depth += 1
        elif ch in ">)]":
            depth -= 1
        if ch == "," and depth == 0:
            result.append(_parse_single_param(current.strip()))
            current = ""
        else:
            current += ch
    if current.strip():
        result.append(_parse_single_param(current.strip()))

    return [p for p in result if p is not None]


def _parse_single_param(param_str: str) -> Optional[ServiceMethodParam]:
    """Parse one parameter like '@Valid BookingRequest req' → ServiceMethodParam."""
    if not param_str:
        return None
    # Strip annotations (@Valid, @RequestBody, etc.)
    clean = _PARAM_ANNOTATION_RE.sub("", param_str).strip()
    # Split on last whitespace: everything before is type, last token is name
    parts = clean.split()
    if len(parts) < 2:
        return None
    # Handle varargs: "String... args" → type="String...", name="args"
    name = parts[-1].lstrip(".")
    type_str = " ".join(parts[:-1])
    # Strip array suffix from name if present: "args[]" → "args"
    name = name.rstrip("[]")
    return ServiceMethodParam(name=name, type=type_str)


def _extract_dependencies(source: str) -> List[ServiceDependency]:
    """Extract injected dependencies (Lombok @RequiredArgsConstructor or @Autowired)."""
    deps: List[ServiceDependency] = []
    seen_fields: set = set()

    PRIMITIVE_TYPES = {"String", "int", "long", "boolean", "double", "float",
                       "Integer", "Long", "Boolean", "Double", "List", "Map",
                       "Set", "Optional", "Object"}

    for m in _FINAL_FIELD_RE.finditer(source):
        raw_type = m.group(1).strip()
        field_name = m.group(2).strip()
        base_type = re.sub(r'<.*>', '', raw_type).strip()
        if base_type in PRIMITIVE_TYPES:
            continue
        if field_name not in seen_fields:
            seen_fields.add(field_name)
            deps.append(ServiceDependency(type=base_type, field=field_name))

    for m in _AUTOWIRED_FIELD_RE.finditer(source):
        raw_type = m.group(1).strip()
        field_name = m.group(2).strip()
        base_type = re.sub(r'<.*>', '', raw_type).strip()
        if base_type in PRIMITIVE_TYPES:
            continue
        if field_name not in seen_fields:
            seen_fields.add(field_name)
            deps.append(ServiceDependency(type=base_type, field=field_name))

    return deps


def _extract_public_methods(source: str) -> List[ServiceMethod]:
    """Extract all public business methods from the service class body."""
    methods: List[ServiceMethod] = []

    for m in _METHOD_SIG_RE.finditer(source):
        return_type = m.group(1).strip()
        method_name = m.group(2).strip()
        params_raw = m.group(3).strip()
        throws_raw = m.group(4) or ""

        # Skip DTO-mapping helpers (toXResponse, toXDto, mapX, buildX, fromX)
        if re.match(r'^(to|map|build|from)[A-Z]', method_name):
            continue

        # Skip constructors (no return type, capitalized name)
        if return_type in ("", "void") and method_name[0].isupper():
            continue

        # Structured parameter parsing
        params = _parse_params(params_raw)
        throws = [t.strip() for t in throws_raw.split(",") if t.strip()]

        # @Transactional detection
        start_pos = m.start()
        pre_context = source[max(0, start_pos - 150): start_pos]
        is_transactional = "@Transactional" in pre_context

        # Body snippet (500 chars for BR extraction context)
        body_start = m.end()
        body_snippet = source[body_start: body_start + 500].strip()

        methods.append(ServiceMethod(
            method_name=method_name,
            return_type=return_type,
            parameters=params,
            throws=throws,
            is_transactional=is_transactional,
            body_snippet=body_snippet,
        ))

    return methods


def parse_service_source(source: str, source_file: str) -> Optional[ParsedService]:
    """Parse a Java Service file. Returns None if not annotated with @Service."""
    if not _is_service_class(source):
        return None

    class_match = re.search(r'public\s+class\s+(\w+)', source)
    class_name = class_match.group(1) if class_match else \
        os.path.basename(source_file).replace(".java", "")

    pkg_match = _PACKAGE_RE.search(source)
    package = pkg_match.group(1) if pkg_match else "com.unknown"

    dependencies = _extract_dependencies(source)
    methods = _extract_public_methods(source)

    return ParsedService(
        class_name=class_name,
        package=package,
        dependencies=dependencies,
        methods=methods,
        source_file=source_file,
        source_code=source,
    )


def parse_service_file(filepath: str) -> Optional[ParsedService]:
    """Read a Java file and parse it as a Service class."""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Service file not found: {filepath}")
    with open(filepath, "r", encoding="utf-8") as f:
        source = f.read()
    return parse_service_source(source, os.path.basename(filepath))


def parse_service_directory(service_dir: str) -> List[ParsedService]:
    """Parse all @Service classes found in the given directory."""
    services: List[ParsedService] = []
    if not os.path.isdir(service_dir):
        return services

    for fname in sorted(os.listdir(service_dir)):
        if not fname.endswith(".java"):
            continue
        fpath = os.path.join(service_dir, fname)
        try:
            parsed = parse_service_file(fpath)
            if parsed:
                services.append(parsed)
        except Exception:
            pass

    return services
