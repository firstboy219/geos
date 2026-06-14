"""Admin CMS routes (server-rendered Jinja + Tailwind)."""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.admin import security
from app.core import settings_store
from app.core.config import settings
from app.core.database import engine, get_session
from app.core.redis_client import ping_redis
from app.models.alert import Alert
from app.models.app_setting import AppSetting  # noqa: F401
from app.models.crisis import Crisis
from app.models.market_data import MarketData
from app.models.news_article import NewsArticle
from app.models.scenario import Scenario
from app.models.scenario_mutation import ScenarioMutation
from app.models.tripwire import Tripwire
from app.models.tripwire_event import TripwireEvent
from app.models.user import User

logger = logging.getLogger("geoscan.admin")
templates = Jinja2Templates(directory="app/admin/templates")
router = APIRouter(prefix="/admin", tags=["admin"])

# secret setting keys (value masked in UI; blank submit keeps existing)
SECRET_FIELDS = {"gemini_api_key", "openai_api_key"}
SETTING_FIELDS = [
    "ai_provider", "ai_model_analysis", "ai_model_embedding", "ai_embedding_dimension",
    "gemini_api_key", "openai_api_key", "openai_model_analysis", "openai_model_embedding",
    "qdrant_url", "n8n_webhook_url",
]


def _ctx(request: Request, **kw) -> dict:
    base = {"request": request, "msg": request.query_params.get("msg"),
            "msg_type": request.query_params.get("type", "ok")}
    base.update(kw)
    return base


def _redir(path: str, msg: str = "", t: str = "ok") -> RedirectResponse:
    url = path + (f"?msg={msg}&type={t}" if msg else "")
    return RedirectResponse(url, status_code=303)


# ── Auth ──
@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    if security.is_authed(request):
        return _redir("/admin")
    return templates.TemplateResponse("login.html", _ctx(request))


@router.post("/login")
async def login_submit(request: Request, password: str = Form(...)):
    if await security.verify_admin_password(password):
        resp = _redir("/admin")
        resp.set_cookie(security.COOKIE_NAME, security.issue_session(),
                        httponly=True, samesite="lax", secure=True, max_age=60 * 60 * 8)
        return resp
    return templates.TemplateResponse(
        "login.html", _ctx(request, error="Password salah."), status_code=401
    )


@router.get("/logout")
async def logout(request: Request):
    resp = _redir("/admin/login")
    resp.delete_cookie(security.COOKIE_NAME)
    return resp


# ── Dashboard ──
@router.get("", response_class=HTMLResponse)
@router.get("/", response_class=HTMLResponse)
async def dashboard(request: Request, _: bool = Depends(security.require_admin),
                    db: AsyncSession = Depends(get_session)):
    async def count(model):
        return (await db.execute(select(func.count()).select_from(model))).scalar() or 0

    db_ok = True
    try:
        from sqlalchemy import text
        async with engine.connect() as c:
            await c.execute(text("SELECT 1"))
    except Exception:
        db_ok = False
    celery_workers = 0
    try:
        from app.celery_app import celery_app
        celery_workers = len(celery_app.control.ping(timeout=0.5) or [])
    except Exception:
        pass

    counts = {
        "users": await count(User), "crises": await count(Crisis),
        "scenarios": await count(Scenario), "tripwires": await count(Tripwire),
        "tripwire_events": await count(TripwireEvent), "news_articles": await count(NewsArticle),
        "market_data": await count(MarketData), "alerts": await count(Alert),
        "mutations": await count(ScenarioMutation),
    }
    recent = (await db.execute(
        select(ScenarioMutation).order_by(ScenarioMutation.mutated_at.desc()).limit(8)
    )).scalars().all()
    ai = await settings_store.get_ai_config()
    health = {"db": db_ok, "redis": await ping_redis(), "celery_workers": celery_workers}
    return templates.TemplateResponse(
        "dashboard.html",
        _ctx(request, counts=counts, recent=recent, ai=ai, health=health,
             provider=ai["provider"]),
    )


