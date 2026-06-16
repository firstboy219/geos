"""Default news/OSINT source list (free RSS/Atom, no API key, datacenter-friendly).

CMS-editable: stored in app_settings key 'news_sources' (JSON). This module holds
the curated defaults used when nothing is configured. Each source:
  {name, url, type: rss|atom|trends, credibility: 0..1, lang, enabled}

Verified reachable from the server. Reddit/Detik blocked from datacenter (omitted).
X/Twitter has no free feed — add via CMS with an RSS bridge/API URL when available.
"""
from __future__ import annotations

DEFAULT_NEWS_SOURCES: list[dict] = [
    # ── World news agencies ──
    {"name": "Al Jazeera", "url": "https://www.aljazeera.com/xml/rss/all.xml", "type": "rss", "credibility": 0.85, "lang": "en", "enabled": True},
    {"name": "BBC World", "url": "https://feeds.bbci.co.uk/news/world/rss.xml", "type": "rss", "credibility": 0.85, "lang": "en", "enabled": True},
    {"name": "The Guardian", "url": "https://www.theguardian.com/world/rss", "type": "rss", "credibility": 0.85, "lang": "en", "enabled": True},
    {"name": "CNN World", "url": "http://rss.cnn.com/rss/edition_world.rss", "type": "rss", "credibility": 0.8, "lang": "en", "enabled": True},
    {"name": "France 24", "url": "https://www.france24.com/en/rss", "type": "rss", "credibility": 0.8, "lang": "en", "enabled": True},
    {"name": "NYT World", "url": "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", "type": "rss", "credibility": 0.85, "lang": "en", "enabled": True},
    {"name": "Reuters", "url": "https://news.google.com/rss/search?q=when:1d%20site:reuters.com&hl=en-US&gl=US&ceid=US:en", "type": "rss", "credibility": 0.8, "lang": "en", "enabled": True},
    {"name": "AP News", "url": "https://news.google.com/rss/search?q=when:1d%20site:apnews.com&hl=en-US&gl=US&ceid=US:en", "type": "rss", "credibility": 0.8, "lang": "en", "enabled": True},
    {"name": "Google News (geopolitik dunia)", "url": "https://news.google.com/rss/search?q=geopolitical%20military%20sanctions%20naval%20territorial%20dispute&hl=en-US&gl=US&ceid=US:en", "type": "rss", "credibility": 0.65, "lang": "en", "enabled": True},
    # ── Indonesia / local ──
    {"name": "Antara", "url": "https://www.antaranews.com/rss/terkini.xml", "type": "rss", "credibility": 0.8, "lang": "id", "enabled": True},
    {"name": "CNBC Indonesia", "url": "https://www.cnbcindonesia.com/rss", "type": "rss", "credibility": 0.8, "lang": "id", "enabled": True},
    {"name": "Tempo Nasional", "url": "https://rss.tempo.co/nasional", "type": "rss", "credibility": 0.8, "lang": "id", "enabled": True},
    {"name": "Tempo", "url": "https://rss.tempo.co/", "type": "rss", "credibility": 0.8, "lang": "id", "enabled": True},
    {"name": "Kompas", "url": "https://www.kompas.com/rss", "type": "rss", "credibility": 0.85, "lang": "id", "enabled": False},  # connection blocked from datacenter IP
    {"name": "CNN Indonesia", "url": "https://www.cnnindonesia.com/rss", "type": "rss", "credibility": 0.8, "lang": "id", "enabled": True},
    {"name": "Liputan6", "url": "https://feed.liputan6.com/rss", "type": "rss", "credibility": 0.75, "lang": "id", "enabled": True},
    {"name": "Kumparan", "url": "https://kumparan.com/feed", "type": "rss", "credibility": 0.7, "lang": "id", "enabled": True},
    {"name": "Tribun", "url": "https://www.tribunnews.com/rss", "type": "rss", "credibility": 0.7, "lang": "id", "enabled": True},
    {"name": "Republika", "url": "https://www.republika.co.id/rss", "type": "rss", "credibility": 0.75, "lang": "id", "enabled": True},
    # NOTE: Detik was previously blocked from the datacenter IP — included anyway; may fail to fetch.
    {"name": "Detik", "url": "https://rss.detik.com/index.php/detikcom", "type": "rss", "credibility": 0.75, "lang": "id", "enabled": False},  # blocked from datacenter IP
    {"name": "Google News (Indonesia)", "url": "https://news.google.com/rss/search?q=geopolitik%20OR%20ekonomi%20OR%20militer%20OR%20Natuna&hl=id&gl=ID&ceid=ID:id", "type": "rss", "credibility": 0.65, "lang": "id", "enabled": True},
    # ── Trending / social / video ──
    {"name": "Google Trends ID", "url": "https://trends.google.com/trending/rss?geo=ID", "type": "trends", "credibility": 0.45, "lang": "id", "enabled": True},
    {"name": "Google Trends US", "url": "https://trends.google.com/trending/rss?geo=US", "type": "trends", "credibility": 0.45, "lang": "en", "enabled": True},
    {"name": "YouTube · Al Jazeera English", "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCNye-wNBqNL5ZzHSJj3l8Bg", "type": "atom", "credibility": 0.5, "lang": "en", "enabled": True},
    # ── Social media (Bluesky native RSS + Mastodon — only free bridges that work from a datacenter) ──
    {"name": "Bluesky · Reuters", "url": "https://bsky.app/profile/reuters.com/rss", "type": "rss", "credibility": 0.75, "lang": "en", "enabled": True},
    {"name": "Bluesky · AP", "url": "https://bsky.app/profile/apnews.com/rss", "type": "rss", "credibility": 0.75, "lang": "en", "enabled": True},
    {"name": "Bluesky · AFP", "url": "https://bsky.app/profile/afp.com/rss", "type": "rss", "credibility": 0.75, "lang": "en", "enabled": True},
    {"name": "Bluesky · Al Jazeera", "url": "https://bsky.app/profile/aljazeera.com/rss", "type": "rss", "credibility": 0.7, "lang": "en", "enabled": True},
    {"name": "Bluesky · Bellingcat (OSINT)", "url": "https://bsky.app/profile/bellingcat.com/rss", "type": "rss", "credibility": 0.7, "lang": "en", "enabled": True},
    {"name": "Bluesky · Bloomberg", "url": "https://bsky.app/profile/bloomberg.com/rss", "type": "rss", "credibility": 0.7, "lang": "en", "enabled": True},
    {"name": "Mastodon · DW", "url": "https://flipboard.social/@dw.rss", "type": "rss", "credibility": 0.7, "lang": "en", "enabled": True},
    # X/Twitter: no working free bridge from a datacenter IP (Nitter dead, public RSSHub/openrss blocked).
    # To add X: self-host RSSHub with Twitter auth, or a paid bridge (rss.app / RapidAPI), then add the URL here via the CMS.
]
