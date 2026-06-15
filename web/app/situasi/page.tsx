"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getJSON, type Paginated, type Situation } from "@/lib/api";

export default function SituasiListPage() {
  const [items, setItems] = useState<Situation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const s = await getJSON<Paginated<Situation>>("/public/situations?size=50");
        setItems(s.data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="font-serif font-bold text-3xl border-b-2 border-ink pb-2 mb-5">
        Situasi Kritis Saat Ini
      </h1>
      {loading ? (
        <p className="text-muted">Memuat…</p>
      ) : items.length === 0 ? (
        <p className="text-muted">Belum ada situasi aktif.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
          {items.map((s) => (
            <Link
              key={s.id}
              href={`/situasi/detail/?id=${s.id}`}
              className="block border-b border-rule pb-4"
            >
              <span className="text-[11px] uppercase tracking-wider text-accent font-sans">
                {s.region || s.crisis_type || "Global"} · {s.news_count} sumber
              </span>
              <h2 className="font-serif font-bold text-2xl leading-snug mt-1">{s.title}</h2>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
