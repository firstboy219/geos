/**
 * Layout / motion constants.
 *
 * Ported from the Flutter app (`core/constants/app_constants.dart`, BAB 7.3).
 * Spacing base unit is 4dp — only use multiples of 4.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Corner radii (BAB 7.3). */
export const radii = {
  /** Main card radius. */
  card: 14,
  /** Small card radius. */
  cardSm: 12,
  /** Inner box radius. */
  inner: 10,
  /** Pill chip radius. */
  pill: 20,
  /** Square chip radius. */
  chip: 8,
} as const;

/** Border widths (BAB 7.3). */
export const borders = {
  /** Default border width for all borders. */
  hairline: 0.5,
  /** Emphasis card border width. */
  emphasis: 1.5,
} as const;

/** Standard all-around padding values derived from BAB 7.3. */
export const padding = {
  card: 14,
  cardSm: 12,
  inner: 10,
  screen: 16,
} as const;

/** Animation durations (ms) used across the app. */
export const durations = {
  fast: 150,
  normal: 250,
  slow: 400,
  shimmer: 1200,
} as const;

export type SpacingToken = keyof typeof spacing;
