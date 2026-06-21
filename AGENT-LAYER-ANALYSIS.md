# Agent Layer Architecture Analysis – LuxeWay AI Platform

**Date**: 2026-06-15  
**Technology Stack**: FastAPI, LangGraph, ML Sidecar, Redis, SQLAlchemy  
**Deployment**: Docker + Kubernetes / Helm

---

## 1. System Overview

### Architecture Pattern: Hub-and-Spoke Multi-Agent Orchestration

```
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Server (8001)                         │
│                   [JWT Auth + CORS + Metrics]                    │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
       ┌────▼────┐      ┌─────▼──────┐     ┌──▼────────┐
       │ Health  │      │ Orchestrator│     │ Agent API │
       │ Checks  │      │ (LangGraph) │     │ Routes    │
       └────┬────┘      └─────┬──────┘     └───┬───────┘
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   LangGraph DAG   │
                    │   State Executor  │
                    └─────────┬─────────┘
                              │
        ┌─────────┬─────────┬─┴┬─────────┬──────────┐
        │         │         │  │         │          │
    ┌───▼──┐ ┌───▼───┐ ┌──▼──▼───┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐
    │ Health│ │Anomaly│ │ Demand  │ │Churn│ │Revenue│ │Util │
    │ Agent │ │ Agent │ │  Agent  │ │Agent│ │ Agent  │ │Agent│
    └───┬──┘ └───┬───┘ └────┬────┘ └──┬──┘ └──┬──┘ └──┬──┘
        │         │          │         │       │       │
        └─────────┴──────────┴─────────┴───────┴───────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
    ┌───▼────┐         ┌──────▼──────┐      ┌──────▼───┐
    │ML Side │         │ Spring Boot  │      │ Redis    │
    │ car    │         │  Backend     │      │ Pub/Sub  │
    │(8000)  │         │  (8080)      │      │ Events   │
    └────────┘         └──────────────┘      └──────────┘
```

---

## 2. Agent Taxonomy & Responsibilities

### 2.1 Health Agent (REACTIVE PATTERN)

**Purpose**: System health monitoring and dependency verification  
**Triggered**: Cron every 60s or on-demand  
**Dependencies**: ML sidecar, Spring Boot backend

**Decision Logic**:
```
1. Ping ML service /health → captures latency
2. Ping backend /actuator/health → captures availability
3. Evaluate DB connectivity (implicit via backend check)
4. Return health snapshot: HEALTHY | DEGRADED | DOWN
```

**Output Schema**:
```python
{
  "health_output": {
    "status": "HEALTHY",
    "ml_service_ok": bool,
    "backend_ok": bool,
    "latency_ms": float,
    "issues": list[str]
  }
}
```

**Failure Modes**:
- ML sidecar timeout (>10s) → issues logged, status=DEGRADED
- Backend unreachable → status=DEGRADED (non-fatal)
- Both down → status=DOWN (triggers alert)

---

### 2.2 Anomaly Agent (REACTIVE + AUTONOMOUS)

**Purpose**: Detect fleet anomalies (hardware failures, usage patterns)  
**Triggered**: Per-vehicle event from backend OR cron  
**Processing Model**: Direct ML inference (no sub-agents)

**Decision Logic**:
```
1. Fetch recent vehicle events from backend
2. Call ML sidecar /anomaly endpoint
3. Score each anomaly by severity: LOW | MEDIUM | HIGH | CRITICAL
4. Deduplicate via ShortTermMemory (prevents alert fatigue)
5. Publish AnomalyDetectedEvent to Redis
```

**Key Feature**: Anomaly deduplication prevents re-alerting within 24h window.

---

### 2.3 Demand Agent (MULTI-AGENT ORCHESTRATION)

**Purpose**: Forecast vehicle demand with external signal modifiers  
**Sub-agents** (6 parallel tiers):
- **ML Forecasts** (from sidecar):
  - ShortTermForecastSubAgent (7-day)
  - MediumTermForecastSubAgent (14-day)
  - LongTermForecastSubAgent (30-day)
- **External Signals** (parallel, non-blocking):
  - WeatherSubAgent (OpenMeteo API)
  - TourismTrendSubAgent (seasonal calendar)
  - LocalEventSubAgent (holiday/event calendar)

**Synthesis Algorithm**:
```
adjusted_demand = ml_forecast × (1 + Σ external_modifiers / 100)

where external_modifiers = [weather_factor, tourism_factor, event_factor]
```

