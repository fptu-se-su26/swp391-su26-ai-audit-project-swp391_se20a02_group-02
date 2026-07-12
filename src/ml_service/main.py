from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import anomaly, churn, demand, health, revenue, utilization

app = FastAPI(title="LuxeWay ML Sidecar", version="1.0.0")

# CORS middleware — allows Spring Boot backend to call the sidecar
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router registration
app.include_router(health.router)
app.include_router(revenue.router)
app.include_router(demand.router)
app.include_router(utilization.router)
app.include_router(churn.router)
app.include_router(anomaly.router)
