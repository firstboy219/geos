import type { TextStyle } from 'react-native';

import { colors } from './colors';

/**
 * Geoscan typography scale.
 *
 * Ported from the Flutter app (`core/theme/app_text_styles.dart`, BAB 7.2).
 * Uses the system font (no custom font bundled). Flutter FontWeight maps:
 *   w400 → '400', w500 → '500', w600 → '600'.
 */
export const typography = {
  headline1: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headline2: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  titleSm: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textPrimary,
  },
  bodySm: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.textMuted,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 0.4,
  },
  mono: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  /** Logo styling. 'GEO' = textPrimary, 'SCAN' = accent. */
  logo: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
