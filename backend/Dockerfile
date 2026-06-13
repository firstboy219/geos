# ── Stage 1: builder ── install deps ke ~/.local agar bisa di-copy ──
FROM python:3.11-slim AS builder

WORKDIR /build

# Build deps untuk asyncpg / bcrypt
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ── Stage 2: runtime ── image final ringan ──
FROM python:3.11-slim

# libpq runtime untuk asyncpg
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed python packages dari builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Source code + migrations + scripts
COPY ./app /app/app
COPY ./alembic /app/alembic
COPY ./alembic.ini /app/alembic.ini
COPY ./scripts /app/scripts

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:8000/health || exit 1

# Single worker — server hanya 2 vCPU / 3.7 GB RAM
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