**Justification for Multi-Agent**:
- 6 independent data sources (3 ML models + 3 external APIs)
- All I/O-bound → massive parallelism win
- Synthesis requires all signals before producing forecast
- Each sub-agent is independently testable

**Execution**: All 6 run concurrently via `asyncio.gather()`, then synthesize results.

---

### 2.4 Revenue Agent (TOOL-USING AGENT)

**Purpose**: Generate pricing recommendations and promotions  
**Tools**: Price optimization engine (ML sidecar)  
**Triggered**: Nightly batch OR triggered by demand surge

**Decision Logic**:
```
1. Fetch current pricing rules + vehicle categories
2. Call ML sidecar with vehicle utilization + demand forecast
3. Receive price delta recommendations: -20% to +50%
4. Apply business rule constraints:
   - Luxury vehicles: max +30% (brand preservation)
   - Economy vehicles: max ±15% (price sensitivity)
5. Return PricingAction[]: list of (vehicle_id, old_price, new_price, reason)
```

**Human-in-Loop** (optional):
- If `requires_human_review=True` in config: pause before publishing
- Backend admin approves/rejects via approval endpoint

---

### 2.5 Churn Agent (REASONING + OPTIONAL LLM)

**Purpose**: Predict customer churn and recommend retention campaigns  
**Sub-components**:
- ML churn prediction (from sidecar)
- RFM scoring (Recency/Frequency/Monetary)
- LLMReasoner for explanation (optional)

**Decision Logic**:
```
1. Fetch customer rental history
2. Score churn probability: 0–1 (from sidecar)
3. Classify risk: LOW | MEDIUM | HIGH | CRITICAL
4. Recommend campaign: discount | loyalty_boost | vip_upgrade
5. (Optional) Generate LLM explanation of decision
6. Return ChurnCampaignAction
```

**LLMReasoner Pattern**:
- If OpenAI/Google API keys present: generate rich explanation
- If absent: fall back to deterministic rule-based explanation
- Decision logic unaffected (always rule-based for auditability)

---

### 2.6 Utilization Agent (REASONING + FORECASTING)

**Purpose**: Predict vehicle utilization and recommend rebalancing  
**Input**: Vehicle availability, historical bookings, geographic distribution  
**Output**: VehicleRelocationAction[]: list of (vehicle_id, source_zone, target_zone, urgency)

**Decision Logic**:
```
1. Fetch 30-day utilization forecast from sidecar
2. Identify underutilized zones (< 40% utilization)
3. Identify overutilized zones (> 80% demand)
4. Recommend relocations with urgency:
   - URGENT (< 2 hours)
   - HIGH (< 6 hours)
   - MEDIUM (< 24 hours)
5. Return location_optimizations list
```

---

## 3. LangGraph Orchestration

### 3.1 Execution DAG

```
┌────────────────┐
│   INITIALIZE   │ (validate inputs, set defaults)
└────────┬───────┘
         │
     ┌───┴─────────────────────────────┐
     │ PARALLEL TIER 1 (I/O bound)     │
     │ health_check, anomaly, demand   │
     └───┬─────────────────────────────┘
         │
     ┌───┴─────────────────────────────┐
     │ SEQUENTIAL TIER 2 (depends Tier1)
     │ revenue, utilization, churn     │
     └───┬─────────────────────────────┘
         │
     ┌───┴──────────────────┐
     │   SYNTHESISE         │
     │ (aggregate outputs)  │
     └───┬──────────────────┘
         │
    [Branch: requires_human_review?]
         │
      YES│               NO
         │               │
    ┌────▼────┐      ┌──▼─────────┐
    │ HUMAN   │      │ PUBLISH    │
    │ REVIEW  │      │ EVENT BUS  │
    └────┬────┘      └────────────┘
         │                │
         └────────┬───────┘
                  │
              ┌───▼──┐
              │ END  │
              └──────┘
```

### 3.2 State Flow

**FleetOrchestrationState**:
```python
{
  "run_id": "uuid",
  "initiated_at": datetime,
  "input_data": {...},
  "health_output": {...},
  "anomaly_output": {...},
  "demand_output": {...},
  "revenue_output": {...},
  "utilization_output": {...},
  "churn_output": {...},
  "final_fleet_action_plan": FleetActionPlan,
  "requires_human_review": bool,
  "checkpointed_at": datetime
}
```

