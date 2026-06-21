# 🤖 SIMPLE PROMPT: Agentic AI Pattern cho LuxeWay
## Use này để copy-paste trực tiếp vào AI (ChatGPT, Claude, etc.)

---

## COPY-PASTE PROMPT NÀY:

```
Tôi đang phát triển hệ thống Predictive Analytics cho nền tảng cho thuê xe LuxeWay.

KIẾN TRÚC HỆ THỐNG:
- Backend: Spring Boot 3.2.5 (Java 21) - REST API
- Frontend: React 18+ TypeScript
- ML Service: Python FastAPI sidecar microservice

PREDICTION MODELS HIỆN TẠI:
1. Anomaly Detection - Phát hiện bất thường
2. Churn Prediction - Dự đoán khách hàng rời bỏ
3. Demand Forecasting - Dự báo nhu cầu
4. Revenue Optimization - Tối ưu doanh thu
5. Utilization Prediction - Dự đoán tỷ lệ sử dụng
6. Health Monitoring - Giám sát hệ thống

AGENTIC AI PATTERNS CÓ THỂ DÙNG:
- Reactive Agent: Input → Output (stateless)
- Conversational Agent: Multi-turn dialogue
- Autonomous Agent: Self-executing tasks
- Tool-Using Agent: Chain multiple APIs
- Reasoning Agent: Explain decisions
- Multi-Agent Orchestration: Multiple agents collaborate

NHIỆM VỤ:
Phân tích cho từng prediction model:
1. Pattern nào phù hợp nhất? (Ghi 3 gợi ý top)
2. Tại sao? (Lý do chọn)
3. Cách triển khai nó thế nào? (Approach)
4. Có thể collaborating giữa các models không? (Use cases)
5. Roadmap triển khai? (Quick wins đầu tiên)

VUI LÒNG CẤP:
- Analysis cho mỗi model (tóm tắt 3-5 dòng)
- Decision matrix (Pattern vs. Fit Score)
- Top 3 quick wins để implement ngay
- Recommended roadmap (3 phase)
- Risks & mitigation strategies
```

---

## HOẶC DÙNG PROMPT NÀY CHO PHÂN TÍCH CHI TIẾT HƠN:

```
Analyze the following predictive analytics system for suitable Agentic AI patterns:

SYSTEM: LuxeWay Vehicle Rental Platform

ARCHITECTURE:
- Backend: Spring Boot 3.2.5 (Java 21), REST API design
- ML Service: Python FastAPI, 6 prediction models
- Frontend: React 18+ TypeScript
- Integration: Microservices architecture

PREDICTION MODELS:
1. Anomaly Detection - Detects unusual patterns in rental data
2. Churn Prediction - Predicts customers who might leave
3. Demand Forecasting - Predicts future vehicle demand
4. Revenue Optimization - Suggests optimal pricing
5. Utilization Prediction - Predicts vehicle utilization rates
6. Health Monitoring - System health checks

AVAILABLE AGENTIC PATTERNS:
- Reactive Agent (stateless, single-turn)
- Conversational Agent (multi-turn, context-aware)
- Autonomous Agent (self-executing, scheduled)
- Tool-Using Agent (chains APIs, multi-step)
- Reasoning Agent (explains decisions, step-by-step)
- Multi-Agent Orchestration (coordinated agents)

YOUR TASK - For each prediction model:

1. PATTERN RECOMMENDATION
   - List 3 best-fit patterns (with star ratings 1-5)
   - Explain why each pattern fits
   - Score pattern-model compatibility

2. USE CASE SCENARIOS
   - 2-3 realistic use cases using recommended patterns
   - Business value each provides
   - Expected outcomes/metrics

3. IMPLEMENTATION APPROACH
   - Specific technical steps to implement
   - Required code changes
   - Effort estimate (hours)
   - Risk assessment

4. QUICK WIN OPPORTUNITIES
   - What can we implement in Sprint 1 (2 weeks)?
   - Minimal code changes for maximum value
   - Success metrics for MVP

5. CROSS-MODEL ORCHESTRATION
   - Where should multiple models collaborate?
   - What data flows between them?
   - Orchestration strategy

DELIVERABLES:
- Pattern recommendation matrix
- Ranked use cases by ROI
- 3-phase implementation roadmap
- Risk mitigation strategies
- Success metrics for each pattern
```

---

## HOẶC NẾU MUỐN PHÂN TÍCH NHANH (2-3 PHÚT):

```
Quick Analysis Request:

System: LuxeWay Predictive Analytics (Spring Boot backend + FastAPI ML sidecar)

Current 6 models: Anomaly, Churn, Demand, Revenue, Utilization, Health

Question: Which Agentic AI pattern fits best with each model to maximize business value?

For each model, provide:
✓ Best pattern (1-2 words)
✓ Why (1 sentence)
✓ Quick win (1 thing to implement immediately)

Format:
- Model Name | Pattern | Reasoning | Quick Win
- Anomaly Detection | Autonomous Agent | Real-time monitoring needed | Add auto-alert mechanism
- [continue...]

Then: What 3 models should work together first? Why?
```

---

## TIPS SỬ DỤNG:

1. **Copy-paste một trong 3 prompts ở trên** vào ChatGPT, Claude, hoặc Gemini
2. **Nếu muốn cụ thể hơn**, thêm info này vào prompt:
   ```
   Business context:
   - We want to increase revenue by 15%
   - Customers abandon 30% of transactions
   - Manual pricing takes 4 hours/day
   
   Technical constraints:
   - Existing team: 5 engineers
   - Timeline: 3 months
   - Budget: $50K
   ```

3. **Nếu có code/files**, attach thêm:
   - `pom.xml` (dependencies)
   - `requirements.txt` (Python dependencies)  
   - Architecture diagram (nếu có)
   - Current model performance metrics

4. **Yêu cầu output cụ thể nếu cần**:
   ```
   Please format output as:
   - Executive summary (3-5 lines)
   - Recommendation table (CSV format)
   - Implementation pseudocode
   - Risk heat map
   ```

---

## EXPECTED OUTPUT:

AI sẽ cấp cho bạn:

```
ANOMALY DETECTION:
├─ Best Pattern: Autonomous Agent + Reasoning Agent
├─ Score: ⭐⭐⭐⭐⭐
├─ Why: Needs real-time monitoring + explanation of anomalies
├─ Quick Win: Add webhook notifications for critical anomalies
├─ Effort: 2-3 days
└─ Expected ROI: Reduce incident response time by 60%

CHURN PREDICTION:
├─ Best Pattern: Conversational Agent + Tool-Using Agent  
├─ Score: ⭐⭐⭐⭐
├─ Why: Requires stakeholder discussion + API integration
├─ Quick Win: Build "what-if" CLI tool for retention strategies
├─ Effort: 4-5 days
└─ Expected ROI: Improve retention rate by 10%

[... continue for all 6 models ...]

ORCHESTRATION:
├─ Priority 1: Revenue + Demand together
├─ Priority 2: Churn + Revenue + Utilization
└─ Priority 3: All models + Master Orchestrator
```

---

## VIDEO GUIDE (Optional):

Nếu muốn học thêm về Agentic AI patterns:
- LangChain Documentation: Agents section
- ReAct Pattern (Reasoning + Acting)
- Multi-Agent Systems architecture
- Tool-Using/Function Calling patterns

---

**Created**: 2026-06-12  
**For**: LuxeWay AI Audit Project Group 02  
**Tested with**: ChatGPT 4, Claude 3.5, Gemini 2.0
