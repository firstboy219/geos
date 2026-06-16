"""Non-AI keyword/rules news category classifier (NO Gemini / no quota).

`classify(title, content, source_name) -> str` returns ONE primary category from:
  indonesia, internasional, politik, ekonomi, teknologi, olahraga,
  keamanan, energi, kesehatan, hiburan.

Deterministic + ordered + fast. Handles Indonesian (id) + English (en) keywords.
`classify_articles(db, max_articles)` backfills rows where category IS NULL
(idempotent) so the existing corpus can be classified after deploy.
"""
from __future__ import annotations

import logging

from sqlalchemy import select

from app.models.news_article import NewsArticle

logger = logging.getLogger("geoscan.news_classifier")

CATEGORIES = [
    "indonesia",
    "internasional",
    "politik",
    "ekonomi",
    "teknologi",
    "olahraga",
    "keamanan",
    "energi",
    "kesehatan",
    "hiburan",
]

_MAX_PER_RUN = 2000

# Indonesian outlets — if the source is one of these (or lang id about Indonesia)
# the article is classified 'indonesia'.
_ID_OUTLETS = (
    "kompas",
    "detik",
    "tribun",
    "antara",
    "cnbc indonesia",
    "tempo",
    "liputan6",
    "kumparan",
    "cnn indonesia",
    "republika",
)

# Tokens that signal the article is about Indonesia (used with lang id).
_INDONESIA_TOKENS = (
    "indonesia",
    "jakarta",
    "jokowi",
    "prabowo",
    "rupiah",
    "natuna",
    "bbm",
    "dpr",
    "pemilu",
    "ibu kota",
    "ikn",
    "papua",
    "bali",
    "surabaya",
    "bandung",
    "nusantara",
)

# Ordered keyword buckets (first match wins). ID + EN tokens. Lowercase, matched
# as substrings on a single normalized "title + content" haystack.
_BUCKETS: list[tuple[str, tuple[str, ...]]] = [
    ("keamanan", (
        " war ", "perang", "military", "militer", "attack", "serangan",
        "troops", "tentara", "conflict", "konflik", "missile", "rudal",
        "airstrike", "ceasefire", "invasion", "invasi", "terror", "teror",
        "nato", "warfare", "battlefield", "pasukan", "drone strike",
    )),
    ("energi", (
        "oil price", "harga minyak", "crude", "natural gas", "gas alam",
        "nickel", "nikel", "energy", "energi", "bbm", "pertamina",
        "opec", "pipeline", "refinery", "kilang", "coal", "batu bara",
        "solar power", "renewable energy", "lng",
    )),
    ("ekonomi", (
        "market", "saham", "stock", "inflation", "inflasi", "trade",
        "perdagangan", "economy", "ekonomi", "rupiah", "gdp", "pdb",
        "recession", "resesi", "interest rate", "suku bunga", "tariff",
        "tarif", "export", "ekspor", "import", "impor", "investment",
        "investasi", "currency", "mata uang", "bond", "obligasi",
        "central bank", "bank sentral", "ihsg", "wall street",
    )),
    ("politik", (
        "election", "pemilu", "president", "presiden", "parliament",
        "parlemen", "diplomat", "diplomatic", "diplomasi", "sanction",
        "sanksi", "minister", "menteri", "cabinet", "kabinet", "vote",
        "pemungutan suara", "campaign", "kampanye", "policy", "kebijakan",
        "summit", "ktt", "treaty", "perjanjian", "senate", "senat",
        "governor", "gubernur", "coalition", "koalisi",
    )),
    ("teknologi", (
        "artificial intelligence", " ai ", "kecerdasan buatan", "chip",
        "semiconductor", "semikonduktor", "tech", "teknologi", "cyber",
        "siber", "software", "perangkat lunak", "startup", "robot",
        "quantum", "smartphone", "gadget", "app", "aplikasi", "internet",
        "data center", "pusat data", "algorithm", "algoritma", "hacker",
        "peretas", "machine learning",
    )),
    ("olahraga", (
        "world cup", "piala dunia", "match", "pertandingan", "league",
        "liga", "nba", "football", "sepak bola", "sepakbola", "soccer",
        "olympic", "olimpiade", "tournament", "turnamen", "championship",
        "kejuaraan", "badminton", "bulu tangkis", "motogp", "formula 1",
        "tennis", "tenis", "athlete", "atlet", "goal", "gol",
    )),
    ("kesehatan", (
        "health", "kesehatan", "virus", "disease", "penyakit", "vaccine",
        "vaksin", "covid", "pandemic", "pandemi", "outbreak", "wabah",
        "hospital", "rumah sakit", "medical", "medis", "cancer", "kanker",
        "epidemic", "epidemi", "who", "infection", "infeksi",
    )),
    ("hiburan", (
        "film", "movie", "music", "musik", "celebrity", "selebriti",
        "concert", "konser", "actor", "aktor", "actress", "aktris",
        "singer", "penyanyi", "album", "box office", "festival",
        "hollywood", "drama", "series", "serial", "netflix", "grammy",
        "oscar", "selebgram",
    )),
]


def _haystack(title: str | None, content: str | None) -> str:
    # Pad with spaces so word-boundary-ish tokens like " ai " match at edges.
    return " " + ((title or "") + " " + (content or "")).lower() + " "


def classify(
    title: str | None,
    content: str | None,
    source_name: str | None = None,
) -> str:
    """Return ONE primary category. Deterministic, ordered, fast."""
    hay = _haystack(title, content)
    src = (source_name or "").lower()

    # Rule 1: Indonesian outlet → indonesia.
    if any(o in src for o in _ID_OUTLETS):
        return "indonesia"

    # Rule 2: clearly about Indonesia → indonesia.
    if any(tok in hay for tok in _INDONESIA_TOKENS):
        return "indonesia"

    # Rule 3: ordered keyword buckets, first match wins.
    for cat, kws in _BUCKETS:
        if any(kw in hay for kw in kws):
            return cat

    # Default.
    return "internasional"


async def classify_articles(db, *, max_articles: int = _MAX_PER_RUN) -> dict:
    """Backfill category for rows where it IS NULL (idempotent)."""
    rows = (
        await db.execute(
            select(NewsArticle)
            .where(NewsArticle.category.is_(None))
            .order_by(NewsArticle.ingested_at.asc())
            .limit(max_articles)
        )
    ).scalars().all()
    if not rows:
        return {"classified": 0}

    n = 0
    for a in rows:
        a.category = classify(a.title, a.content_summary, a.source_name)
        n += 1
    await db.commit()
    logger.info("classify_articles: %d articles categorized", n)
    return {"classified": n}