Each agent **reads** from state, **writes** its output slice back.

### 3.3 Checkpointing

**Default**: `MemorySaver` (in-process, lost on restart)  
**Production Recommendation**: `RedisCheckpointer`

```python
checkpointer = MemorySaver()  # Swap to RedisCheckpointer for prod
graph.compile(checkpointer=checkpointer)
```

Benefits:
- Resumable execution after failure
- Audit trail of state progression
- Cross-worker consistency (with Redis)

---

## 4. Memory Architecture (3 Tiers)

### Tier 1 – Short-Term Memory (Session Cache)

**Backend**: In-process TTL dict (Python 3.11)  
**TTL**: 1 hour (configurable)  
**Use Cases**:
- Anomaly deduplication: "Did we already alert on this vehicle hardware failure?"
- Request idempotency: "Have we processed this churn_campaign_id before?"
- Session context: "What was demand forecast from 5 minutes ago?"

**Example**:
```python
short_term_memory.remember_anomaly("vehicle:ABC123:battery_low", ttl_hours=24)
# Returns: True if already seen, False if new
```

**Production Note**: Replace with Redis for multi-instance deployments.

---

### Tier 2 – Long-Term Memory (Persistent Facts)

**Backend**: SQLite (dev) / SQL Server (prod)  
**Retention**: Indefinite (persist across restarts)  
**Use Cases**:
- Campaign tracking: "Customer XYZ received VIP campaign on 2026-06-10 — don't repeat"
- Pricing history: "SUV price increased 30% on 2026-06-13 — don't increase again within 30d"
- Model deployment log: "Churn model v2.3 deployed on 2026-05-20"

**Schema** (conceptual):
```
agents_facts:
  - fact_id (UUID)
  - agent_name (AgentName)
  - key (str): "customer:789:vip_campaign"
  - value (JSON)
  - created_at
  - expires_at (optional)
```

---

### Tier 3 – Historical Learning Memory (Metrics)

**Backend**: JSON append-only log + MLflow (optional)  
**Retention**: 90+ days (for drift detection)  
**Use Cases**:
- Model performance drift: "Demand model accuracy dropped from 92% to 84% over 7 days"
- Recommendation effectiveness: "70% of churn campaigns converted; down from 78% last month"
- Agent latency trends: "Revenue agent P95 latency increased from 200ms to 450ms"

**Integration**: Agents emit metrics to MLflow during execution.

---

## 5. Event-Driven Architecture

### Event Bus (Redis Pub/Sub)

**Why Not Kafka?** Redis already in stack for memory caching; Pub/Sub sufficient for <1s latency.  
**Migration Path**: Swap `RedisEventBus` ↔ `KafkaEventBus` (same interface).

**Channel Naming**:
```
luxeway.events.anomaly_detected
luxeway.events.pricing_recommended
luxeway.events.churn_alert
luxeway.events.health_degraded
luxeway.events.demand_spike
luxeway.events.fleet_action_plan
```

**Event Example**:
```python
AnomalyDetectedEvent(
  event_id="evt_123",
  source_agent="AnomalyAgent",
  vehicle_id="veh_456",
  anomaly_type="HARDWARE_FAILURE",
  severity="CRITICAL",
  payload={...}
)
```

**Subscribers** (Backend-side):
- Spring Boot `AgentEventSubscriber` (Feign HTTP polling OR WebSocket)
- Processes events asynchronously
- Decouples agent layer from backend business logic

---

## 6. Design Patterns & Addresses

### Pattern 1: Reactive Agent (Health)
- **When**: Pure input → process → output, stateless
- **Latency**: <100ms
- **Used by**: HealthAgent

### Pattern 2: Multi-Agent Orchestration (Demand)
- **When**: Multiple independent data sources, parallel I/O
- **Latency**: <2s (6 parallel tasks)
- **Justified by**: 3 ML models + 3 external signal APIs running concurrently

### Pattern 3: Tool-Using Agent (Revenue)
- **When**: Agent calls external tools/APIs as part of decision logic
- **Latency**: 500–2000ms (ML sidecar call)
- **Used by**: RevenueAgent (calls price optimization engine)

### Pattern 4: Reasoning Agent (Churn, Utilization)
- **When**: Complex heuristic decision logic + optional LLM explanation
- **Latency**: 200–1000ms
- **Used by**: ChurnAgent, UtilizationAgent
- **LLM Integration**: Optional; falls back to rule-based if API key absent

