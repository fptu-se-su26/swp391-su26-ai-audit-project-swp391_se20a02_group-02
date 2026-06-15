"""
utilization_agent.py — Augmented Reasoning Agent for Vehicle Utilization Prediction

Pattern: AUGMENTED REASONING AGENT (Deterministic ML + LLM Explanation Layer)

Reviewer Feedback addressed:
  "UtilizationAgent currently relies on deterministic ML outputs rather than
   true reasoning. Consider an LLM-powered explanation layer or rename as
   Decision Agent."

Resolution: Same pattern as ChurnAgent — deterministic DECISION, LLM EXPLANATION.
"""
from __future__ import annotations

from typing import Any

from agents.base_agent import BaseAgent
from agents.llm_reasoner import LLMReasoner
from connectors.ml_client import MLSidecarClient
from models.agent_schemas import AgentName


class UtilizationAgent(BaseAgent):
    """
    AUGMENTED REASONING AGENT — Vehicle Utilization Prediction

    Decision Logic:
    1. Call ML sidecar /ml/utilization/forecast (deterministic)
    2. DECIDE: Identify under/over-utilized categories (deterministic thresholds)
    3. DECIDE: Compute vehicle rebalancing quantities (deterministic formula)
    4. REASON: Generate LLM explanation for each rebalancing action
    5. Cross-reference with DemandAgent output

    Thresholds (deterministic):
      Underutilized: < 50%
      Over-utilized: > 85%
    """

    agent_name = AgentName.UTILIZATION

    UNDERUTILIZED_THRESHOLD = 0.50
    OVERUTILIZED_THRESHOLD = 0.85

    def __init__(self, ml_client: MLSidecarClient, reasoner: LLMReasoner | None = None) -> None:
        super().__init__()
        self._ml_client = ml_client
        self._reasoner = reasoner or LLMReasoner()

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        """
        Example Output (with LLM reasoning):
            {
              "utilization_output": {
                "rebalancing_recommendations": [
                  {
                    "from_category": "TRUCK",
                    "to_category": "SUV",
                    "vehicles_to_move": 5,
                    "llm_explanation": "TRUCK fleet sits at 33% utilization —
                      nearly 17 percentage points below the operational minimum
                      threshold. Meanwhile SUV demand is at 91% and climbing,
                      supported by a +25% demand forecast. Relocating 5 vehicles
                      to SUV-demand zones will reduce stockout risk while improving
                      overall fleet ROI.",
                    "priority": "HIGH"
                  }
                ],
                "reasoning_chain": [...],
                "reasoning_source": "gemini"
              }
            }
        """
        vehicle_utilization = state.get("input_data", {}).get("vehicle_utilization", {})
        demand_output = state.get("demand_output", {})
        demand_signal = demand_output.get("demand_increase_pct", 0.0)
        reasoning_chain: list[str] = []

        if not vehicle_utilization:
            return {
                "utilization_output": {
                    "by_category": {},
                    "current_rates": {},
                    "lowest_category": "N/A",
                    "highest_category": "N/A",
                    "rebalancing_recommendations": [],
                    "reasoning_chain": ["No utilization data provided."],
                    "reasoning_source": "none",
                }
            }

        reasoning_chain.append(
            f"Step 1: Received utilization data for {len(vehicle_utilization)} categories: "
            f"{', '.join(vehicle_utilization.keys())}."
        )

        # ── Step 1: ML forecast (deterministic) ───────────────────────────────
        try:
            ml_result = await self._ml_client.forecast_utilization(vehicle_utilization, forecast_days=30)
        except Exception as exc:
            current_rates = {
                cat: sum(vals) / len(vals) if vals else 0.0
                for cat, vals in vehicle_utilization.items()
            }
            return {
                "utilization_output": {
                    "by_category": {},
                    "current_rates": current_rates,
                    "lowest_category": min(current_rates, key=lambda k: current_rates[k]),
                    "highest_category": max(current_rates, key=lambda k: current_rates[k]),
                    "rebalancing_recommendations": [],
                    "reasoning_chain": reasoning_chain + [f"ML error: {exc}"],
                    "reasoning_source": "error",
                }
            }

        current_rates: dict[str, float] = ml_result.get("current_rates", {})
        lowest = ml_result.get("lowest_category", "N/A")
        highest = ml_result.get("highest_category", "N/A")
        by_category = ml_result.get("by_category", {})

        # ── Step 2: Deterministic threshold analysis ───────────────────────────
        underutilized = {k: v for k, v in current_rates.items() if v < self.UNDERUTILIZED_THRESHOLD}
        overutilized = {k: v for k, v in current_rates.items() if v > self.OVERUTILIZED_THRESHOLD}

        reasoning_chain.append(
            f"Step 2: Utilization analysis: "
            f"underutilized (<{self.UNDERUTILIZED_THRESHOLD:.0%}): "
            f"{[f'{k}={v:.0%}' for k, v in underutilized.items()] or 'None'}; "
            f"over-utilized (>{self.OVERUTILIZED_THRESHOLD:.0%}): "
            f"{[f'{k}={v:.0%}' for k, v in overutilized.items()] or 'None'}."
        )

        # ── Step 3: Deterministic rebalancing quantity formula ─────────────────
        raw_recommendations: list[dict] = []
        for under_cat, under_rate in underutilized.items():
            for over_cat, over_rate in overutilized.items():
                gap = over_rate - self.OVERUTILIZED_THRESHOLD
                vehicles_to_move = max(1, int(gap / 0.05) * 2)
                raw_recommendations.append({
                    "from_category": under_cat,
                    "to_category": over_cat,
                    "vehicles_to_move": vehicles_to_move,
                    "from_rate": under_rate,
                    "to_rate": over_rate,
                    "priority": "HIGH" if over_rate > 0.90 else "MEDIUM",
                })

        reasoning_chain.append(
            f"Step 3: Computed {len(raw_recommendations)} rebalancing actions "
            f"using gap-based formula (2 vehicles per 5% over-utilization gap)."
        )

        # ── Step 4: LLM explanation for each action ────────────────────────────
        recommendations: list[dict] = []
        reasoning_source = self._reasoner._backend

        for rec in raw_recommendations:
            explanation = await self._reasoner.explain_rebalancing_decision(
                from_category=rec["from_category"],
                to_category=rec["to_category"],
                from_rate=rec["from_rate"],
                to_rate=rec["to_rate"],
                vehicles_to_move=rec["vehicles_to_move"],
                demand_signal=demand_signal,
            )
            recommendations.append({**rec, "llm_explanation": explanation})

        reasoning_chain.append(
            f"Step 4: Generated {len(recommendations)} recommendations with "
            f"'{reasoning_source}' reasoning. "
            f"LLM reasoning: {'enabled' if self._reasoner.is_llm_enabled else 'rule-based fallback'}."
        )

        # ── Step 5: Cross-reference demand signal ──────────────────────────────
        if demand_signal > 15 and overutilized:
            reasoning_chain.append(
                f"Step 5: DemandAgent reports +{demand_signal:.1f}% demand — "
                f"rebalancing urgency elevated for {list(overutilized.keys())}."
            )
        else:
            reasoning_chain.append(
                f"Step 5: DemandAgent demand signal={demand_signal:.1f}% — "
                f"normal rebalancing priority applies."
            )

        return {
            "utilization_output": {
                "by_category": by_category,
                "current_rates": current_rates,
                "lowest_category": lowest,
                "highest_category": highest,
                "rebalancing_recommendations": recommendations,
                "reasoning_chain": reasoning_chain,
                "reasoning_source": reasoning_source,
                "llm_reasoning_enabled": self._reasoner.is_llm_enabled,
            }
        }
