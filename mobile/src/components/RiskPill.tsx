import { StyleSheet, Text, View } from 'react-native';

import { borders, colors, radii, spacing, typography } from '@/theme';

/** Risk severity levels used across crisis / scenario cards. */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface RiskStyle {
  fg: string;
  bg: string;
  border: string;
  text: string;
}

const RISK_STYLES: Record<RiskLevel, RiskStyle> = {
  low: {
    fg: colors.success,
    bg: colors.successDark,
    border: colors.successBorder,
    text: 'Low',
  },
  medium: {
    fg: colors.warning,
    bg: colors.warningDark,
    border: colors.warningBorder,
    text: 'Medium',
  },
  high: {
    fg: colors.danger,
    bg: colors.dangerDark,
    border: colors.dangerBorder,
    text: 'High',
  },
  critical: {
    fg: colors.purple,
    bg: colors.purpleDark,
    border: colors.purpleBorder,
    text: 'Critical',
  },
};

/** Maps a free-form backend string to a RiskLevel (EN + ID aware). */
export function riskLevelFrom(value: string): RiskLevel {
  switch (value.toLowerCase().trim()) {
    case 'low':
    case 'rendah':
      return 'low';
    case 'high':
    case 'tinggi':
      return 'high';
    case 'critical':
    case 'kritis':
      return 'critical';
    case 'medium':
    case 'sedang':
    default:
      return 'medium';
  }
}

/**
 * A colored status pill conveying a risk level (BAB 7.3 pill, radius 20).
 * low → green, medium → yellow, high → red, critical → purple.
 */
export function RiskPill({ level, label }: { level: RiskLevel; label?: string }) {
  const s = RISK_STYLES[level];
  return (
    <View
      style={[styles.pill, { backgroundColor: s.bg, borderColor: s.border }]}
    >
      <Text style={[typography.caption, styles.text, { color: s.fg }]}>
        {label ?? s.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: borders.hairline,
  },
  text: {
    fontWeight: '500',
  },
});
