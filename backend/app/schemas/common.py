"""Schema umum: pagination wrapper, message response."""
from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class MessageResponse(BaseModel):
    message: str


class PaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    total: int
    page: int
    size: int
