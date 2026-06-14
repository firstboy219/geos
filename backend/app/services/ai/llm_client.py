"""LLM client — provider-agnostic (Gemini or OpenAI), driven by the CMS settings.

Provider, model, API key, and embedding dimension are read live from the runtime
settings store (Redis-cached), so the admin panel can switch AI without redeploy.
Imports of provider SDKs are lazy.
"""
from __future__ import annotations

import json
import logging
import math
import re

from app.core.settings_store import get_ai_config

logger = logging.getLogger("geoscan.ai.llm")

# cache clients by (provider, api_key) so a CMS key/provider change rebuilds them
_clients: dict[tuple[str, str], object] = {}


def _normalize(vec: list[float]) -> list[float]:
    norm = math.sqrt(sum(v * v for v in vec))
    return [v / norm for v in vec] if norm else vec


def _extract_json(raw: str) -> dict:
    raw = (raw or "").strip()
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except Exception:
        m = re.search(r"\{.*\}", raw, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(0))
            except Exception:
                pass
    logger.warning("LLM returned non-JSON output (%d chars)", len(raw))
    return {}


def _gemini(api_key: str):
    if not api_key:
        raise RuntimeError("Gemini API key not configured (set it in the CMS).")
    cached = _clients.get(("gemini", api_key))
    if cached is None:
        from google import genai  # lazy

        cached = genai.Client(api_key=api_key)
        _clients[("gemini", api_key)] = cached
    return cached


def _openai(api_key: str):
    if not api_key:
        raise RuntimeError("OpenAI API key not configured (set it in the CMS).")
    cached = _clients.get(("openai", api_key))
    if cached is None:
        from openai import AsyncOpenAI  # lazy

        cached = AsyncOpenAI(api_key=api_key)
        _clients[("openai", api_key)] = cached
    return cached


# ── Embeddings ──
async def embed_text(text: str, *, task_type: str = "RETRIEVAL_DOCUMENT") -> list[float]:
    cfg = await get_ai_config()
    dim = int(cfg.get("embedding_dimension") or 1536)
    if cfg["provider"] == "openai":
        client = _openai(cfg["api_key"])
        resp = await client.embeddings.create(
            model=cfg["embedding_model"], input=text, dimensions=dim
        )
        return _normalize(list(resp.data[0].embedding))
    # gemini
    from google.genai import types  # lazy

    resp = await _gemini(cfg["api_key"]).aio.models.embed_content(
        model=cfg["embedding_model"],
        contents=text,
        config=types.EmbedContentConfig(task_type=task_type, output_dimensionality=dim),
    )
    return _normalize(list(resp.embeddings[0].values))


# ── Generation ──
async def generate_json(system: str, user: str, *, temperature: float = 0.3) -> dict:
    cfg = await get_ai_config()
    if cfg["provider"] == "openai":
        client = _openai(cfg["api_key"])
        resp = await client.chat.completions.create(
            model=cfg["analysis_model"],
            messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
            temperature=temperature,
            response_format={"type": "json_object"},
        )
        return _extract_json(resp.choices[0].message.content)
    from google.genai import types  # lazy

    resp = await _gemini(cfg["api_key"]).aio.models.generate_content(
        model=cfg["analysis_model"],
        contents=user,
        config=types.GenerateContentConfig(
            system_instruction=system,
            temperature=temperature,
            response_mime_type="application/json",
        ),
    )
    return _extract_json(resp.text)


async def generate_text(system: str, user: str, *, temperature: float = 0.6) -> str:
    cfg = await get_ai_config()
    if cfg["provider"] == "openai":
        client = _openai(cfg["api_key"])
        resp = await client.chat.completions.create(
            model=cfg["analysis_model"],
            messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
            temperature=temperature,
        )
        return (resp.choices[0].message.content or "").strip()
    from google.genai import types  # lazy

    resp = await _gemini(cfg["api_key"]).aio.models.generate_content(
        model=cfg["analysis_model"],
        contents=user,
        config=types.GenerateContentConfig(system_instruction=system, temperature=temperature),
    )
    return (resp.text or "").strip()


async def ai_smoke_test() -> dict:
    """Used by the CMS 'Test AI' button — tiny generate + embed round-trip."""
    cfg = await get_ai_config()
    out = {"provider": cfg["provider"], "analysis_model": cfg["analysis_model"],
           "embedding_model": cfg["embedding_model"], "generate_ok": False,
           "embed_ok": False, "error": None}
    try:
        txt = await generate_text("You are a test.", "Reply with the single word: OK", temperature=0)
        out["generate_ok"] = "ok" in (txt or "").lower()
        vec = await embed_text("hello world", task_type="RETRIEVAL_QUERY")
        out["embed_ok"] = len(vec) == int(cfg.get("embedding_dimension") or 1536)
        out["embed_dim"] = len(vec)
    except Exception as exc:
        out["error"] = str(exc)[:300]
    return out
