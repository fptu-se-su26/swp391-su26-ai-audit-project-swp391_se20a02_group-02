"""
mastp/state.py
LangGraph State Model for MASTP V3
Extended to support JUnit generation, compile validation, JaCoCo, and traceability.
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
    linked_br: List[str]     # NEW: Business Rule traceability
    linked_vr: List[str]     # NEW: Validation Rule traceability
    linked_function: str     # NEW: Function Name traceability
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


class BusinessRuleDef(TypedDict):
    br_id: str               # e.g. BR-BL-001
    br_key: str              # stable hash key e.g. "booking_overlap_a1b2c3"
    description: str         # Human-readable rule description
    source_layer: str        # "Service" | "Validator" | "Entity" | "Controller"
    source_method: str       # e.g. "BookingService.checkAvailability()"
    testable_condition: str  # Concrete test scenario
    priority: str            # P0 | P1 | P2 | P3
    confidence: float        # 0.0–1.0 — how sure the AI is about this rule
    rule_status: str         # "confirmed" | "inferred" | "uncertain"


class ServiceMethodDef(TypedDict):
    """One public method in a @Service class, extracted by service_parser."""
    method_name: str
    return_type: str
    parameters: List[str]
    throws: List[str]
    is_transactional: bool
    body_snippet: str


class ServiceInventoryDef(TypedDict):
    """Full static inventory of one @Service class, fed to JUnit Generator."""
    class_name: str
    package: str
    dependencies: List[Dict[str, str]]  # [{"type": "UserRepository", "field": "userRepository"}]
    methods: List[ServiceMethodDef]
    source_file: str


class CompileResultDef(TypedDict):
    """Compile result for one generated JUnit test file."""
    class_name: str       # e.g. "UserServiceTest"
    java_file: str        # Absolute path to the generated .java file
    status: str           # "PASS" | "COMPILE_ERROR" | "SKIPPED"
    error_log: str        # Maven compiler output on failure


class JaCoCoClassMetrics(TypedDict):
    """Per-class coverage metrics parsed from jacoco.csv."""
    class_name: str
    line_coverage: float
    branch_coverage: float
    method_coverage: float


class TraceabilityRow(TypedDict):
    """One row in the final traceability matrix export."""
    rule_id: str
    rule_description: str
    rule_source: str           # "@NotNull" | "service logic"
    rule_confidence: float
    test_case_id: str
    unit_test_method: str      # e.g. "testGetProfile_UserNotFound"
    compile_status: str
    execution_status: str


class MVPState(TypedDict):
    """LangGraph state for V3 pipeline: Code Analysis → BR → Inventory → TC (Excel) → JUnit → Compile → JaCoCo → Traceability."""

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
    source_code: Optional[str]                    # Raw Java source (Controller)
    service_code: Optional[str]                   # Raw Java source (Service layer)
    endpoints: Optional[List[EndpointDef]]
    business_rules: Optional[List[BusinessRuleDef]]   # Agent 05 output
    functions: Optional[List[FunctionDef]]
    test_cases: Optional[List[TestCaseDef]]

    # ── V3: Service Inventory (Phase 1 – Static Extraction) ──────────────────
    service_inventory: Optional[List[ServiceInventoryDef]]

    # ── V3: Service BR Extraction (1 LLM req per class) ────────────────────────────
    service_business_rules: Optional[List[Dict[str, Any]]]  # {class_name, service_rules: [...]}

    # ── V3: JUnit Generation (Phase 2) ────────────────────────────────────────
    generated_junit_files: Optional[List[str]]      # Paths of generated .java files
    junit_metadata: Optional[List[Dict[str, Any]]]  # {ut_id, class_name, method_name, rule_id}

    # ── V3: Compile Validation (Phase 3) ──────────────────────────────────────
    compile_results: Optional[List[CompileResultDef]]

    # ── V3: JaCoCo Metrics (Phase 4) ──────────────────────────────────────────
    jacoco_metrics: Optional[List[JaCoCoClassMetrics]]
    jacoco_report_path: Optional[str]

    # ── V3: Traceability Matrix (Phase 5) ─────────────────────────────────────
    traceability_matrix: Optional[List[TraceabilityRow]]
    traceability_csv_path: Optional[str]

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
