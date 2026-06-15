/** Dampak (impacts) — demo content + live mapping for the Dampak menu (F2). */

export type ImpactDir = "up" | "down" | "neutral" | "mixed";

export interface ImpactApiItem {
  id: string;
  crisis_id: string;
  crisis_title: string | null;
  category: string;
  title: string;
  direction: ImpactDir | null;
  severity: string | null;
  timeframe: string | null;
  detail: string | null;
  confidence: number;
}

export interface ImpactRow {
  id: string;
  category: string;
  title: string;
  direction: ImpactDir;
  severity: string | null;
  timeframe: string | null;
  detail: string | null;
}

export interface SituationImpacts {
  crisisId: string;
  title: string;
  impacts: ImpactRow[];
}

/** Category filter chips: label shown ↔ backend `category` value (null = all). */
export const IMPACT_FILTERS: { label: string; value: string | null }[] = [
  { label: "Semua", value: null },
  { label: "Umum", value: "general" },
  { label: "Saham", value: "stocks" },
  { label: "Industri", value: "industry" },
  { label: "Emas", value: "gold" },
  { label: "Forex", value: "forex" },
  { label: "Crypto", value: "crypto" },
  { label: "Properti", value: "property" },
  { label: "Energi", value: "energy" },
];

function toRow(it: ImpactApiItem): ImpactRow {
  return {
    id: it.id,
    category: it.category,
    title: it.title,
    direction: it.direction ?? "neutral",
    severity: it.severity,
    timeframe: it.timeframe,
    detail: it.detail,
  };
}

/** Group a flat impacts list into situations, preserving order. */
export function groupImpacts(items: ImpactApiItem[]): SituationImpacts[] {
  const map = new Map<string, SituationImpacts>();
  for (const it of items) {
    const key = it.crisis_id;
    let g = map.get(key);
    if (!g) {
      g = { crisisId: key, title: it.crisis_title ?? "Situasi", impacts: [] };
      map.set(key, g);
    }
    g.impacts.push(toRow(it));
  }
  return [...map.values()];
}

// ── Demo fallback ───────────────────────────────────────────
export const DEMO_IMPACTS: SituationImpacts[] = [
  {
    crisisId: "demo-iran",
    title: "Eskalasi Iran vs Amerika",
    impacts: [
      { id: "d1", category: "energy", title: "Harga BBM retail naik", direction: "up", severity: "high", timeframe: "1-3 bulan", detail: "Gangguan jalur minyak Selat Hormuz menekan pasokan global." },
      { id: "d2", category: "general", title: "Ekspor-impor melambat", direction: "down", severity: "medium", timeframe: "3-6 bulan", detail: "Biaya logistik & asuransi pelayaran naik tajam." },
      { id: "d3", category: "gold", title: "Emas menguat (safe haven)", direction: "up", severity: "high", timeframe: "segera", detail: "Permintaan aset lindung nilai melonjak." },
      { id: "d4", category: "stocks", title: "IHSG tertekan", direction: "down", severity: "medium", timeframe: "1-2 bulan", detail: "Risk-off; asing keluar dari pasar berkembang." },
      { id: "d5", category: "forex", title: "USD menguat, IDR melemah", direction: "mixed", severity: "medium", timeframe: "1-3 bulan", detail: "Aliran dana ke dolar sebagai safe haven." },
    ],
  },
];
