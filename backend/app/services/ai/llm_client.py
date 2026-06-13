"""Google Gemini client wrapper (replaces OpenAI).

Centralizes all Gemini access: embeddings + JSON/text generation. Uses the
`google-genai` SDK async API (`client.aio`). Imports are lazy so the web process
can import this module without the SDK installed (only the Celery worker actually
calls these).
"""
from __future__ import annotations

import json
import logging
import math
import re
from functools import lru_cache

from app.core.config import settings

logger = logging.getLogger("geoscan.ai.llm")


@lru_cache(maxsize=1)
def _client():
    from google import genai  # lazy

    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set")
    return genai.Client(api_key=settings.GEMINI_API_KEY)


def _normalize(vec: list[float]) -> list[float]:
    """Unit-normalize (gemini-embedding-001 only pre-normalizes the full 3072 dim;
    truncated dims must be normalized for cosine similarity)."""
    norm = math.sqrt(sum(v * v for v in vec))
    return [v / norm for v in vec] if norm else vec


async def embed_text(text: str, *, task_type: str = "RETRIEVAL_DOCUMENT") -> list[float]:
    """Return a normalized embedding of `text` at PINECONE_DIMENSION dims."""
    from google.genai import types  # lazy

    resp = await _client().aio.models.embed_content(
        model=settings.GEMINI_MODEL_EMBEDDING,
        contents=text,
        config=types.EmbedContentConfig(
            task_type=task_type,
            output_dimensionality=settings.PINECONE_DIMENSION,
        ),
    )
    values = list(resp.embeddings[0].values)
    return _normalize(values)


def _extract_json(raw: str) -> dict:
    raw = (raw or "").strip()
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except Exception:
        # salvage the first {...} block
        m = re.search(r"\{.*\}", raw, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(0))
            except Exception:
                pass
    logger.warning("Gemini returned non-JSON output (%d chars)", len(raw))
    return {}


async def generate_json(
    system: str, user: str, *, temperature: float = 0.3
) -> dict:
    """Generate a JSON object (response_mime_type=application/json)."""
    from google.genai import types  # lazy

    resp = await _client().aio.models.generate_content(
        model=settings.GEMINI_MODEL_ANALYSIS,
        contents=user,
        config=types.GenerateContentConfig(
            system_instruction=system,
            temperature=temperature,
            response_mime_type="application/json",
        ),
    )
    return _extract_json(resp.text)


async def generate_text(
    system: str, user: str, *, temperature: float = 0.6
) -> str:
    """Generate free-form text (e.g. scenario narrative)."""
    from google.genai import types  # lazy

    resp = await _client().aio.models.generate_content(
        model=settings.GEMINI_MODEL_ANALYSIS,
        contents=user,
        config=types.GenerateContentConfig(
            system_instruction=system,
            temperature=temperature,
        ),
    )
    return (resp.text or "").strip()
