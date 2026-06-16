"""Non-AI news extraction: intisari (points) + kutipan (quotes).

Replaces the Gemini summarizer for per-article summarization so it scales to
high volume with zero quota/cost:
  • points — extractive summary (frequency-scored sentences, lead-biased)
  • quotes — quoted spans + speaker attribution (ID + EN verbs)

Operates on the (already Indonesian-translated) article text.
"""
from __future__ import annotations

import re

# Compact ID + EN stopword set (high-frequency, low-signal words).
_STOP = set(
    """
    yang di ke dari dan atau untuk pada dengan ini itu adalah akan tidak juga
    dalam para oleh sebagai karena agar namun tetapi sehingga ada saat telah
    sudah masih lebih para kami kita mereka dia ia saya anda nya pun bisa dapat
    harus akan begitu serta hingga antara setelah sebelum tersebut suatu yaitu
    the a an of to in on for and or is are was were be been being with by from
    as at that this these those it its his her their our your my we they he she
    have has had not but so if then than which who whom whose will would can
    could may might about over after before into out up down said says say
    """.split()
)

_ATTR_VERBS = (
    r"kata|ujar|tutur|ucap|menurut|jelas|tegas|ungkap|sebut|imbuh|tambah|"
    r"papar|kata\w*nya|said|says|according to|told|added|stated|noted"
)
_NAME = r"[A-Z][\w.\-]+(?:\s+[A-Z][\w.\-]+){0,3}"

_WORD = re.compile(r"[A-Za-zÀ-ɏ]+")
_TAG = re.compile(r"<[^>]+>")
_WS = re.compile(r"\s+")


def clean_html(text: str | None) -> str:
    """Strip HTML (incl. entity-encoded tags like &lt;p&gt;) + decode entities."""
    if not text:
        return ""
    t = text.replace("&lt;", "<").replace("&gt;", ">")
    t = _TAG.sub(" ", t)  # strip real + entity-revealed tags
    t = (t.replace("&amp;", "&").replace("&quot;", '"').replace("&#39;", "'")
         .replace("&#039;", "'").replace("&nbsp;", " ").replace("&hellip;", "…")
         .replace("&rsquo;", "'").replace("&lsquo;", "'")
         .replace("&ldquo;", '"').replace("&rdquo;", '"').replace("&#8217;", "'"))
    t = _TAG.sub(" ", t)  # safety pass
    return _WS.sub(" ", t).strip()


def _sentences(text: str) -> list[str]:
    # Split on sentence terminators (also handles "…"). Keep only sentences with
    # enough substance to be a genuine summary line (≥25 chars and ≥4 words).
    parts = re.split(r"(?<=[.!?…])\s+", text.strip())
    out = []
    for p in parts:
        p = p.strip()
        if len(p) >= 25 and len(p.split()) >= 4:
            out.append(p)
    return out


# Min body length to treat content as real article text (vs. a title-length
# feed snippet). Below this we fall back to the title.
_MIN_CONTENT_LEN = 80


def extract_points(text: str | None, *, max_points: int = 3, fallback: str = "") -> list[str]:
    """Build the intisari (summary points) from the article BODY.

    Reads the cleaned `content_summary` (RSS description / content:encoded) and
    returns the most representative sentences. Only falls back to the title when
    the body is empty or shorter than a real article snippet — some feeds ship
    title-length descriptions, which is a feed limitation, not echoing by choice.
    """
    fb = fallback.strip()
    text = clean_html(text)
    # Body too thin to summarize from → fall back to the title.
    if len(text) < _MIN_CONTENT_LEN:
        if text and len(text) >= 25:
            return [text[:300]]
        return [fb][:1] if fb else ([text[:280]] if text else [])
    sents = _sentences(text)
    if len(sents) <= 1:
        if sents:
            return sents[:1]
        return [fb][:1] if fb else [text[:280]]

    freq: dict[str, int] = {}
    for w in _WORD.findall(text.lower()):
        if len(w) < 3 or w in _STOP:
            continue
        freq[w] = freq.get(w, 0) + 1
    if not freq:
        return [s[:280] for s in sents[:max_points]]

    scored = []
    for i, s in enumerate(sents):
        words = [w for w in _WORD.findall(s.lower()) if w in freq]
        if not words:
            continue
        score = sum(freq[w] for w in words) / (len(words) ** 0.5)  # length-normalized
        if i == 0:
            score *= 1.18  # lead-sentence bias
        scored.append((score, i, s))
    if not scored:
        return [s[:280] for s in sents[:max_points]]

    scored.sort(key=lambda t: t[0], reverse=True)
    top = sorted(scored[:max_points], key=lambda t: t[1])  # restore reading order
    return [t[2][:300] for t in top]


# Common English function words used to spot quotes that are still English in an
# Indonesian article (Home-1b). Mirrors translator._looks_english conservatively.
_EN_STOPWORDS = {
    "the", "and", "of", "to", "in", "is", "for", "on", "with", "as",
    "at", "by", "from", "that", "this", "was", "are", "be", "has", "have",
    "we", "they", "will", "would", "not", "but",
}
_ID_MARKERS = {
    "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "ini", "itu",
    "akan", "tidak", "adalah", "pada", "dalam", "para", "tahun", "juga",
    "sebagai", "telah", "atau", "karena", "oleh", "menjadi", "kami", "kita",
}


def _quote_looks_english(q: str) -> bool:
    """Conservative English check for a quote span: several EN stopwords and no
    strong Indonesian markers."""
    tokens = [t.lower() for t in _WORD.findall(q)]
    if not tokens:
        return False
    if any(t in _ID_MARKERS for t in tokens):
        return False
    return sum(1 for t in tokens if t in _EN_STOPWORDS) >= 2


def extract_quotes(
    text: str | None, *, max_quotes: int = 3, drop_english: bool = False
) -> list[dict]:
    text = clean_html(text)
    out: list[dict] = []
    seen: set[str] = set()
    for m in re.finditer(r'["“«]([^"”»]{25,400})["”»]', text):
        q = m.group(1).strip()
        if " " not in q or q.lower() in seen:
            continue
        if drop_english and _quote_looks_english(q):
            seen.add(q.lower())
            continue
        tail = text[m.end():m.end() + 100]
        head = text[max(0, m.start() - 100):m.start()]
        cite = ""
        am = (
            re.search(rf"(?:{_ATTR_VERBS})\s+({_NAME})", tail, re.I)
            or re.search(rf"({_NAME})\s+(?:meng\w+|men\w+|{_ATTR_VERBS})", tail)
            or re.search(rf"(?:{_ATTR_VERBS})\s+({_NAME})", head, re.I)
        )
        if am:
            cite = am.group(1).strip()
        seen.add(q.lower())
        out.append({"text": q, "cite": cite})
        if len(out) >= max_quotes:
            break
    return out
