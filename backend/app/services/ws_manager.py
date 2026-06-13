"""WebSocket connection manager + Redis pub/sub bridge.

Setiap koneksi bisa subscribe ke beberapa crisis channel. Sebuah listener
Redis pub/sub (psubscribe 'crisis:*') mendistribusikan pesan ke koneksi yang
subscribe channel terkait — sehingga broadcast bekerja antar worker.
"""
from __future__ import annotations

import asyncio
import json
import logging
from collections import defaultdict

from starlette.websockets import WebSocket

from app.core.redis_client import get_redis

logger = logging.getLogger("geoscan.ws")


class ConnectionManager:
    def __init__(self) -> None:
        # crisis_id -> set of websockets
        self._subscriptions: dict[str, set[WebSocket]] = defaultdict(set)
        self._lock = asyncio.Lock()
        self._listener_task: asyncio.Task | None = None

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()

    async def disconnect(self, ws: WebSocket) -> None:
        async with self._lock:
            for subs in self._subscriptions.values():
                subs.discard(ws)

    async def subscribe(self, ws: WebSocket, crisis_id: str) -> None:
        async with self._lock:
            self._subscriptions[crisis_id].add(ws)

    async def _broadcast_local(self, crisis_id: str, message: dict) -> None:
        async with self._lock:
            targets = list(self._subscriptions.get(crisis_id, set()))
        dead: list[WebSocket] = []
        for ws in targets:
            try:
                await ws.send_json(message)
            except Exception:  # noqa: BLE001
                dead.append(ws)
        if dead:
            async with self._lock:
                for ws in dead:
                    for subs in self._subscriptions.values():
                        subs.discard(ws)

    # ── Redis pub/sub listener (start sekali per proses) ──
    async def start_listener(self) -> None:
        if self._listener_task is not None:
            return
        self._listener_task = asyncio.create_task(self._listen())

    async def stop_listener(self) -> None:
        if self._listener_task is not None:
            self._listener_task.cancel()
            self._listener_task = None

    async def _listen(self) -> None:
        pubsub = get_redis().pubsub()
        await pubsub.psubscribe("crisis:*")
        logger.info("WS Redis listener started (crisis:*)")
        try:
            async for raw in pubsub.listen():
                if raw is None or raw.get("type") != "pmessage":
                    continue
                channel = raw.get("channel", "")
                crisis_id = channel.split("crisis:", 1)[-1]
                try:
                    message = json.loads(raw.get("data") or "{}")
                except (TypeError, ValueError):
                    continue
                await self._broadcast_local(crisis_id, message)
        except asyncio.CancelledError:
            await pubsub.close()
            raise
        except Exception as exc:  # noqa: BLE001
            logger.warning("WS listener error: %s", exc)


manager = ConnectionManager()
