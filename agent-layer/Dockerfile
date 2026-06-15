# ── LuxeWay Agent Service Dockerfile ──────────────────────────────────────────
# Multi-stage build for minimal production image

# Stage 1: Build/install dependencies
FROM python:3.11-slim AS builder

WORKDIR /install

# Install build deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install/deps -r requirements.txt


# Stage 2: Production image
FROM python:3.11-slim AS production

LABEL maintainer="LuxeWay Platform Team"
LABEL service="luxeway-agent-service"
LABEL version="1.0.0"

# Security: non-root user
RUN groupadd -r luxeway && useradd --no-log-init -r -g luxeway luxeway

WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /install/deps /usr/local

# Copy application code
COPY --chown=luxeway:luxeway . .

# Create __init__.py files for packages
RUN find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

USER luxeway

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')"

EXPOSE 8001

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV ENVIRONMENT=production

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "4", "--log-level", "info"]
