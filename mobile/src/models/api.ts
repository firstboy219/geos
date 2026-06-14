/**
 * Backend DTOs (BAB 4/5 shapes) with defensive parsing.
 *
 * Ported from the Flutter app (`core/models/api_models.dart` + `user_model.dart`).
 * These are the *wire* models returned by the API. Feature screens may map them
 * onto richer presentation models; parsing tolerates missing fields so the UI
 * degrades gracefully.
 */

type Json = Record<string, unknown>;

// ── Safe coercion helpers ───────────────────────────────────
function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const parsed = Number(v);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function int(v: unknown, fallback = 0): number {
  return Math.trunc(num(v, fallback));
}

function bool(v: unknown): boolean {
  return v === true || v === 'true' || v === 1;
}

function str(v: unknown, fallback = ''): string {
  if (v == null) return fallback;
  return typeof v === 'string' ? v : String(v);
}

function asObject(v: unknown): Json {
  return v && typeof v === 'object' ? (v as Json) : {};
}

function asArray(v: unknown): Json[] {
  return Array.isArray(v) ? (v.filter((e) => e && typeof e === 'object') as Json[]) : [];
}

/**
 * Unwraps a list response that may be a bare array or wrapped as `{ data: [...] }`
 * (mirrors the Flutter providers' `_list` helper).
 */
export function unwrapList(data: unknown): Json[] {
  if (Array.isArray(data)) return asArray(data);
  if (data && typeof data === 'object' && Array.isArray((data as Json).data)) {
    return asArray((data as Json).data);
  }
  return [];
}

function dateOrNull(v: unknown): Date | null {
  const s = str(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ── User ────────────────────────────────────────────────────
export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  /** One of: `free`, `pro`, `enterprise` (BAB 5.2). */
  tier: string;
  portfolioCount: number;
  unreadAlerts: number;
}

export function parseUser(raw: unknown): UserDto {
  const j = asObject(raw);
  return {
    id: str(j.id),
    email: str(j.email),
    fullName: str(j.full_name),
    tier: str(j.tier, 'free'),
    portfolioCount: int(j.portfolio_count),
    unreadAlerts: int(j.unread_alerts),
  };
}

// ── Scenario ────────────────────────────────────────────────
export interface ScenarioDto {
  id: string;
  name: string;
  /** 0..1 */
  probability: number;
  rung: number;
  vectorEscalation: string;
  narrativeText: string;
  confidenceScore: number;
}

export function parseScenario(raw: unknown): ScenarioDto {
  const j = asObject(raw);
  return {
    id: str(j.id),
    name: str(j.name),
    probability: num(j.probability),
    rung: int(j.rung, 1),
    vectorEscalation: str(j.vector_escalation),
    narrativeText: str(j.narrative_text),
    confidenceScore: num(j.confidence_score),
  };
}

// ── Crisis ──────────────────────────────────────────────────
export interface CrisisDto {
  id: string;
  title: string;
  region: string;
  subRegion: string;
  crisisType: string;
  status: string;
  severityLevel: number;
  redlineIndex: number;
  misreadScore: number;
  csiAverage: number;
  rfsAverage: number;
  credibilityScore: number;
  grayZone: boolean;
  shockMultiplier: number;
  scenarios: ScenarioDto[];
}

export function parseCrisis(raw: unknown): CrisisDto {
  const j = asObject(raw);
  const scenarioSource = j.scenarios ?? j.current_scenarios;
  return {
    id: str(j.id),
    title: str(j.title),
    region: str(j.region),
    subRegion: str(j.sub_region),
    crisisType: str(j.crisis_type),
    status: str(j.status, 'active'),
    severityLevel: int(j.severity_level, 5),
    redlineIndex: num(j.redline_index, 5),
    misreadScore: num(j.misread_score, 5),
    csiAverage: num(j.csi_average, 5),
    rfsAverage: num(j.rfs_average, 5),
    credibilityScore: num(j.credibility_score, 0.8),
    grayZone: bool(j.gray_zone),
    shockMultiplier: num(j.shock_multiplier, 1.0),
    scenarios: asArray(scenarioSource).map(parseScenario),
  };
}

// ── Alert ───────────────────────────────────────────────────
export interface AlertDto {
  id: string;
  type: string;
  severity: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date | null;
}

export function parseAlert(raw: unknown): AlertDto {
  const j = asObject(raw);
  return {
    id: str(j.id),
    type: str(j.type),
    severity: str(j.severity, 'info'),
    title: str(j.title),
    body: str(j.body),
    isRead: bool(j.is_read),
    createdAt: dateOrNull(j.created_at),
  };
}

// ── Portfolio asset ─────────────────────────────────────────
export interface PortfolioAssetDto {
  id: string;
  assetType: string;
  assetName: string;
  ticker: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  currency: string;
}

export function parsePortfolioAsset(raw: unknown): PortfolioAssetDto {
  const j = asObject(raw);
  return {
    id: str(j.id),
    assetType: str(j.asset_type, 'stock'),
    assetName: str(j.asset_name),
    ticker: str(j.ticker),
    quantity: num(j.quantity),
    purchasePrice: num(j.purchase_price),
    currentPrice: num(j.current_price),
    currency: str(j.currency, 'IDR'),
  };
}

/** Market value of a held asset (current price, falling back to purchase). */
export function portfolioAssetValue(a: PortfolioAssetDto): number {
  return a.quantity * (a.currentPrice > 0 ? a.currentPrice : a.purchasePrice);
}

// ── Pasar (market) asset ────────────────────────────────────
export interface PasarAssetDto {
  symbol: string;
  name: string;
  category: string;
  price: number;
  changePercent: number;
  geoSignalType: string;
  geoSignalText: string;
  geoSignalDetail: string;
}

export function parsePasarAsset(raw: unknown): PasarAssetDto {
  const j = asObject(raw);
  return {
    symbol: str(j.symbol),
    name: str(j.name),
    category: str(j.category),
    price: num(j.price),
    changePercent: num(j.change_percent),
    geoSignalType: str(j.geo_signal_type),
    geoSignalText: str(j.geo_signal_text),
    geoSignalDetail: str(j.geo_signal_detail),
  };
}

/** Maps a `{access_token, refresh_token}` auth response defensively. */
export interface AuthTokensDto {
  accessToken: string | null;
  refreshToken: string | null;
}

export function parseAuthTokens(raw: unknown): AuthTokensDto {
  const j = asObject(raw);
  return {
    accessToken: j.access_token != null ? str(j.access_token) : null,
    refreshToken: j.refresh_token != null ? str(j.refresh_token) : null,
  };
}
