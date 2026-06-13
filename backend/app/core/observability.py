"""Phase 7 — structured logging, Sentry, Prometheus metrics.

All wiring is guarded so the app still boots if a dependency or env var is absent.
"""
from __future__ import annotations

import logging

from app.core.config import settings

logger = logging.getLogger("geoscan.observability")

# ── Custom metrics (lazy; no-op if prometheus_client missing) ──
try:
    from prometheus_client import Counter, Gauge

    TRIPWIRE_FIRES = Counter(
        "geoscan_tripwire_fires_total", "Tripwires fired", ["category", "severity"]
    )
    MUTATIONS = Counter(
        "geoscan_mutations_total", "Scenario mutations", ["trigger_reason"]
    )
    WS_CONNECTIONS = Gauge(
        "geoscan_active_ws_connections", "Active WebSocket connections"
    )
    _METRICS = True
except Exception:  # pragma: no cover
    TRIPWIRE_FIRES = MUTATIONS = WS_CONNECTIONS = None
    _METRICS = False


def inc_tripwire(category: str = "", severity: str = "") -> None:
    if _METRICS:
        try:
            TRIPWIRE_FIRES.labels(category=category or "n/a", severity=severity or "n/a").inc()
        except Exception:
            pass


def inc_mutation(trigger_reason: str = "") -> None:
    if _METRICS:
        try:
            MUTATIONS.labels(trigger_reason=trigger_reason or "n/a").inc()
        except Exception:
            pass


def ws_connect() -> None:
    if _METRICS:
        try:
            WS_CONNECTIONS.inc()
        except Exception:
            pass


def ws_disconnect() -> None:
    if _METRICS:
        try:
            WS_CONNECTIONS.dec()
        except Exception:
            pass


def setup_logging() -> None:
    """JSON structured logging via structlog (falls back to stdlib)."""
    try:
        import structlog

        structlog.configure(
            processors=[
                structlog.processors.add_log_level,
                structlog.processors.TimeStamper(fmt="iso"),
                structlog.processors.JSONRenderer(),
            ],
            wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
        )
        logger.info("structlog JSON logging enabled")
    except Exception as exc:  # pragma: no cover
        logging.basicConfig(level=logging.INFO)
        logger.warning("structlog unavailable, using stdlib logging: %s", exc)


def setup_sentry() -> None:
    if not settings.SENTRY_DSN:
        return
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration

        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            environment=settings.ENVIRONMENT,
            integrations=[FastApiIntegration()],
            traces_sample_rate=0.1,
            # flag slow requests
            _experiments={"continuous_profiling_auto_start": False},
        )
        logger.info("Sentry initialized")
    except Exception as exc:  # pragma: no cover
        logger.warning("Sentry init failed: %s", exc)


def setup_metrics(app) -> None:
    """Attach prometheus-fastapi-instrumentator and expose GET /metrics."""
    try:
        from prometheus_fastapi_instrumentator import Instrumentator

        Instrumentator(
            should_group_status_codes=True,
            excluded_handlers=["/metrics", "/health"],
        ).instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)
        logger.info("Prometheus /metrics exposed")
    except Exception as exc:  # pragma: no cover
        logger.warning("metrics setup failed: %s", exc)
