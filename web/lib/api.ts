export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

export interface NewsItem {
  id: string;
  title: string;
  source_name: string | null;
  url: string;
  image_url: string | null;
  summary_points: string[] | null;
  summary_quotes: { text: string; cite: string | null }[] | null;
  published_at: string | null;
  ingested_at: string;
  crisis_id: string | null;
}

export interface Situation {
  id: string;
  title: string;
  region: string | null;
  crisis_type: string | null;
  severity_level: number | null;
  status: string;
  news_count: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
}

export async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export function imgFor(id: string, url?: string | null): string {
  return url || `https://picsum.photos/seed/geoscan-${id}/800/500`;
}

export function timeAgo(iso?: string | null): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const mins = Math.max(1, Math.round((Date.now() - t) / 60000));
  if (mins < 60) return `${mins} menit lalu`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.round(h / 24)} hari lalu`;
}
