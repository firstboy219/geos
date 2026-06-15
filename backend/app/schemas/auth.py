"""Auth + user schemas (BAB 5.3)."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class RefreshRequest(BaseModel):
    refresh_token: str


class WaOtpRequest(BaseModel):
    phone: str = Field(min_length=6, max_length=32)


class WaVerifyRequest(BaseModel):
    phone: str = Field(min_length=6, max_length=32)
    code: str = Field(min_length=4, max_length=8)


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str
    tier: str
    is_active: bool
    is_verified: bool
    fcm_token: str | None = None
    created_at: datetime


class UserMeResponse(UserResponse):
    portfolio_count: int = 0
    unread_alerts: int = 0


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserUpdateRequest(BaseModel):
    fcm_token: str | None = Field(default=None, max_length=512)
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
