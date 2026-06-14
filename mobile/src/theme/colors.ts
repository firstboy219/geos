/**
 * Geoscan color palette — Dark Mode (Bloomberg-style).
 *
 * Ported 1:1 from the Flutter app (`core/theme/app_colors.dart`, BAB 7.1).
 * IMMUTABLE — do not change values without design confirmation.
 */
export const colors = {
  // ── Surfaces ──────────────────────────────────────────────
  background: '#0D1117', // Main screen bg
  surface: '#161B22', // Card background
  surfaceAlt: '#0D1117', // Inner card bg
  border: '#30363D', // All borders
  borderSubtle: '#21262D', // Dividers

  // ── Text ──────────────────────────────────────────────────
  textPrimary: '#F0F6FC', // Main text
  textSecondary: '#8B949E', // Sub text
  textMuted: '#6E7681', // Placeholder

  // ── Accent (blue) ─────────────────────────────────────────
  accent: '#4493F8', // Blue — CTA, active
  accentDark: '#0D2044', // Blue dark bg
  accentBorder: '#1F4A8A', // Blue border

  // ── Success (green) ───────────────────────────────────────
  success: '#3FB950', // Green — positive
  successDark: '#0D2818',
  successBorder: '#1A4D2E',

  // ── Warning (yellow) ──────────────────────────────────────
  warning: '#E3B341', // Yellow — medium risk
  warningDark: '#2D1B00',
  warningBorder: '#4A3000',

  // ── Danger (red) ──────────────────────────────────────────
  danger: '#F85149', // Red — high risk/alert
  dangerDark: '#3D1010',
  dangerBorder: '#5C1C1C',

  // ── Purple (nuclear / gray zone) ──────────────────────────
  purple: '#9B59B6',
  purpleDark: '#1A1040',
  purpleBorder: '#5B21B6',

  // ── Misc ──────────────────────────────────────────────────
  tooltipBg: '#1C2333', // Tooltip surface (from home_primitives)
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;
