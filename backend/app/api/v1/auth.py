"""Auth & user endpoints (/auth, /users)."""

from fastapi import APIRouter, Depends, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.core.limiter import limiter
from app.core.security import create_token_pair, safe_decode, blacklist_token
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RefreshRequest,
    RegisterRequest,
    TokenPair,
    UserMeResponse,
    UserResponse,
    UserUpdateRequest,
)
from app.schemas.common import MessageResponse
from app.services import auth_service

router = APIRouter(tags=["auth"])
_bearer = HTTPBearer(auto_error=False)


@router.post("/auth/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/hour")
async def register(
    request: Request,
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    await auth_service.register_user(db, payload)
    return MessageResponse(message="Registrasi berhasil")


@router.post("/auth/login", response_model=LoginResponse)
@limiter.limit("5/15minutes")
async def login(
    request: Request,
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> LoginResponse:
    user = await auth_service.authenticate(db, str(payload.email), payload.password)
    tokens = create_token_pair(str(user.id))
    return LoginResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        user=UserResponse.model_validate(user),
    )


@router.post("/auth/refresh", response_model=TokenPair)
async def refresh(
    payload: RefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenPair:
    tokens = await auth_service.rotate_refresh_token(db, payload.refresh_token)
    return TokenPair(**tokens)


@router.post("/auth/logout", response_model=MessageResponse)
async def logout(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    _user: User = Depends(get_current_user),
) -> MessageResponse:
    # Blacklist access token saat ini di Redis.
    if credentials and credentials.credentials:
        payload = safe_decode(credentials.credentials)
        if payload:
            await blacklist_token(payload)
    return MessageResponse(message="Logout berhasil")


@router.get("/users/me", response_model=UserMeResponse)
async def get_me(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserMeResponse:
    portfolio_count, unread = await auth_service.get_user_stats(db, user.id)
    base = UserResponse.model_validate(user).model_dump()
    return UserMeResponse(**base, portfolio_count=portfolio_count, unread_alerts=unread)


@router.patch("/users/me", response_model=UserResponse)
async def update_me(
    payload: UserUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    changes = payload.model_dump(exclude_unset=True)
    for field, value in changes.items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)