### Pattern 5: Augmented Reasoning (Churn + LLMReasoner)
- **When**: Decision logic should remain deterministic, but explanations benefit from LLM
- **Trade-off**: LLM enhances narrative quality, not decision accuracy
- **Auditability**: Always deterministic → fully reproducible

---

## 7. API Endpoints

### Agent Service (FastAPI, Port 8001)

```
GET  /health                          — Service health
GET  /docs                            — Interactive Swagger UI
GET  /metrics                         — Prometheus metrics (optional)

POST /api/v1/agent/health             — Run health check
POST /api/v1/agent/anomaly            — Detect anomalies
POST /api/v1/agent/demand             — Forecast demand
POST /api/v1/agent/churn              — Predict churn
POST /api/v1/agent/revenue            — Optimize pricing
POST /api/v1/agent/utilization        — Recommend rebalancing

POST /api/v1/orchestrate              — Run full orchestration DAG
GET  /api/v1/orchestrate/{run_id}     — Fetch result by run_id

POST /api/v1/orchestrate/{run_id}/approve  — Human approval (if required)
POST /api/v1/orchestrate/{run_id}/reject   — Human rejection
```

### Authentication

**JWT Bearer Token**:
```
Authorization: Bearer <token>
```

**Token Validation**:
- Algorithm: HS256
- Claim `aud` must match `SERVICE_NAME`
- Expiry: 60 minutes (configurable)

**Fallback**: `AGENT_API_KEY` header for internal service-to-service calls.

---

## 8. Deployment & Infrastructure

### Containerization (Dockerfile)

**Multi-stage build**:
1. **Builder stage**: Install dependencies, compile
2. **Production stage**: Minimal runtime (3.11-slim)

**Security**:
- Non-root user (`luxeway:luxeway`)
- No build artifacts in production image
- Health check: `GET http://localhost:8001/health` every 30s

**Size**: ~200–300 MB (slim base + dependencies)

---

### Kubernetes / Helm

**Chart Structure**:
```
helm/
  Chart.yaml
  values.yaml
  templates/
    deployment.yaml
    service.yaml
    hpa.yaml (autoscaling)
    pdb.yaml (pod disruption budget)
```

**Configuration**:
```yaml
replicaCount: 2
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "1000m"

autoscaling:
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

**Environment Variables** (from ConfigMap/Secret):
```
ML_SERVICE_URL=http://ml-service:8000
BACKEND_URL=http://backend-service:8080
JWT_SECRET_KEY=<secret>
REDIS_URL=redis://redis-service:6379
DATABASE_URL=<sql-server-connection-string>
```

---

## 9. Configuration & Settings

**config.py** (Pydantic v2):
```python
class Settings(BaseSettings):
    SERVICE_NAME = "luxeway-agent-layer"
    SERVICE_VERSION = "1.0.0"
    
    # Network
    HOST = "0.0.0.0"
    PORT = 8001
    WORKERS = 4
    
    # Dependencies
    ML_SERVICE_URL = "http://localhost:8000"
    ML_TIMEOUT_SECONDS = 10.0
    BACKEND_URL = "http://localhost:8080"
    
    # Memory/cache
    REDIS_URL = "redis://localhost:6379/0"
    REDIS_TTL_SECONDS = 3600
    
    # Orchestration
    ORCHESTRATOR_TIMEOUT_SECONDS = 30.0
    MAX_CONCURRENT_AGENTS = 6
    LANGGRAPH_RECURSION_LIMIT = 50
    
    class Config:
        env_file = ".env"  # Load from .env in development
```

---

## 10. Execution Flow Example

### Request: Full Fleet Optimization

```http
POST /api/v1/orchestrate
Authorization: Bearer <token>
Content-Type: application/json

{
  "input_data": {
    "fleet_id": "fleet_001",
    "analysis_period_days": 30
  },
  "vehicle_categories": ["SEDAN", "SUV", "VAN"],
  "require_human_review": true
}
```

### Server Processing (Synchronous, 30s timeout):

```
1. INITIALIZE
   - Validate JWT token
   - Parse request, set defaults
   - Create run_id = "run_abc123"
   - State = {run_id, initiated_at, input_data, ...}

2. PARALLEL TIER 1 (concurrent)
   - health_agent.execute(state) → health_output
   - anomaly_agent.execute(state) → anomaly_output
   - demand_agent.execute(state) → demand_output (6 sub-agents in parallel)
   - Max 3 concurrent → <2s total

