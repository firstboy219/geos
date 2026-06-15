"""Aggregator router untuk semua endpoint v1 + internal + ws."""
from fastapi import APIRouter

from app.api.v1 import (
    actors,
    alerts,
    auth,
    crises,
    impacts,
    internal,
    news,
    pasar,
    portfolio,
    scenarios,
    ws,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(crises.router)
api_router.include_router(news.router)
api_router.include_router(impacts.router)
api_router.include_router(scenarios.router)
api_router.include_router(actors.router)
api_router.include_router(alerts.router)
api_router.include_router(portfolio.router)
api_router.include_router(pasar.router)
api_router.include_router(internal.router)
api_router.include_router(ws.router)
