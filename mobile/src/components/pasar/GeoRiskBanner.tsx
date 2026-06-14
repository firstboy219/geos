import { StyleSheet, Text, View } from 'react-native';

import { GeoCard, TooltipChip } from '@/components';
import { RISK_BANNER, RISK_CHIPS } from '@/data/pasar';
import { colors, radii, spacing, typography } from '@/theme';

/**
 * Geopolitical risk banner (component #2): weighted score, Shock Multiplier
 * description and tap-tooltip geo-signal chips.
 */
export function GeoRiskBanner() {
  return (
    <GeoCard radius={radii.cardSm} style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Risiko Geopolitik ke Pasar</Text>
          <Text style={[typography.caption, styles.subtitle]}>{RISK_BANNER.subtitle}</Text>
        </View>
        <View style={styles.scoreCol}>
          <Text style={styles.score}>
            {RISK_BANNER.score}
            <Text style={styles.scoreMax}>{RISK_BANNER.scoreMax}</Text>
          </Text>
          <Text style={[typography.label, styles.scoreLabel]}>{RISK_BANNER.label}</Text>
        </View>
      </View>

      <Text style={[typography.caption, styles.description]}>{RISK_BANNER.description}</Text>

      <View style={styles.chips}>
        {RISK_CHIPS.map((chip) => (
          <TooltipChip key={chip.label} label={chip.label} tooltip={chip.tooltip} tone={chip.tone} />
        ))}
      </View>
    </GeoCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.bodySm,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  subtitle: {
    marginTop: 1,
  },
  scoreCol: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  score: {
    ...typography.headline2,
    color: colors.warning,
  },
  scoreMax: {
    ...typography.titleSm,
    color: colors.textMuted,
  },
  scoreLabel: {
    color: colors.warning,
  },
  description: {
    color: '#8B9FB8',
    lineHeight: 16,
    marginTop: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
});
