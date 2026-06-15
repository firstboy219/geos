/**
 * Centralised API base URL + endpoint paths.
 *
 * Ported from the Flutter app (`core/constants/api_constants.dart`, BAB 5).
 * Backend is LIVE — do not change the base URL.
 */
export const baseUrl = 'https://apigeo.cosger.online';
export const wsBaseUrl = 'wss://apigeo.cosger.online';

/** Request timeout (BAB 1-B: 30s). */
export const requestTimeoutMs = 30_000;

export const endpoints = {
  // ── Auth ──────────────────────────────────────────────────
  register: '/auth/register',
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  waRequestOtp: '/auth/wa/request-otp',
  waVerifyOtp: '/auth/wa/verify-otp',

  // ── Users ─────────────────────────────────────────────────
  me: '/users/me',

  // ── Crisis & scenario ─────────────────────────────────────
  crises: '/crises',
  crisis: (id: string) => `/crises/${id}`,
  crisisScenarios: (id: string) => `/crises/${id}/scenarios`,
  crisisActors: (id: string) => `/crises/${id}/actors`,
  crisisNews: (id: string) => `/crises/${id}/news`,
  scenarioHistory: (id: string) => `/scenarios/${id}/history`,

  // ── News feed (Beranda) ───────────────────────────────────
  news: '/news',

  // ── Dampak (impacts) ──────────────────────────────────────
  impacts: '/impacts',
  personalImpact: '/impacts/personal',

  // ── Actors ────────────────────────────────────────────────
  actors: '/actors',
  actor: (id: string) => `/actors/${id}`,

  // ── Portfolio ─────────────────────────────────────────────
  portfolio: '/portfolio',
  portfolioAsset: (id: string) => `/portfolio/${id}`,
  portfolioImpact: '/portfolio/impact',

  // ── Pasar (market) ────────────────────────────────────────
  pasarAssets: '/pasar/assets',
  pasarMatrix: '/pasar/matrix',
  pasarHeatmap: '/pasar/heatmap',

  // ── Alerts ────────────────────────────────────────────────
  alerts: '/alerts',
  alertsUnreadCount: '/alerts/unread-count',
  alertRead: (id: string) => `/alerts/${id}/read`,
  alertsReadAll: '/alerts/read-all',

  // ── WebSocket & system ────────────────────────────────────
  ws: '/ws',
  health: '/health',
} as const;

/** Builds the authenticated WebSocket URL: `wss://host/ws?token={jwt}`. */
export const wsUrl = (token: string): string =>
  `${wsBaseUrl}${endpoints.ws}?token=${encodeURIComponent(token)}`;