3. SEQUENTIAL TIER 2 (awaits Tier 1)
   - revenue_agent.execute(state) → revenue_output
   - utilization_agent.execute(state) → utilization_output
   - churn_agent.execute(state) → churn_output
   - Max 3 sequential → <3s total

4. SYNTHESISE
   - Combine 6 outputs into FleetActionPlan
   - Determine overall confidence
   - Checkpoint to Redis (MemorySaver)

5. BRANCH: requires_human_review?
   - YES: Return 202 ACCEPTED, status=HUMAN_REVIEW
   - NO: Publish FleetActionPlanEvent to Redis, return 200 OK

6. END
```

### Response (requires_human_review=true):

```json
{
  "run_id": "run_abc123",
  "status": "HUMAN_REVIEW",
  "started_at": "2026-06-15T16:47:00Z",
  "estimated_completion": "2026-06-15T17:18:00Z",
  "approval_url": "/api/v1/orchestrate/run_abc123/approve",
  "rejection_url": "/api/v1/orchestrate/run_abc123/reject"
}
```

### Human Approval:

```http
POST /api/v1/orchestrate/run_abc123/approve
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "approved_by": "admin_user_123",
  "comment": "Looks good, proceed with pricing changes"
}
```

### Backend Receives Event:

Agent service publishes to Redis:
```
Channel: luxeway.events.fleet_action_plan
Event: {
  "run_id": "run_abc123",
  "pricing_actions": [...],
  "relocation_actions": [...],
  "campaign_actions": [...]
}
```

Spring Boot subscribes, processes actions:
- Updates vehicle pricing in DB
- Creates relocation tasks
- Triggers email campaigns

---

## 11. Error Handling & Resilience

### Timeout Handling

| Component | Timeout | Behavior |
|-----------|---------|----------|
| ML sidecar | 10s | Retry 3x with exponential backoff |
| Backend | 5s | Log error, return degraded response |
| Orchestrator | 30s | Return TIMEOUT error, allow retry |

### Retry Strategy (Tenacity)

```python
@retry(
    wait=wait_exponential(multiplier=1, min=2, max=10),
    stop=stop_after_attempt(3),
    reraise=True
)
async def call_ml_sidecar(...):
    ...
```

### Circuit Breaker Pattern (Optional)

```python
if ml_service_failures > 5 in last 60s:
    # Open circuit: fast-fail, don't retry
    raise ServiceUnavailableError("ML sidecar unavailable, circuit open")
```

---

## 12. Monitoring & Observability

### Prometheus Metrics (Optional)

```python
REQUEST_COUNT = Counter(
    "agent_requests_total",
    "Total agent requests",
    ["endpoint", "status"]
)
REQUEST_LATENCY = Histogram(
    "agent_request_duration_seconds",
    "Agent request latency",
    ["endpoint"]
)
```

### Structured Logging

```json
{
  "time": "2026-06-15T16:47:05Z",
  "level": "INFO",
  "logger": "luxeway.agents.churn",
  "message": "Agent completed",
  "run_id": "run_abc123",
  "agent_name": "ChurnAgent",
  "output_keys": ["churn_campaigns", "confidence"],
  "duration_ms": 245.3
}
```

### MLflow Integration

```python
mlflow.log_metric("churn_model_accuracy", 0.87, step=epoch)
mlflow.log_param("model_version", "v2.3")
mlflow.log_artifact("confusion_matrix.png")
```

---

## 13. Architecture Decision Records (ADRs)

### ADR-001: LangGraph vs Async/Await

**Decision**: Use LangGraph StateGraph for orchestration.

**Trade-offs**:
| Aspect | LangGraph | Raw Async |
|--------|-----------|-----------|
| State Management | Built-in, typed | Manual dict passing |
| Checkpointing | Native support | Must implement |
| Human-in-Loop | Conditional branching | Complex control flow |
| Debugging | Execution graph visualization | Stack traces only |
| Learning Curve | Steeper (new DSL) | Familiar (Python async) |

**Verdict**: LangGraph's built-in checkpointing and human-in-loop justify the complexity.

---

### ADR-002: Redis vs Kafka for Events

**Decision**: Use Redis Pub/Sub for MVP; migrate to Kafka later.

**Rationale**:
- Redis already in stack (for memory caching)
- Agent → Backend events <1s latency acceptable
- Simple adapter interface allows swapping implementation
- Kafka adds complexity (partitioning, consumer groups) for v1

**Migration Path**:
```python
# Today:
event_bus = RedisEventBus()

