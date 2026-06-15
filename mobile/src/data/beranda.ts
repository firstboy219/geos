/**
 * Demo content for the Beranda (news feed) screen — mirrors mockup_v2/home_page.
 * There is no public news endpoint (news lives on the internal n8n router), so
 * this drives the UI with representative content, following the existing
 * data/*.ts demo pattern. Images use picsum (stable, free) seeded by id.
 */

export type DotTone = "emerald" | "amber" | "rose";

export interface Quote {
  text: string;
  cite: string;
}

export interface BeritaArticle {
  id: string;
  source: string;
  title: string;
  body: string;
  time: string;
  /** Remote image (from RSS via backend); falls back to picsum by id. */
  image?: string;
  /** Pill badge (featured) — e.g. "Terkini". */
  badge?: { label: string; tone: DotTone };
  /** Status dot chip (briefs) — e.g. "Risiko Meningkat". */
  status?: { label: string; tone: DotTone };
  intisari?: string[];
  quotes?: Quote[];
}

export function imageFor(id: string): string {
  return `https://picsum.photos/seed/geoscan-${id}/800/450`;
}

// ── Live mapping (GET /news → feed shapes) ──────────────────
export interface NewsApiItem {
  id: string;
  title: string;
  source_name: string | null;
  url: string;
  image_url: string | null;
  summary_points: string[] | null;
  summary_quotes: { text: string; cite: string | null }[] | null;
  published_at: string | null;
  ingested_at: string;
}

export function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.round((Date.now() - then) / 1000);
  if (secs < 60) return "baru saja";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} menit yang lalu`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} jam yang lalu`;
  const days = Math.round(hrs / 24);
  return `${days} hari yang lalu`;
}

export function toArticle(it: NewsApiItem): BeritaArticle {
  const points = (it.summary_points ?? []).filter(Boolean);
  const quotes = (it.summary_quotes ?? [])
    .filter((q) => q && q.text)
    .map((q) => ({ text: q.text, cite: q.cite ?? "" }));
  return {
    id: it.id,
    source: it.source_name ?? "Sumber",
    title: it.title,
    body: points[0] ?? "",
    time: timeAgo(it.published_at ?? it.ingested_at),
    image: it.image_url ?? undefined,
    intisari: points.length ? points : undefined,
    quotes: quotes.length ? quotes : undefined,
  };
}

export function toLatest(it: NewsApiItem): LatestItem {
  return {
    id: it.id,
    source: it.source_name ?? "Sumber",
    title: it.title,
    time: timeAgo(it.published_at ?? it.ingested_at),
    image: it.image_url ?? undefined,
    tone: "emerald",
  };
}

export const FEATURED: BeritaArticle = {
  id: "feat-hormuz",
  source: "CNN",
  title: "Eskalasi Maritim di Laut China Selatan Memicu Kewaspadaan Regional",
  body: "Pengerahan kapal militer meningkat tajam setelah serangkaian insiden di zona sengketa. Pasar komoditas bereaksi terhadap risiko gangguan jalur pelayaran utama Asia.",
  time: "1 jam yang lalu",
  badge: { label: "Terkini", tone: "rose" },
  intisari: [
    "Aktivitas angkatan laut meningkat di sepanjang jalur pelayaran strategis.",
    "Harga energi dan komoditas logam menunjukkan volatilitas jangka pendek.",
  ],
  quotes: [
    {
      text: "Stabilitas jalur laut adalah fondasi dari rantai pasok global yang sehat.",
      cite: "- Dr. Andi Pratama, Analis Geopolitik",
    },
  ],
};

export const CATEGORIES = [
  "Semua Sektor",
  "Makroekonomi",
  "Kebijakan Energi",
  "Keamanan Siber",
  "Pertahanan",
];

export const BRIEFS: BeritaArticle[] = [
  {
    id: "brief-hormuz",
    source: "CNBC",
    title: "Ketegangan di Selat Hormuz Meningkat",
    body: "Pengerahan angkatan laut meningkat setelah kegagalan diplomatik, mengancam 20% transit minyak global.",
    time: "2 jam yang lalu",
    status: { label: "Risiko Meningkat", tone: "amber" },
  },
  {
    id: "brief-tech",
    source: "Bloomberg",
    title: "Kesepakatan Teknologi Bilateral Ditandatangani",
    body: "Perjanjian kerangka kerja baru dibentuk untuk ketahanan rantai pasokan semikonduktor di antara sekutu Pasifik.",
    time: "3 jam yang lalu",
    status: { label: "Mulai Stabil", tone: "emerald" },
    intisari: [
      "Penguatan kemitraan strategis di sektor teknologi tinggi.",
      "Diversifikasi sumber daya untuk produksi semikonduktor.",
    ],
    quotes: [
      {
        text: "Kolaborasi ini adalah kunci kedaulatan digital masa depan.",
        cite: "- Dr. Andi Pratama, Peneliti Teknologi",
      },
      {
        text: "Infrastruktur digital yang tangguh adalah fondasi dari ekonomi modern yang kompetitif.",
        cite: "- Dr. Siti Aminah, Pakar Keamanan Siber",
      },
    ],
  },
];

export interface LatestItem {
  id: string;
  source: string;
  title: string;
  time: string;
  image?: string;
  tone: DotTone;
}

export const LATEST: LatestItem[] = [
  {
    id: "lat-nikel",
    source: "Antara",
    title: "Harga nikel global tertekan, tekanan fiskal pada eksportir meningkat",
    time: "4 jam yang lalu",
    tone: "amber",
  },
  {
    id: "lat-asean",
    source: "Reuters",
    title: "ASEAN dorong dialog terbuka untuk meredakan ketegangan kawasan",
    time: "6 jam yang lalu",
    tone: "emerald",
  },
  {
    id: "lat-cyber",
    source: "Tempo",
    title: "Serangan siber terhadap infrastruktur energi nasional digagalkan",
    time: "8 jam yang lalu",
    tone: "rose",
  },
];
