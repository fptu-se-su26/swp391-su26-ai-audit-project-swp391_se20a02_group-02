"""
mastp/state.py
LangGraph State Model for MASTP MVP
"""
from __future__ import annotations
from typing import TypedDict, List, Optional, Dict, Any


class EndpointDef(TypedDict):
    endpoint_id: str
    controller: str
    http_method: str
    path: str
    full_path: str
    summary: str
    request_body: Optional[str]
    response_type: str
    requires_auth: bool
    required_roles: List[str]
    has_validation: bool
    complexity: str          # Low | Medium | High | Critical
    module_code: str


class FunctionDef(TypedDict):
    function_id: str
    function_name: str
    module_code: str
    priority: str            # P0 | P1 | P2 | P3
    complexity: str
    http_method: Optional[str]
    endpoint: Optional[str]
    inputs: List[str]
    outputs: List[str]
    actors: List[str]
    requires_auth: bool
    required_roles: List[str]
    linked_br: List[str]
    linked_vr: List[str]
    estimated_scenarios: int
    estimated_tcs: int
    risk_level: str
    automation_feasibility: str


class TestCaseDef(TypedDict):
    test_case_id: str
    function_id: str
    module_code: str
    module_name: str
    test_case_description: str
    test_case_type: str      # Functional Positive | Functional Negative | Boundary | Edge Case | Security | Validation
    priority: str
    pre_condition: str
    test_case_procedure: str
    expected_result: str
    round1_result: str
    round1_date: str
    round1_tester: str
    round2_result: str
    round2_date: str
    round2_tester: str
    round3_result: str
    round3_date: str
    round3_tester: str
    note: str


class MVPState(TypedDict):
    """Minimal LangGraph state for MVP 3-agent pipeline."""

    # ── Session ────────────────────────────────────────────
    session_id: str
    module_code: str          # e.g. "AA"
    module_name: str          # e.g. "Authentication & Authorization"
    controller_file: str      # e.g. "EmployeeController.java"
    source_root: str
    base_url: str

    # ── Config ─────────────────────────────────────────────
    target_functions: int     # Expected function count
    target_tcs: int           # Target TC count
    llm_model: str

    # ── Phase outputs ──────────────────────────────────────
    source_code: Optional[str]           # Raw Java source
    endpoints: Optional[List[EndpointDef]]
    functions: Optional[List[FunctionDef]]
    test_cases: Optional[List[TestCaseDef]]

    # ── Artifacts ──────────────────────────────────────────
    excel_path: Optional[str]
    postman_path: Optional[str]

    # ── Quality ─────────────────────────────────────────────
    quality_scores: Dict[str, float]
    errors: List[str]
    warnings: List[str]

    # ── Progress ────────────────────────────────────────────
    current_node: str
    messages: List[Any]       # LangGraph message history
