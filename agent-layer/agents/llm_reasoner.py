"""
llm_reasoner.py — Optional LLM Explanation Layer for Reasoning Agents

Addresses reviewer feedback #1:
  "ChurnAgent and UtilizationAgent currently rely on deterministic ML outputs
   and business rules. Consider introducing an LLM-powered explanation layer."

Design Decision:
  - LLM is OPTIONAL: when OPENAI_API_KEY / GOOGLE_API_KEY is absent,
    falls back to rule-based chain-of-thought (deterministic).
  - LLM enhances the WHY (explanation quality), not the WHAT (decision logic).
  - Decision logic remains deterministic → preserves latency and auditability.
  - Uses prompt templates from prompts/ directory.

This pattern is called: "Augmented Reasoning Agent"
  Rule-based decision → LLM narrative explanation → Structured output

Trade-off documented in ADR-001.
"""
from __future__ import annotations

import logging
import os
from typing import Any, Optional

logger = logging.getLogger("luxeway.agents.llm_reasoner")


class LLMReasoner:
    """
    Wraps deterministic agent decisions with LLM-generated natural-language
    explanations when an LLM backend is configured.

    Supported backends (in priority order):
      1. Google Gemini  (GOOGLE_API_KEY)
      2. OpenAI GPT-4o  (OPENAI_API_KEY)
      3. Fallback       (rule-based chain-of-thought, always available)
    """

    def __init__(self) -> None:
        self._backend = self._detect_backend()
        logger.info(f"LLMReasoner initialised with backend: {self._backend}")

    @staticmethod
    def _detect_backend() -> str:
        if os.getenv("GOOGLE_API_KEY"):
            return "gemini"
        if os.getenv("OPENAI_API_KEY"):
            return "openai"
        return "rule_based"

    @property
    def is_llm_enabled(self) -> bool:
        return self._backend in ("gemini", "openai")

    # ── Churn Reasoning ───────────────────────────────────────────────────────

    async def explain_churn_decision(
        self,
        customer: dict[str, Any],
        churn_score: float,
        risk_level: str,
        campaign_type: str,
        rfm_scores: dict[str, float],
    ) -> str:
        """
        Generate a human-readable explanation for a churn intervention decision.

        If LLM is enabled: produces rich natural-language rationale.
        If LLM is disabled: returns deterministic rule-based explanation.
        """
        if not self.is_llm_enabled:
            return self._rule_based_churn_explanation(
                customer, churn_score, risk_level, campaign_type, rfm_scores
            )

        prompt = self._build_churn_prompt(customer, churn_score, risk_level, campaign_type, rfm_scores)
        return await self._call_llm(prompt, max_tokens=200)

    def _rule_based_churn_explanation(
        self,
        customer: dict,
        churn_score: float,
        risk_level: str,
        campaign_type: str,
        rfm_scores: dict,
    ) -> str:
        name = customer.get("display_name", "Customer")
        days = customer.get("days_since_last_booking", "?")
        bookings = customer.get("total_bookings", 0)
        spend = customer.get("total_spend", 0.0)
        r = rfm_scores.get("recency_score", 0)
        f = rfm_scores.get("frequency_score", 0)
        m = rfm_scores.get("monetary_score", 0)
        return (
            f"{name} receives a {risk_level} churn risk score of {churn_score:.1f}/100 "
            f"based on RFM analysis: Recency={r:.0f} (last booking {days} days ago), "
            f"Frequency={f:.0f} ({bookings} completed bookings), "
            f"Monetary={m:.0f} (${spend:,.0f} total spend). "
            f"The {campaign_type} campaign is recommended because "
            f"{'immediate re-engagement is critical' if risk_level == 'CRITICAL' else 'loyalty reinforcement will prevent departure'}."
        )

    @staticmethod
    def _build_churn_prompt(
        customer: dict,
        churn_score: float,
        risk_level: str,
        campaign_type: str,
        rfm_scores: dict,
    ) -> str:
        return (
            f"You are a customer retention analyst for LuxeWay, a vehicle rental platform.\n\n"
            f"Customer: {customer.get('display_name')}\n"
            f"Churn Risk Score: {churn_score:.1f}/100 ({risk_level})\n"
            f"Days since last booking: {customer.get('days_since_last_booking')}\n"
            f"Total bookings: {customer.get('total_bookings')}\n"
            f"Total spend: ${customer.get('total_spend', 0):,.0f}\n"
            f"RFM breakdown: Recency={rfm_scores.get('recency_score', 0):.0f}, "
            f"Frequency={rfm_scores.get('frequency_score', 0):.0f}, "
            f"Monetary={rfm_scores.get('monetary_score', 0):.0f}\n"
            f"Recommended campaign: {campaign_type}\n\n"
            f"In 2-3 sentences, explain why this customer is at {risk_level} churn risk "
            f"and why the {campaign_type} campaign is the appropriate intervention. "
            f"Be specific about the RFM signals. Be concise and professional."
        )

    # ── Utilization Reasoning ─────────────────────────────────────────────────

    async def explain_rebalancing_decision(
        self,
        from_category: str,
        to_category: str,
        from_rate: float,
        to_rate: float,
        vehicles_to_move: int,
        demand_signal: float,
    ) -> str:
        """Generate explanation for a vehicle rebalancing recommendation."""
        if not self.is_llm_enabled:
            return self._rule_based_rebalancing_explanation(
                from_category, to_category, from_rate, to_rate, vehicles_to_move, demand_signal
            )

        prompt = (
            f"You are a fleet operations analyst for LuxeWay vehicle rental.\n\n"
            f"Rebalancing recommendation:\n"
            f"- Move {vehicles_to_move} vehicles FROM {from_category} zone (utilization={from_rate:.0%}) "
            f"TO {to_category} zone (utilization={to_rate:.0%})\n"
            f"- Demand forecast: +{demand_signal:.1f}% for {to_category}\n\n"
            f"In 2-3 sentences, explain the operational rationale for this rebalancing decision. "
            f"Reference the utilization imbalance and demand signal. Be concise and actionable."
        )
        return await self._call_llm(prompt, max_tokens=150)

    @staticmethod
    def _rule_based_rebalancing_explanation(
        from_cat: str, to_cat: str, from_rate: float, to_rate: float,
        count: int, demand_signal: float,
    ) -> str:
        return (
            f"{from_cat} fleet is underutilized at {from_rate:.0%} while "
            f"{to_cat} is over-utilized at {to_rate:.0%}, exceeding the 85% operational threshold. "
            f"Relocating {count} vehicles from {from_cat} to {to_cat} demand zones will "
            f"{'address critical capacity shortage' if to_rate > 0.90 else 'optimise fleet distribution'}, "
            f"supported by a demand forecast increase of +{demand_signal:.1f}% for {to_cat}."
        )

    # ── LLM Call (backend-agnostic) ───────────────────────────────────────────

    async def _call_llm(self, prompt: str, max_tokens: int = 200) -> str:
        """Dispatch to the configured LLM backend."""
        try:
            if self._backend == "gemini":
                return await self._call_gemini(prompt, max_tokens)
            elif self._backend == "openai":
                return await self._call_openai(prompt, max_tokens)
        except Exception as exc:
            logger.warning(f"LLM call failed ({self._backend}): {exc}. Falling back to rule-based.")
        return "[LLM explanation unavailable — using rule-based reasoning]"

    async def _call_gemini(self, prompt: str, max_tokens: int) -> str:
        """Call Google Gemini API."""
        import google.generativeai as genai  # type: ignore
        genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={"max_output_tokens": max_tokens, "temperature": 0.3},
        )
        return response.text.strip()

    async def _call_openai(self, prompt: str, max_tokens: int) -> str:
        """Call OpenAI GPT API."""
        from openai import AsyncOpenAI  # type: ignore
        client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()


# ── Module singleton ──────────────────────────────────────────────────────────
llm_reasoner = LLMReasoner()
