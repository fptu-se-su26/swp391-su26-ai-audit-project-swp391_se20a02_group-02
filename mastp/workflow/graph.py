"""
mastp/workflow/graph.py
LangGraph workflow definition for MASTP MVP.
3-node pipeline: code_analysis → function_inventory → test_case
"""
from __future__ import annotations

from langgraph.graph import StateGraph, END

from mastp.state import MVPState
from mastp.workflow.nodes import (
    code_analysis_node,
    function_inventory_node,
    test_case_node,
)


def build_mvp_graph() -> "CompiledGraph":
    """Build and compile the MVP 3-agent LangGraph pipeline."""

    graph = StateGraph(MVPState)

    # ── Register nodes ────────────────────────────────────────────────────
    graph.add_node("code_analysis",       code_analysis_node)
    graph.add_node("function_inventory",  function_inventory_node)
    graph.add_node("test_case",           test_case_node)

    # ── Define flow ───────────────────────────────────────────────────────
    graph.set_entry_point("code_analysis")
    graph.add_edge("code_analysis",      "function_inventory")
    graph.add_edge("function_inventory", "test_case")
    graph.add_edge("test_case",          END)

    return graph.compile()
