"""
churn_agent.py — Augmented Reasoning Agent for Churn Prediction

Pattern: AUGMENTED REASONING AGENT (Deterministic ML + LLM Explanation Layer)

Reviewer Feedback addressed:
  "ChurnAgent currently relies on deterministic ML outputs and business rules
   rather than true reasoning. Consider introducing an LLM-powered explanation
   layer or renaming them as Decision Agents."

Resolution:
  - ML model (RFM scoring via sidecar) provides the DECISION (what to do).
  - LLMReasoner provides the EXPLANATION (why we do it).
  - Falls back to rule-based explanations when LLM is not configured.
  - Architecture pattern: "Augmented Reasoning Agent" (not pure Decision Agent,
    not pure LLM Agent — a hybrid with determinism guarantees).
"""
from __future__ import annotations

from typing import Any

from agents.base_agent import BaseAgent
from agents.llm_reasoner import LLMReasoner
from connectors.ml_client import MLSidecarClient
from models.agent_schemas import AgentName


class ChurnAgent(BaseAgent):
    """
    AUGMENTED REASONING AGENT — Churn Prediction

    Architecture:
      ┌─────────────────────────────────────────────────────────┐
      │  Input: customer data                                   │
      │     │                                                   │
      │     ▼                                                   │
      │  ML Sidecar (RFM scoring)  ← DETERMINISTIC DECISION    │
      │     │                                                   │
      │     ▼                                                   │
      │  Business Rules (campaign assignment)  ← DETERMINISTIC  │
      │     │                                                   │
      │     ▼                                                   │
      │  LLMReasoner (explanation generation) ← REASONING      │
      │     │  (falls back to rule-based if LLM unavailable)   │
      │     ▼                                                   │
      │  Output: at_risk + campaigns + llm_explanations        │
      └─────────────────────────────────────────────────────────┘

    Decision Logic (Chain-of-Thought with LLM Enhancement):
    1. Call ML sidecar /ml/churn/score → RFM scores (deterministic)
    2. DECIDE: Assign campaign by risk_level (deterministic business rules)
    3. REASON: Generate per-customer explanation via LLMReasoner
       - If LLM configured: rich natural-language rationale from Gemini/GPT-4o
       - If LLM absent: structured rule-based explanation (deterministic fallback)
    4. Synthesise reasoning chain across all customers
    5. Estimate revenue at risk
    """

    agent_name = AgentName.CHURN

    def __init__(self, ml_client: MLSidecarClient, reasoner: LLMReasoner | None = None) -> None:
        super().__init__()
        self._ml_client = ml_client
        self._reasoner = reasoner or LLMReasoner()

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        """
        Example Input State:
            {
              "input_data": {
                "customers": [...],
                "platform_avg_frequency": 3.5,
                "platform_avg_spend": 1200.0
              }
            }

        Example Output (with LLM reasoning):
            {
              "churn_output": {
                "at_risk_customers": [...],
                "campaign_recommendations": [
                  {
                    "customer_id": "U001",
                    "campaign_type": "VIP_DISCOUNT",
                    "discount_pct": 20,
                    "llm_explanation": "Alice Nguyen's last booking was 95 days ago,
                      placing her Recency score at 100/100 — indicating complete
                      disengagement. Despite her $4,500 historical spend (Monetary=62),
                      her low frequency of 1 booking signals that without immediate
                      VIP outreach, LuxeWay risks losing a high-value customer permanently."
                  }
                ],
                "reasoning_chain": [...],
                "reasoning_source": "gemini",   ← tells you which backend was used
                "total_at_risk": 12,
                "estimated_revenue_at_risk": 87300.0
              }
            }
        """
        input_data = state.get("input_data", {})
        customers = input_data.get("customers", [])
        avg_freq = float(input_data.get("platform_avg_frequency", 1.0))
        avg_spend = float(input_data.get("platform_avg_spend", 500.0))

        reasoning_chain: list[str] = []
        reasoning_chain.append(
            f"Step 1: Received {len(customers)} customers for churn analysis. "
            f"Platform averages: frequency={avg_freq}, spend=${avg_spend:,.0f}."
        )

        if not customers:
            return {
                "churn_output": {
                    "at_risk_customers": [],
                    "campaign_recommendations": [],
                    "reasoning_chain": reasoning_chain + ["No customers provided."],
                    "reasoning_source": "none",
                    "total_at_risk": 0,
                    "estimated_revenue_at_risk": 0.0,
                }
            }

        # ── Step 1: Deterministic ML scoring ─────────────────────────────────
        try:
            ml_result = await self._ml_client.score_churn(customers, avg_freq, avg_spend)
            scored: list[dict] = ml_result.get("results", [])
        except Exception as exc:
            return {
                "churn_output": {
                    "at_risk_customers": [],
                    "campaign_recommendations": [],
                    "reasoning_chain": reasoning_chain + [f"ML error: {exc}"],
                    "reasoning_source": "error",
                    "total_at_risk": 0,
                    "estimated_revenue_at_risk": 0.0,
                    "error": str(exc),
                }
            }

        # ── Step 2: Deterministic campaign assignment (business rules) ────────
        at_risk = [c for c in scored if c.get("risk_level") in {"CRITICAL", "HIGH", "MEDIUM"}]
        critical = [c for c in at_risk if c.get("risk_level") == "CRITICAL"]
        high = [c for c in at_risk if c.get("risk_level") == "HIGH"]
        medium = [c for c in at_risk if c.get("risk_level") == "MEDIUM"]

        reasoning_chain.append(
            f"Step 2: ML RFM scoring complete. "
            f"CRITICAL={len(critical)}, HIGH={len(high)}, MEDIUM={len(medium)} at-risk customers."
        )

        # Campaign assignment rules (deterministic)
        campaign_rules = {
            "CRITICAL": ("VIP_DISCOUNT", 20),
            "HIGH":     ("LOYALTY_POINTS", 10),
            "MEDIUM":   ("WINBACK_EMAIL", 5),
        }

        # ── Step 3: LLM reasoning for per-customer explanations ───────────────
        campaigns: list[dict] = []
        reasoning_source = self._reasoner._backend

        for c in at_risk:
            risk = c.get("risk_level", "MEDIUM")
            campaign_type, discount = campaign_rules.get(risk, ("WINBACK_EMAIL", 5))
            churn_score = float(c.get("churn_score", 0))

            # RFM proxy scores (derived from raw data)
            days = c.get("days_since_last_booking", 999)
            bookings = c.get("total_bookings", 0)
            spend = float(c.get("total_spend", 0))
            rfm_scores = {
                "recency_score": min(100.0, days / 90.0 * 100.0),
                "frequency_score": max(0.0, (1.0 - bookings / (avg_freq * 2.0)) * 100.0) if avg_freq > 0 else 100.0,
                "monetary_score": max(0.0, (1.0 - spend / (avg_spend * 2.0)) * 100.0) if avg_spend > 0 else 100.0,
            }

            # LLM explanation (or deterministic fallback)
            explanation = await self._reasoner.explain_churn_decision(
                customer=c,
                churn_score=churn_score,
                risk_level=risk,
                campaign_type=campaign_type,
                rfm_scores=rfm_scores,
            )

            campaigns.append({
                "customer_id": c["user_id"],
                "display_name": c["display_name"],
                "email": c["email"],
                "campaign_type": campaign_type,
                "discount_pct": discount,
                "churn_score": churn_score,
                "risk_level": risk,
                "llm_explanation": explanation,
                "rfm_scores": rfm_scores,
            })

        reasoning_chain.append(
            f"Step 3: Generated {len(campaigns)} campaign recommendations using "
            f"'{reasoning_source}' reasoning backend. "
            f"VIP_DISCOUNT={len(critical)}, LOYALTY_POINTS={len(high)}, WINBACK_EMAIL={len(medium)}."
        )

        # ── Step 4: Revenue at risk calculation ───────────────────────────────
        estimated_risk = sum(
            float(c.get("total_spend", 0)) * (c.get("churn_score", 0) / 100)
            for c in at_risk
        )
        reasoning_chain.append(
            f"Step 4: Estimated revenue at risk = ${estimated_risk:,.0f} "
            f"(churn_score-weighted total spend across {len(at_risk)} customers)."
        )

        reasoning_chain.append(
            f"Step 5: Recommendation confidence HIGH — RFM model on platform data "
            f"(avg_freq={avg_freq:.1f}, avg_spend=${avg_spend:,.0f}). "
            f"LLM reasoning {'enabled' if self._reasoner.is_llm_enabled else 'disabled (rule-based fallback)'}."
        )

        return {
            "churn_output": {
                "at_risk_customers": at_risk,
                "campaign_recommendations": campaigns,
                "reasoning_chain": reasoning_chain,
                "reasoning_source": reasoning_source,
                "llm_reasoning_enabled": self._reasoner.is_llm_enabled,
                "total_at_risk": len(at_risk),
                "estimated_revenue_at_risk": round(estimated_risk, 2),
            }
        }
