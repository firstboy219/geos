"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getJSON } from "@/lib/api";

interface Scenario {
  name: string;
  probability: number;
  rung: number | null;
  confidence_score: number | null;
  narrative_text: string | null;
}
interface Impact {
  category: string;
  title: string;
  direction: string | null;
  severity: string | null;
  timeframe: string | null;
  detail: string | null;
}
interface NewsRow {
  id: string;
  title: string;
  source_name: string | null;
  url: string;
}
interface Detail {
  situation: { title: string; region: string | null; news_count: number };
  description: string | null;
  scenarios: Scenario[];
  impacts: Impact[];
  news: NewsRow[];
}

const DIR: Record<string, string> = { up: "▲", down: "▼", neutral: "▬", mixed: "◆" };

export default function SituationDetailPage() {
  const [d, setD] = useState<Detail | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
      setErr(true);
      return;
    }
    (async () => {
      try {
        setD(await getJSON<Detail>(`/public/situations/${id}`));
      } catch {
        setErr(true);
      }
    })();
  }, []);

  if (err) return <p className="py-20 text-center text-muted">Situasi tidak ditemukan.</p>;
  if (!d) return <p className="py-20 text-center text-muted">Memuat…</p>;

  return (
    <article className="max-w-3xl mx-auto">
      <Link href="/situasi" className="text-[12px] uppercase tracking-wider text-muted">
        ‹ Semua Situasi
      </Link>
      <h1 className="font-serif font-bold text-4xl leading-tight mt-2">{d.situation.title}</h1>
      <p className="text-[12px] uppercase tracking-wider text-muted font-sans mt-2 border-b-2 border-ink pb-3">
        {d.situation.region || "Global"} · {d.situation.news_count} sumber dianalisa
      </p>

      {d.description ? (
        <p className="dropcap text-lg leading-relaxed mt-4">{d.description}</p>
      ) : null}

      {d.scenarios.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-sans text-[12px] uppercase tracking-widest border-b border-ink pb-1 mb-3">
            Skenario Proyeksi
          </h2>
          <div className="space-y-4">
            {d.scenarios.map((s, i) => (
              <div key={i} className="border-l-4 border-ink pl-4">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-serif font-bold text-xl">{s.name}</h3>
                  <span className="font-sans font-bold">{Math.round(s.probability)}%</span>
                </div>
                {s.narrative_text ? (
                  <p className="text-ink/85 leading-relaxed mt-1">{s.narrative_text}</p>
                ) : null}
                {s.confidence_score != null ? (
                  <span className="text-[11px] uppercase tracking-wider text-muted font-sans">
                    Kepercayaan AI {Math.round(s.confidence_score)}%
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {d.impacts.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-sans text-[12px] uppercase tracking-widest border-b border-ink pb-1 mb-3">
            Dampak
          </h2>
          <ul className="space-y-2">
            {d.impacts.map((im, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-sans">{DIR[im.direction || "neutral"]}</span>
                <span>
                  <strong className="font-serif">{im.title}</strong>
                  {im.detail ? <span className="text-ink/80"> — {im.detail}</span> : null}
                  <span className="text-[11px] uppercase tracking-wider text-muted font-sans">
                    {"  "}
                    {im.category}
                    {im.timeframe ? ` · ${im.timeframe}` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {d.news.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-sans text-[12px] uppercase tracking-widest border-b border-ink pb-1 mb-3">
            Berita Terkait ({d.news.length})
          </h2>
          <ul className="space-y-2">
            {d.news.map((n) => (
              <li key={n.id}>
                <a href={n.url} target="_blank" rel="noreferrer" className="font-serif">
                  {n.title}
                </a>
                <span className="text-[11px] uppercase tracking-wider text-muted font-sans">
                  {"  "}
                  {n.source_name || "Laporan"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
