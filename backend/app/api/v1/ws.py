"""WebSocket endpoint (/ws)."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.core.security import ACCESS_TOKEN_TYPE, safe_decode
from app.services.ws_manager import manager

router = APIRouter(tags=["ws"])

# Close codes
_INVALID_TOKEN = 4001


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str | None = Query(default=None),
) -> None:
    # Validasi JWT saat connect — reject 4001 jika invalid.
    payload = safe_decode(token) if token else None
    if payload is None or payload.get("type") != ACCESS_TOKEN_TYPE or not payload.get("sub"):
        await websocket.close(code=_INVALID_TOKEN)
        return

    await manager.connect(websocket)
    try:
        await websocket.send_json({"type": "connected", "data": {"user_id": payload["sub"]}})
        while True:
            msg = await websocket.receive_json()
            action = msg.get("action")
            if action == "subscribe":
                crisis_id = msg.get("crisis_id")
                if not _valid_uuid(crisis_id):
                    await websocket.send_json(
                        {"type": "error", "data": {"detail": "invalid crisis_id"}}
                    )
                    continue
                await manager.subscribe(websocket, str(crisis_id))
                await websocket.send_json(
                    {"type": "subscribed", "data": {"crisis_id": crisis_id}}
                )
            elif action == "ping":
                await websocket.send_json({"type": "pong", "data": {}})
            else:
                await websocket.send_json(
                    {"type": "error", "data": {"detail": "unknown action"}}
                )
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception:  # noqa: BLE001
        await manager.disconnect(websocket)


def _valid_uuid(value: object) -> bool:
    try:
        uuid.UUID(str(value))
        return True
    except (ValueError, TypeError):
        return False
