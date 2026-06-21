"""
copilot_agent.py — Conversational Interface for Admins
"""
from __future__ import annotations

from typing import Any
import json
import logging

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field

from agents.base_agent import BaseAgent
from connectors.ml_client import MLSidecarClient
from models.agent_schemas import AgentName
from config import settings

class CopilotResponse(BaseModel):
    response_text: str = Field(description="The natural language response to the user's query.")
    suggested_actions: list[str] = Field(description="A list of 2-3 short, actionable buttons the user can click next (e.g. 'View Dashboard').")
    routed_to: str = Field(description="The sub-agent this intent belongs to: 'analytics', 'anomaly', 'utilization', 'supervisor', or 'none'.")

class CopilotAgent(BaseAgent):
    """
    COPILOT AGENT (SUPERVISOR MVP)
    Responsibility: Act as the LLM interface between Admin and other agents.
    Uses Google Gemini to parse intents, format responses, and route queries.
    """

    agent_name = AgentName.COPILOT

    def __init__(self, ml_client: MLSidecarClient, backend_url: str) -> None:
        super().__init__()
        self._ml_client = ml_client
        self._backend_url = backend_url
        
        # Initialize Gemini LLM
        if settings.GEMINI_API_KEY:
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.2
            )
            self.structured_llm = self.llm.with_structured_output(CopilotResponse)
        else:
            self.structured_llm = None

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        prompt = state.get("prompt", "")
        admin_id = state.get("admin_id", "Unknown")
        
        if not self.structured_llm:
            return {
                "response_text": "⚠️ GEMINI_API_KEY is not configured in the Agent Layer. Please open the `.env` file in the `agent-layer` directory and add your key.",
                "suggested_actions": ["Configure API Key"],
                "routed_to": None
            }

        system_prompt = (
            "You are the LuxeWay AI Copilot, an enterprise-grade assistant for a luxury car rental marketplace. "
            f"You are speaking to Admin {admin_id}. "
            "Your job is to analyze their query, answer them professionally, and determine which sub-agent should handle any deeper analysis. "
            "Available sub-agents: 'analytics' (revenue, bookings), 'anomaly' (fraud, kyc risks), 'utilization' (fleet usage), 'supervisor' (disputes/general). "
            "Provide 2-3 suggested action buttons. Keep responses concise, professional, and use emojis where appropriate."
        )

        try:
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=prompt)
            ]
            
            result: CopilotResponse = await self.structured_llm.ainvoke(messages)
            
            self.logger.info("Gemini Copilot processed prompt", extra={"routed_to": result.routed_to})
            
            return {
                "response_text": result.response_text,
                "suggested_actions": result.suggested_actions,
                "routed_to": result.routed_to
            }
        except Exception as e:
            self.logger.error(f"Gemini API Error: {str(e)}")
            return {
                "response_text": f"❌ An error occurred while contacting the Gemini model: {str(e)}",
                "suggested_actions": ["Retry"],
                "routed_to": None
            }
