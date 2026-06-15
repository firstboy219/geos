"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getJSON,
  imgFor,
  timeAgo,
  type NewsItem,
  type Paginated,
  type Situation,
} from "@/lib/api";

export default function HomePage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [situations, setSituations] = useState<Situation[]>([]);
  const [err, setErr] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [n, s] = await Promise.all([
          getJSON<Paginated<NewsItem>>("/public/news?size=25"),
          getJSON<Paginated<Situation>>("/public/situations?size=8"),
        ]);
        setNews(n.data);
        setSituations(s.data);
      } catch {
        setErr(true);
      }
    })();
  }, []);

  if (err) {
    return <p className="py-20 text-center text-muted">Gagal memuat berita. Coba lagi nanti.</p>;
  }
  if (news.length === 0) {
    return <p className="py-20 text-center text-muted">Memuat edisi terbaru…</p>;
  }

  const lead = news[0];
  const secondary = news.slice(1, 4);
  const rest = news.slice(4);

  return (
    <div>
      {/* Lead section */}
      <section className="grid md:grid-cols-3 gap-6 pb-6 border-b-2 border-ink">
        {/* Lead story */}
        <article className="md:col-span-2 md:border-r md:border-rule md:pr-6">
          <a href={lead.url} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgFor(lead.id, lead.image_url)}
              alt=""
              className="w-full h-72 md:h-96 object-cover mb-3 grayscale-[15%]"
            />
            <span className="text-[11px] uppercase tracking-wider text-accent font-sans">
              {lead.source_name || "Laporan"} · {timeAgo(lead.published_at || lead.ingested_at)}
            </span>
            <h1 className="font-serif font-bold leading-tight text-3xl md:text-5xl mt-1">
              {lead.title}
            </h1>
          </a>
          {lead.summary_points && lead.summary_points[0] ? (
            <p className="dropcap mt-3 text-lg leading-relaxed text-ink/90">
              {lead.summary_points.join(" ")}
            </p>
          ) : null}
          {lead.summary_quotes && lead.summary_quotes[0] ? (
            <blockquote className="mt-3 border-l-4 border-ink pl-4 italic text-lg">
              “{lead.summary_quotes[0].text}”
              <cite className="block not-italic text-sm text-muted mt-1">
                — {lead.summary_quotes[0].cite}
              </cite>
            </blockquote>
          ) : null}
        </article>

        {/* Right rail */}
        <aside className="space-y-5">
          <div>
            <h2 className="font-sans text-[12px] uppercase tracking-widest border-b-2 border-ink pb-1 mb-3">
              Situasi Terkini
            </h2>
            <ul className="space-y-3">
              {situations.map((s) => (
                <li key={s.id} className="border-b border-rule pb-2">
                  <Link href={`/situasi/detail/?id=${s.id}`} className="block">
                    <h3 className="font-serif font-semibold leading-snug">{s.title}</h3>
                    <span className="text-[11px] uppercase tracking-wider text-muted font-sans">
                      {s.region || s.crisis_type || "Global"} · {s.news_count} sumber
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-rule pt-3 space-y-4">
            {secondary.map((a) => (
              <article key={a.id}>
                <a href={a.url} target="_blank" rel="noreferrer">
                  <h3 className="font-serif font-bold leading-snug text-lg">{a.title}</h3>
                </a>
                <span className="text-[11px] uppercase tracking-wider text-muted font-sans">
                  {a.source_name || "Laporan"}
                </span>
              </article>
            ))}
          </div>
        </aside>
      </section>

      {/* Latest grid */}
      <section id="terbaru" className="mt-6">
        <h2 className="font-sans text-[12px] uppercase tracking-widest border-b-2 border-ink pb-1 mb-4">
          Berita Terbaru
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 col-rules">
          {rest.map((a) => (
            <article key={a.id}>
              <a href={a.url} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgFor(a.id, a.image_url)}
                  alt=""
                  className="w-full h-32 object-cover mb-2 grayscale-[15%]"
                />
                <span className="text-[10px] uppercase tracking-wider text-accent font-sans">
                  {a.source_name || "Laporan"}
                </span>
                <h3 className="font-serif font-bold leading-snug mt-0.5">{a.title}</h3>
              </a>
              {a.summary_points && a.summary_points[0] ? (
                <p className="text-sm text-ink/80 mt-1 leading-snug">
                  {a.summary_points[0]}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