# ── Settings (AI + credentials) ──
@router.get("/settings", response_class=HTMLResponse)
async def settings_page(request: Request, _: bool = Depends(security.require_admin)):
    stored = await settings_store.get_all()
    values = {}
    for k in SETTING_FIELDS:
        if k in SECRET_FIELDS:
            values[k] = "set" if (stored.get(k) or settings_store.env_default(k)) else ""
        else:
            values[k] = stored.get(k) or settings_store.env_default(k)
    ai = await settings_store.get_ai_config()
    return templates.TemplateResponse(
        "settings.html",
        _ctx(request, values=values, ai=ai, secret_fields=list(SECRET_FIELDS),
             test=request.query_params.get("test")),
    )


@router.post("/settings")
async def settings_save(request: Request, _: bool = Depends(security.require_admin)):
    form = await request.form()
    updates: dict[str, str] = {}
    for k in SETTING_FIELDS:
        if k not in form:
            continue
        v = str(form[k]).strip()
        if k in SECRET_FIELDS and v == "":
            continue  # keep existing secret
        updates[k] = v
    if updates:
        await settings_store.set_many(updates)
    return _redir("/admin/settings", "Pengaturan disimpan.")


@router.post("/settings/password")
async def settings_password(request: Request, new_password: str = Form(...),
                            _: bool = Depends(security.require_admin)):
    if len(new_password) < 6:
        return _redir("/admin/settings", "Password minimal 6 karakter.", "err")
    await security.set_admin_password(new_password)
    return _redir("/admin/settings", "Password admin diperbarui.")


@router.post("/settings/test-ai")
async def settings_test_ai(request: Request, _: bool = Depends(security.require_admin)):
    from app.services.ai.llm_client import ai_smoke_test
    res = await ai_smoke_test()
    ok = res.get("generate_ok") and res.get("embed_ok")
    txt = (f"AI {res['provider']}/{res['analysis_model']}: generate="
           f"{res['generate_ok']} embed={res['embed_ok']}({res.get('embed_dim','?')})"
           + (f" ERROR: {res['error']}" if res.get("error") else ""))
    return _redir("/admin/settings", txt, "ok" if ok else "err")


# ── Data management ──
@router.get("/data", response_class=HTMLResponse)
async def data_page(request: Request, _: bool = Depends(security.require_admin),
                    db: AsyncSession = Depends(get_session)):
    crises = (await db.execute(select(Crisis).order_by(Crisis.severity_level.desc()))).scalars().all()
    tripwires = (await db.execute(select(Tripwire).order_by(Tripwire.severity))).scalars().all()
    users = (await db.execute(select(User).order_by(User.created_at.desc()).limit(100))).scalars().all()
    return templates.TemplateResponse(
        "data.html", _ctx(request, crises=crises, tripwires=tripwires, users=users)
    )


@router.post("/crises/{cid}/status")
async def crisis_status(cid: str, status_val: str = Form(...),
                        _: bool = Depends(security.require_admin),
                        db: AsyncSession = Depends(get_session)):
    c = await db.get(Crisis, cid)
    if c and status_val in ("active", "monitoring", "resolved"):
        c.status = status_val
        await db.commit()
    return _redir("/admin/data", "Status krisis diperbarui.")


@router.post("/crises/{cid}/mutate")
async def crisis_mutate(cid: str, _: bool = Depends(security.require_admin)):
    try:
        from app.celery_app import celery_app
        celery_app.send_task("trigger_mutation",
                             kwargs={"crisis_id": cid, "trigger_reason": "admin_manual"},
                             queue=settings.CELERY_TASK_QUEUE)
        return _redir("/admin/data", "Mutation di-enqueue.")
    except Exception as exc:
        return _redir("/admin/data", f"Gagal enqueue: {exc}", "err")


@router.post("/crises/{cid}/delete")
async def crisis_delete(cid: str, _: bool = Depends(security.require_admin),
                        db: AsyncSession = Depends(get_session)):
    c = await db.get(Crisis, cid)
    if c:
        await db.delete(c)
        await db.commit()
    return _redir("/admin/data", "Krisis dihapus.")


