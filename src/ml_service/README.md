# LuxeWay ML Sidecar Service

A Python FastAPI microservice that provides machine learning prediction endpoints for the LuxeWay admin panel.

---

## Prerequisites

- Python 3.11+
- pip

---

## Local Setup

```bash
# Navigate to the ML service directory
cd src/ml_service

# Install pinned dependencies
pip install -r requirements.txt

# Start the development server (hot-reload)
uvicorn main:app --reload --port 8000
```

The service will be available at `http://localhost:8000`.

---

## Docker Run

```bash
docker run --rm -p 8000:8000 \
  -e PYTHONUNBUFFERED=1 \
  $(docker build -q src/ml_service)
```

Or with a dedicated `Dockerfile`:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Running Tests

```bash
cd src/ml_service
pytest tests/ -v
```

---

## Endpoint Reference

| Method | Path                      | Description                                             |
|--------|---------------------------|---------------------------------------------------------|
| GET    | /ml/health                | Health check — returns `{"status":"ok","version":"1.0.0"}` |
| POST   | /ml/revenue/forecast      | OLS revenue forecast with 95% CI                       |
| POST   | /ml/bookings/demand       | 7-day SMA booking demand forecast with DoW weighting   |
| POST   | /ml/vehicles/utilization  | Holt-Winters exponential smoothing utilization forecast |
| POST   | /ml/churn/score           | RFM-weighted churn risk scoring (top 50 customers)     |
| POST   | /ml/anomalies/detect      | Z-score anomaly detection on 14-day rolling window     |

---

## Request / Response Examples

### POST /ml/revenue/forecast

```json
{
  "data": [
    {"date": "2026-01-01", "revenue": 15000000.0, "bookings_count": 12},
    ...
  ],
  "horizon": 14
}
```

Response:

```json
{
  "predictions": [
    {"date": "2026-01-02", "predicted_revenue": 16000000.0, "lower_bound": 14800000.0, "upper_bound": 17200000.0}
  ],
  "r2_score": 0.87,
  "trend_slope": 52000.0,
  "trend_direction": "UP",
  "warning_flag": false
}
```

---

## Architecture Notes

- **No database access** — Spring Boot fetches data from JPA and sends it as JSON payloads.
- **Fallback** — If the sidecar is unreachable, `MLSidecarClient` in Spring Boot falls back to `JavaFallbackService` (7-day SMA) and sets `sidecarWarning: true` in the response.
- **Rate limiting** — POST endpoints in `AIPredictiveController` limit each admin to 10 requests per 60 seconds (in-memory, resets on restart).
- **Cache** — `PredictionCacheService` warms up on startup and refreshes every 15 minutes.
