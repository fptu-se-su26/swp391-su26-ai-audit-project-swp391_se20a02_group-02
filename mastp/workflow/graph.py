"""
mastp/workflow/graph.py
LangGraph workflow definition for MASTP V3.
8-node pipeline:
  code_analysis → business_rule → function_inventory → test_strategy → test_case
                                                                           ↓
                               service_inventory → junit_generator → compile_validation → jacoco → traceability
"""
from __future__ import annotations

from langgraph.graph import StateGraph, END

from mastp.state import MVPState
from mastp.workflow.nodes import (
    code_analysis_node,
    business_rule_node,
    function_inventory_node,
    test_strategy_node,
    test_case_node,
    # V3 nodes
    service_inventory_node,
    service_br_extraction_node,
    junit_generator_node,
    compile_validation_node,
    jacoco_node,
    traceability_node,
)


def build_mvp_graph() -> "CompiledGraph":
    """Build and compile the MASTP V3 LangGraph pipeline.

    Flow:
        Code Analysis
            → Business Rule Extraction
            → Function Inventory
            → Test Strategy
            → Test Cases (Excel)
            → Service Inventory (Static, 0 LLM)
            → Service BR Extraction (1 LLM/class)
            → JUnit Generator (Template Engine, 1 LLM/class)
            → Compile Validation (deterministic test-compile)
            → JaCoCo Execution (mvnw test + jacoco:report)
            → Traceability Matrix Export
    """

    graph = StateGraph(MVPState)

    # ── Register nodes ────────────────────────────────────────────────────
    # Phase 1-3: Existing Excel pipeline
    graph.add_node("code_analysis",      code_analysis_node)
    graph.add_node("business_rule",      business_rule_node)
    graph.add_node("function_inventory", function_inventory_node)
    graph.add_node("test_strategy",      test_strategy_node)
    graph.add_node("test_case",          test_case_node)

    # Phase 4-8: New JUnit + Coverage pipeline (V3)
    graph.add_node("service_inventory",     service_inventory_node)
    graph.add_node("service_br_extraction", service_br_extraction_node)
    graph.add_node("junit_generator",       junit_generator_node)
    graph.add_node("compile_validation",    compile_validation_node)
    graph.add_node("jacoco",                jacoco_node)
    graph.add_node("traceability",          traceability_node)

    # ── Define flow ───────────────────────────────────────────────────────
    graph.set_entry_point("code_analysis")
    graph.add_edge("code_analysis",         "business_rule")
    graph.add_edge("business_rule",         "function_inventory")
    graph.add_edge("function_inventory",    "test_strategy")
    graph.add_edge("test_strategy",         "test_case")

    # After Excel export: start the JUnit pipeline
    graph.add_edge("test_case",             "service_inventory")
    graph.add_edge("service_inventory",     "service_br_extraction")
    graph.add_edge("service_br_extraction", "junit_generator")
    graph.add_edge("junit_generator",       "compile_validation")
    graph.add_edge("compile_validation",    "jacoco")
    graph.add_edge("jacoco",                "traceability")
    graph.add_edge("traceability",          END)

    return graph.compile()


def build_junit_graph() -> "CompiledGraph":
    """Build and compile a graph that skips Excel Test Cases and only runs the JUnit pipeline.
    
    Flow:
        Service Inventory (Static, 0 LLM)
            → Service BR Extraction (1 LLM/class)
            → JUnit Generator (Template Engine, 1 LLM/class)
            → Compile Validation (deterministic test-compile)
            → JaCoCo Execution (mvnw test + jacoco:report)
            → Traceability Matrix Export
    """
    graph = StateGraph(MVPState)

    # Register only Phase 4-8 nodes
    graph.add_node("service_inventory",     service_inventory_node)
    graph.add_node("service_br_extraction", service_br_extraction_node)
    graph.add_node("junit_generator",       junit_generator_node)
    graph.add_node("compile_validation",    compile_validation_node)
    graph.add_node("jacoco",                jacoco_node)
    graph.add_node("traceability",          traceability_node)

    # Define flow
    graph.set_entry_point("service_inventory")
    graph.add_edge("service_inventory",     "service_br_extraction")
    graph.add_edge("service_br_extraction", "junit_generator")
    graph.add_edge("junit_generator",       "compile_validation")
    graph.add_edge("compile_validation",    "jacoco")
    graph.add_edge("jacoco",                "traceability")
    graph.add_edge("traceability",          END)

    return graph.compile()
