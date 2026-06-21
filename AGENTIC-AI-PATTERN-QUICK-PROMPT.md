# PROMPT: Agentic AI Pattern Recommendation Engine
## Dùng cho: Phân tích nhanh pattern phù hợp với LuxeWay Predictive Analytics

---

## SYSTEM CONTEXT

**Project**: LuxeWay - Vehicle Rental E-Commerce Platform  
**Architecture**:
- Backend: Spring Boot 3.2.5 (Java 21) - REST API
- Frontend: React 18+ TypeScript - UI/UX  
- ML Service: Python FastAPI microservice

**Current Prediction Models**:
1. Anomaly Detection - Phát hiện bất thường trong dữ liệu
2. Churn Prediction - Dự đoán khách hàng rời bỏ
3. Demand Forecasting - Dự báo nhu cầu thuê xe
4. Revenue Optimization - Tối ưu hóa doanh thu
5. Utilization Prediction - Dự đoán tỷ lệ sử dụng
6. Health Monitoring - Kiểm tra sức khỏe hệ thống

---

## AGENTIC PATTERNS AVAILABLE

| Pattern | Definition | Characteristics |
|---------|-----------|-----------------|
| **Reactive Agent** | Input → Process → Output | Stateless, single-turn, immediate response |
| **Conversational Agent** | Multi-turn dialogue with context | Memory, feedback, user interaction |
| **Autonomous Agent** | Self-executing tasks | Scheduled, monitoring, auto-decisions |
| **Tool-Using Agent** | Chain multiple tools/APIs | Function calling, multi-step reasoning |
| **Reasoning Agent** | Step-by-step logical thinking | Explanation, justification, chain-of-thought |
| **Multi-Agent Orchestration** | Multiple agents collaborate | Coordination, shared knowledge, complex strategy |

---

## ANALYSIS TASKS

### TASK 1: PATTERN CLASSIFICATION

For EACH prediction model, classify:
```
Model: [Name]
├─ Current Pattern: [What it currently does]
├─ Suggested Patterns: [Top 3 recommended patterns]
├─ Pattern Fit Score: [1-5 stars for each suggestion]
├─ Justification: [Why these patterns fit]
└─ Implementation Priority: [High/Medium/Low]
```

### TASK 2: USE CASE SCENARIOS

Generate 3 use cases for each model that leverage the recommended patterns:
```
Scenario: [Description]
├─ Required Pattern: [Which pattern enables this]
├─ Business Value: [What business benefit]
├─ Implementation Effort: [Effort estimate]
└─ Expected Outcomes: [Metrics improvement]
```

### TASK 3: INTEGRATION OPPORTUNITIES

Identify where multiple agents can collaborate:
```
Collaboration: [Model A] + [Model B]
├─ Combined Use Case: [What you can do together]
├─ Data Flow: [How data flows between them]
├─ Orchestration Method: [How to coordinate]
└─ ROI: [Business value of integration]
```

### TASK 4: IMPLEMENTATION ROADMAP

Create phased implementation plan:
```
Phase 1 (Immediate): [Quick wins with current patterns]
├─ Changes Required: [Minimal modifications]
├─ Timeline: [Weeks]
└─ Risk Level: [Low]

Phase 2 (Short-term): [Upgrade to recommended patterns]
├─ New Technologies: [What to add]
├─ Timeline: [Months]
└─ Risk Level: [Medium]

Phase 3 (Long-term): [Full multi-agent orchestration]
├─ Architecture Changes: [Major refactoring]
├─ Timeline: [Quarter+]
└─ Risk Level: [High but manageable]
```

### TASK 5: DECISION MATRIX

Create scoring matrix:
```
Criteria: [Cost, Effort, ROI, Complexity, Speed, Accuracy]

Anomaly Detection:
├─ Reactive Agent: [Score/5 for each criterion]
├─ Autonomous Agent: [Score/5 for each criterion]
└─ Recommended: [Winner based on criteria]

[Repeat for all 6 models]
```

---

## SPECIFIC QUESTIONS TO ANALYZE

1. **Anomaly Detection**
   - Current: Detects outliers in real-time data
   - Q1: Should it automatically alert or wait for user review?
   - Q2: Does it need to explain WHY data is anomalous?
   - Q3: Should it take action (auto-remediation) or just report?

2. **Churn Prediction**
   - Current: Predicts which customers will leave
   - Q1: Should it recommend retention actions?
   - Q2: Does it need interactive strategy discussion?
   - Q3: Should it coordinate with Marketing systems?

3. **Demand Forecasting**
   - Current: Predicts future demand
   - Q1: Should it use real-time market data?
   - Q2: Does it need seasonal/event adjustments?
   - Q3: Should it generate multiple scenarios?