@router.post("/crises/create")
async def crisis_create(title: str = Form(...), region: str = Form(""),
                        crisis_type: str = Form("hybrid"), severity_level: int = Form(5),
                        _: bool = Depends(security.require_admin),
                        db: AsyncSession = Depends(get_session)):
    db.add(Crisis(title=title, region=region, crisis_type=crisis_type,
                  severity_level=severity_level, status="active",
                  started_at=datetime.now(timezone.utc)))
    await db.commit()
    return _redir("/admin/data", "Krisis dibuat.")


@router.post("/tripwires/{tid}/toggle")
async def tripwire_toggle(tid: str, _: bool = Depends(security.require_admin),
                          db: AsyncSession = Depends(get_session)):
    t = await db.get(Tripwire, tid)
    if t:
        t.is_active = not t.is_active
        await db.commit()
    return _redir("/admin/data", "Tripwire diperbarui.")


@router.post("/users/{uid}/tier")
async def user_tier(uid: str, tier: str = Form(...),
                    _: bool = Depends(security.require_admin),
                    db: AsyncSession = Depends(get_session)):
    u = await db.get(User, uid)
    if u and tier in ("free", "pro", "enterprise"):
        u.tier = tier
        await db.commit()
    return _redir("/admin/data", "Tier user diperbarui.")


# ── News sources (CMS-managed feeds for WF-01) ──
@router.get("/sources", response_class=HTMLResponse)
async def sources_page(request: Request, _: bool = Depends(security.require_admin)):
    sources = await settings_store.get_news_sources()
    return templates.TemplateResponse("sources.html", _ctx(request, sources=sources))


@router.post("/sources/add")
async def sources_add(name: str = Form(...), url: str = Form(...), type: str = Form("rss"),
                      credibility: float = Form(0.6), lang: str = Form("en"),
                      _: bool = Depends(security.require_admin)):
    sources = list(await settings_store.get_news_sources())
    sources.append({"name": name.strip(), "url": url.strip(),
                    "type": (type or "rss").strip(), "credibility": float(credibility),
                    "lang": (lang or "en").strip(), "enabled": True})
    await settings_store.set_news_sources(sources)
    return _redir("/admin/sources", "Sumber ditambahkan.")


@router.post("/sources/{idx}/toggle")
async def sources_toggle(idx: int, _: bool = Depends(security.require_admin)):
    sources = list(await settings_store.get_news_sources())
    if 0 <= idx < len(sources):
        sources[idx]["enabled"] = not sources[idx].get("enabled", True)
        await settings_store.set_news_sources(sources)
    return _redir("/admin/sources", "Sumber diperbarui.")


@router.post("/sources/{idx}/delete")
async def sources_delete(idx: int, _: bool = Depends(security.require_admin)):
    sources = list(await settings_store.get_news_sources())
    if 0 <= idx < len(sources):
        sources.pop(idx)
        await settings_store.set_news_sources(sources)
    return _redir("/admin/sources", "Sumber dihapus.")


@router.post("/sources/reset")
async def sources_reset(_: bool = Depends(security.require_admin)):
    from app.core.news_sources import DEFAULT_NEWS_SOURCES
    await settings_store.set_news_sources(DEFAULT_NEWS_SOURCES)
    return _redir("/admin/sources", "Sumber dikembalikan ke default.")


# ── Monitoring ──
@router.get("/monitor", response_class=HTMLResponse)
async def monitor_page(request: Request, _: bool = Depends(security.require_admin),
                       db: AsyncSession = Depends(get_session)):
    news = (await db.execute(select(NewsArticle).order_by(NewsArticle.ingested_at.desc()).limit(25))).scalars().all()
    market = (await db.execute(select(MarketData).order_by(MarketData.recorded_at.desc()).limit(25))).scalars().all()
    events = (await db.execute(select(TripwireEvent).order_by(TripwireEvent.detected_at.desc()).limit(25))).scalars().all()
    alerts = (await db.execute(select(Alert).order_by(Alert.created_at.desc()).limit(25))).scalars().all()
    return templates.TemplateResponse(
        "monitor.html", _ctx(request, news=news, market=market, events=events, alerts=alerts)
    )
