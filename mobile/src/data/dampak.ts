/** Dampak (impacts) — demo content + live mapping for the Dampak menu (F2). */

export type ImpactDir = "up" | "down" | "neutral" | "mixed";

export interface ImpactApiItem {
  id: string;
  crisis_id: string;
  crisis_title: string | null;
  scenario_id: string | null;
  scenario_name: string | null;
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

/** Impacts under one scenario of a situation (D1). */
export interface ScenarioImpacts {
  scenarioId: string | null;
  scenarioName: string | null;
  impacts: ImpactRow[];
}

export interface SituationImpacts {
  crisisId: string;
  title: string;
  /** Impacts grouped by scenario (scenarioId null = not tied to a scenario). */
  scenarios: ScenarioImpacts[];
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

/**
 * Group a flat impacts list into situations → scenarios → impacts, preserving
 * order (the API already orders by crisis then scenario).
 */
export function groupImpacts(items: ImpactApiItem[]): SituationImpacts[] {
  const sitMap = new Map<string, SituationImpacts>();
  for (const it of items) {
    let sit = sitMap.get(it.crisis_id);
    if (!sit) {
      sit = { crisisId: it.crisis_id, title: it.crisis_title ?? "Situasi", scenarios: [] };
      sitMap.set(it.crisis_id, sit);
    }
    const scenKey = it.scenario_id ?? "__none__";
    let scen = sit.scenarios.find(
      (s) => (s.scenarioId ?? "__none__") === scenKey,
    );
    if (!scen) {
      scen = { scenarioId: it.scenario_id, scenarioName: it.scenario_name, impacts: [] };
      sit.scenarios.push(scen);
    }
    scen.impacts.push(toRow(it));
  }
  return [...sitMap.values()];
}