4. **Revenue Optimization**
   - Current: Suggests optimal pricing
   - Q1: Should it auto-apply or require approval?
   - Q2: Does it need to explain rationale to stakeholders?
   - Q3: Should it run A/B testing automatically?

5. **Utilization Prediction**
   - Current: Predicts vehicle utilization
   - Q1: Should it trigger inventory rebalancing?
   - Q2: Does it need to coordinate with Demand Forecasting?
   - Q3: Should it optimize across all locations?

6. **Health Monitoring**
   - Current: Checks system health
   - Q1: Should it predict failures before they occur?
   - Q2: Should it take preventive actions?
   - Q3: Does it need to correlate with business metrics?

---

## OUTPUT FORMAT EXPECTED

Provide analysis as:

```markdown
# AGENTIC PATTERN RECOMMENDATION REPORT

## Executive Summary
- [Key findings]
- [Top pattern recommendations]
- [Quick win opportunities]

## Detailed Analysis by Model
### 1. Anomaly Detection
- Current Pattern: Reactive Agent
- Recommended Upgrade: Autonomous Agent + Reasoning Agent
- Why: [...reasoning...]
- Quick Wins: [...]
- Full Implementation: [...]

### 2. Churn Prediction
[Similar structure...]

[... continue for all 6 models ...]

## Cross-Model Orchestration Opportunities
- Opportunity 1: [Revenue + Demand]
- Opportunity 2: [Churn + Revenue]
- Opportunity 3: [All agents + Master Orchestrator]

## Implementation Roadmap
### Phase 1 (Month 1-2): Quick Wins
### Phase 2 (Month 3-6): Medium Effort
### Phase 3 (Month 7+): Full Orchestration

## Risk Assessment & Mitigation

## Success Metrics & KPIs

## Code Architecture Recommendations
```

---

## CONSTRAINTS & GUIDELINES

✅ DO:
- Consider existing tech stack (Spring Boot, FastAPI, React)
- Prioritize quick wins with minimum changes
- Focus on business value, not complexity
- Provide implementation feasibility
- Include cost-benefit analysis

❌ DON'T:
- Recommend technologies that break existing architecture
- Suggest patterns without justification
- Ignore performance/latency requirements
- Propose changes that require complete rewrite

---

## EVALUATION CRITERIA

Rate recommendations by:
1. **Business Impact** (1-5): Revenue increase, cost savings, customer satisfaction
2. **Technical Feasibility** (1-5): Can we build it with current stack?
3. **Implementation Effort** (1-5): Time and resources needed
4. **Risk Level** (1-5): Technical and operational risks
5. **Time-to-Value** (1-5): How quickly can we see results?

**Recommendation Score = (Business Impact + Feasibility) - (Effort + Risk) + Time-to-Value**

---

## USAGE INSTRUCTIONS

To use this prompt with an AI:

1. **Copy this entire prompt**
2. **Paste it to your AI tool** (ChatGPT, Claude, Gemini, etc.)
3. **Optionally add context**: Copy-paste relevant files (pom.xml, requirements.txt, architecture diagrams)
4. **Add specific questions** you have about your system
5. **Request output format** you prefer

Example additional context to provide:
```
Here is my system architecture:
[paste architecture diagram or description]

Here are the current model performances:
[paste metrics if available]

Here are my business constraints:
- Budget: $50K
- Timeline: 3 months
- Team size: 5 engineers

Here are specific pain points:
- Revenue model isn't optimizing well
- Churn predictions aren't being acted upon
- Manual processes take too long
```

---

## QUICK REFERENCE: PATTERN SELECTION FLOWCHART

```
START
 ├─ Does it need to act autonomously (no user input)?
 │   ├─ YES → Try Autonomous Agent Pattern
 │   └─ NO → Continue
 │
 ├─ Does it need multi-turn interaction?
 │   ├─ YES → Try Conversational Agent Pattern
 │   └─ NO → Continue
 │
 ├─ Does it need to combine multiple data sources/models?
 │   ├─ YES → Try Tool-Using Agent Pattern
 │   └─ NO → Continue
 │
 ├─ Does it need to explain decisions?
 │   ├─ YES → Try Reasoning Agent Pattern
 │   └─ NO → Use Reactive Agent Pattern
 │
 └─ Do all agents need to collaborate?
     ├─ YES → Design Multi-Agent Orchestration
     └─ NO → Individual agent is sufficient
```

---

## CONTACT & SUPPORT

For questions about this analysis framework:
- Review AGENTIC-AI-PATTERN-ANALYSIS-PROMPT.md for detailed explanations
- Check team documentation for business context
- Consult with architecture/ML teams for technical feasibility

---

**Version**: 1.0  
**Last Updated**: 2026-06-12  
**System**: LuxeWay AI Audit Project (Group 02)
