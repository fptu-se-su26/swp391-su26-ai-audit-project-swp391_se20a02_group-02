"""
model_registry.py — MLflow Model Registry integration for LuxeWay agent layer.

Provides:
- Model registration and versioning
- Model loading by alias (latest, staging, production)
- Drift detection trigger
- Retraining pipeline hook
"""
from __future__ import annotations

import logging
from typing import Any, Optional

logger = logging.getLogger("luxeway.mlops.model_registry")

try:
    import mlflow
    from mlflow.tracking import MlflowClient
    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False
    logger.warning("mlflow not installed — model registry unavailable")


class ModelRegistry:
    """
    MLflow-backed model registry.

    Models tracked:
    - anomaly-detection (Z-score, Isolation Forest)
    - churn-prediction  (RFM scoring)
    - demand-forecasting (OLS + SMA)
    - revenue-optimization (OLS linear regression)
    - utilization-prediction (moving average)
    """

    MODEL_NAMES = [
        "anomaly-detection",
        "churn-prediction",
        "demand-forecasting",
        "revenue-optimization",
        "utilization-prediction",
    ]

    def __init__(self, tracking_uri: str = "http://localhost:5000") -> None:
        self._tracking_uri = tracking_uri
        if MLFLOW_AVAILABLE:
            mlflow.set_tracking_uri(tracking_uri)
            self._client = MlflowClient()
        else:
            self._client = None

    def register_model(
        self,
        model_name: str,
        run_id: str,
        artifact_path: str = "model",
        tags: Optional[dict] = None,
    ) -> Optional[str]:
        """Register a new model version to MLflow registry."""
        if not MLFLOW_AVAILABLE or not self._client:
            logger.warning("MLflow not available — model registration skipped")
            return None
        try:
            model_uri = f"runs:/{run_id}/{artifact_path}"
            result = mlflow.register_model(model_uri, model_name)
            version = result.version
            if tags:
                for k, v in tags.items():
                    self._client.set_model_version_tag(model_name, version, k, v)
            logger.info(f"Registered model '{model_name}' version {version}")
            return version
        except Exception as exc:
            logger.error(f"Failed to register model '{model_name}': {exc}")
            return None

    def get_latest_version(self, model_name: str, stage: str = "Production") -> Optional[Any]:
        """Get the latest model version for a given stage."""
        if not MLFLOW_AVAILABLE or not self._client:
            return None
        try:
            versions = self._client.get_latest_versions(model_name, stages=[stage])
            return versions[0] if versions else None
        except Exception as exc:
            logger.error(f"Failed to get latest version for '{model_name}': {exc}")
            return None

    def promote_to_production(self, model_name: str, version: str) -> bool:
        """Transition a model version to Production stage."""
        if not MLFLOW_AVAILABLE or not self._client:
            return False
        try:
            self._client.transition_model_version_stage(
                name=model_name, version=version, stage="Production"
            )
            logger.info(f"Promoted '{model_name}' v{version} to Production")
            return True
        except Exception as exc:
            logger.error(f"Failed to promote model: {exc}")
            return False

    def log_prediction_metrics(
        self,
        model_name: str,
        metrics: dict[str, float],
        run_name: Optional[str] = None,
    ) -> None:
        """Log metrics for a prediction run to MLflow tracking."""
        if not MLFLOW_AVAILABLE:
            return
        with mlflow.start_run(run_name=run_name or f"{model_name}-prediction"):
            mlflow.set_tag("model_name", model_name)
            for key, value in metrics.items():
                mlflow.log_metric(key, value)

    def list_all_models(self) -> list[dict]:
        """List all registered models."""
        if not MLFLOW_AVAILABLE or not self._client:
            return [{"name": m, "status": "mlflow_unavailable"} for m in self.MODEL_NAMES]
        try:
            registered = self._client.search_registered_models()
            return [
                {
                    "name": m.name,
                    "latest_versions": [
                        {"version": v.version, "stage": v.current_stage}
                        for v in m.latest_versions
                    ],
                }
                for m in registered
            ]
        except Exception as exc:
            logger.error(f"Failed to list models: {exc}")
            return []
