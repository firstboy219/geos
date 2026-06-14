import { StyleSheet, Text, View } from 'react-native';

import { GeoCard, SectionHeader } from '@/components';
import { borders, colors, radii, spacing, typography } from '@/theme';
import type { ScenarioData } from '@/data/vectors';

import { ImpactVectorBar } from './ImpactVectorBar';
import { KeyIndicatorRow } from './KeyIndicatorRow';

/**
 * Detail card for the selected scenario: name + big probability + rung,
 * narrative on a dark-blue panel, 3 impact-vector bars, 3 key indicators.
 */
export function ScenarioDetailCard({ scenario }: { scenario: ScenarioData }) {
  return (
    <GeoCard>
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={typography.title}>{scenario.name}</Text>
          <Text style={[typography.label, styles.rung]}>
            RUNG {scenario.rung} · ESCALATION LADDER
          </Text>
        </View>
        <Text style={styles.bigPct}>{Math.round(scenario.probability * 100)}%</Text>
      </View>

      <View style={styles.narrativePanel}>
        <Text style={styles.narrative}>{scenario.narrative}</Text>
      </View>

      <SectionHeader title="Impact Vectors" />
      {scenario.vectors.map((v) => (
        <ImpactVectorBar key={v.label} data={v} />
      ))}

      <SectionHeader title="Key Indicators" />
      {scenario.indicators.map((ind) => (
        <KeyIndicatorRow key={ind.label} indicator={ind} />
      ))}
    </GeoCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleCol: {
    flex: 1,
  },
  rung: {
    marginTop: spacing.xs,
  },
  bigPct: {
    ...typography.headline1,
    color: colors.accent,
    fontWeight: '600',
  },
  narrativePanel: {
    marginTop: spacing.md,
    backgroundColor: colors.accentDark,
    borderColor: colors.accentBorder,
    borderWidth: borders.hairline,
    borderRadius: radii.inner,
    padding: spacing.md,
  },
  narrative: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 19,
  },
});