# Tomorrow:
event_bus = KafkaEventBus(bootstrap_servers=[...])

# No agent code changes required
```

---

## 14. Known Limitations & Future Improvements

### Limitations

1. **MemorySaver Checkpointing** (dev-only)
   - Lost on restart
   - Single-instance only
   - Upgrade to RedisCheckpointer for prod

2. **LLM Integration** (optional, non-blocking)
   - Adds 1–2s latency per explanation
   - Disabled if API key absent
   - Falls back to rule-based (always works)

3. **Demand Agent** (6 parallel sub-agents)
   - External signal sub-agents rely on public APIs
   - No fallback if OpenMeteo/tourism API down
   - Consider caching results for 1h

4. **No Distributed Tracing** (yet)
   - No OpenTelemetry instrumentation
   - Recommend adding for multi-service debugging

---

### Improvement Roadmap

| Phase | Feature | Effort |
|-------|---------|--------|
| v1.1 | RedisCheckpointer | 1 day |
| v1.2 | OpenTelemetry tracing | 2 days |
| v1.3 | External signal API fallback cache | 1 day |
| v2.0 | Kafka event streaming | 3 days |
| v2.1 | Agent auto-scaling (per-agent replicas) | 2 days |

---

## 15. Testing Strategy

### Unit Tests

**File**: `tests/test_agents.py`

```python
@pytest.mark.asyncio
async def test_health_agent_success():
    mock_ml = MockMLClient(health_ok=True)
    agent = HealthAgent(ml_client=mock_ml, backend_url="http://localhost:8080")
    output, log = await agent.execute({}, run_id="test_run")
    
    assert output["health_output"]["status"] == "HEALTHY"
    assert log.status == AgentStatus.SUCCESS

@pytest.mark.asyncio
async def test_health_agent_timeout():
    mock_ml = MockMLClient(timeout_seconds=15)
    agent = HealthAgent(ml_client=mock_ml, ...)
    output, log = await agent.execute({}, run_id="test_run")
    
    assert output["health_output"]["status"] == "DEGRADED"
    assert log.status == AgentStatus.SUCCESS  # Agent handled timeout gracefully
```

### Integration Tests

- Use `testcontainers` to spin up Redis, PostgreSQL
- Mock ML sidecar with responses
- Test end-to-end orchestration

### Load Testing

- **Tool**: Locust
- **Target**: 1000 req/min sustained
- **Metrics**: P95 latency <5s, P99 <10s

---

## 16. Security Considerations

### JWT Authentication

- Algorithm: HS256
- Secret key: rotate every 30 days
- Expiry: 60 minutes (refresh on each request)
- Audience claim validation

### API Key Rotation

```
# Implement in backend:
POST /admin/agents/rotate-api-key
  Response: {new_key, revoke_old_at: now + 24h}
```

### Rate Limiting

- 1000 requests / 60 seconds per IP
- Per-endpoint limits: `/api/v1/orchestrate`: 10/min

### Secrets Management

- Store `JWT_SECRET_KEY`, `AGENT_API_KEY`, `OPENAI_API_KEY` in K8s Secrets
- Never log secrets (sanitize logs)
- Rotate quarterly

---

## 17. Conclusion

**Agent Layer Status**: Production-ready for v1.0

**Strengths**:
✅ Clean hub-and-spoke architecture (LangGraph)
✅ 6 specialized agents with distinct patterns (reactive, multi-agent, reasoning, tool-using)
✅ 3-tier memory model (short/long/historical)
✅ Event-driven with Redis Pub/Sub (Kafka migration path)
✅ Optional LLM reasoning without blocking decision logic
✅ Comprehensive error handling & retry strategies
✅ Kubernetes-ready with Helm charts

**Near-term Priorities**:
1. Upgrade to RedisCheckpointer (replace MemorySaver)
2. Add OpenTelemetry distributed tracing
3. Implement external signal API caching
4. Security audit of JWT/API key rotation

**Long-term Vision**:
- Multi-tenant agent scheduling
- Per-agent auto-scaling based on queue depth
- Kafka event streaming for high-throughput scenarios
- Advanced debugging with execution graph visualization

---

**Generated**: 2026-06-15  
**System**: LuxeWay Agent Layer v1.0.0
