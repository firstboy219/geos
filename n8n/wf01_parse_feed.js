// Parse one feed (RSS <item>/Atom <entry>). Extracts title, link, date, fuller
// content (content:encoded), and an article image. Posts w/o title fall back to
// description/content. (WF-01, multi-source.)
const src = $('Split sources').item.json || {};
const xml = String($json.data || $json.body || '');
const dec = (s) => (s || '').replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const blocks = (xml.match(/<(item|entry)\b[\s\S]*?<\/(item|entry)>/g)) || [];
const out = [];
for (const b of blocks) {
  let title = dec((b.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1] || '');
  const enc = (b.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/) || [])[1] || '';
  const descRaw = (b.match(/<description[^>]*>([\s\S]*?)<\/description>/) || [])[1] || (b.match(/<(content|summary)[^>]*>([\s\S]*?)<\/(content|summary)>/) || [])[2] || '';
  const body = dec(enc) || dec(descRaw);
  if (!title) title = body;
  let link = dec((b.match(/<link[^>]*>([\s\S]*?)<\/link>/) || [])[1] || '');
  if (!link) { const h = b.match(/<link[^>]*href=["']([^"']+)["']/); link = h ? h[1] : ''; }
  const pub = (b.match(/<(pubDate|published|updated)>([\s\S]*?)<\/(pubDate|published|updated)>/) || [])[2] || '';
  // ── image: media:content / media:thumbnail / enclosure / inline <img> ──
  let image = '';
  let m = b.match(/<media:content[^>]*url=["']([^"']+)["'][^>]*\/?>/i);
  if (m && (/medium=["']image|type=["']image|\.(jpe?g|png|webp|gif)/i.test(m[0]) || /\.(jpe?g|png|webp|gif)/i.test(m[1]))) image = m[1];
  if (!image) { m = b.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i); if (m) image = m[1]; }
  if (!image) { m = b.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image/i); if (m) image = m[1]; }
  if (!image) { m = b.match(/<enclosure[^>]*type=["']image[^>]*url=["']([^"']+)["']/i); if (m) image = m[1]; }
  if (!image) { m = (enc || descRaw).match(/<img[^>]*src=["']([^"']+)["']/i); if (m) image = m[1]; }
  if (image) image = image.replace(/&amp;/g, '&').trim().slice(0, 1000);
  if (!title) continue;
  let url = link;
  if (src.type === 'trends') { url = 'trend://' + (src.name || 't') + '/' + encodeURIComponent(title) + '/' + new Date().toISOString().slice(0, 10); title = 'Trending: ' + title; }
  if (!url) continue;
  let iso; try { iso = pub ? new Date(pub).toISOString() : new Date().toISOString(); } catch (e) { iso = new Date().toISOString(); }
  out.push({ json: {
    title: title.slice(0, 500),
    source_name: src.name || 'Unknown',
    url: String(url).slice(0, 1000),
    image_url: image || null,
    content_summary: (body || title).slice(0, 2000),
    content: (body || title).slice(0, 5000),
    published_at: iso,
    language: src.lang || 'en',
    credibility_score: src.credibility || 0.6,
  } });
}
return out;
