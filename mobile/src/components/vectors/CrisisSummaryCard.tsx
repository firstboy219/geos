import { StyleSheet, Text, View } from 'react-native';

import { GeoCard, LayerChip, RiskPill } from '@/components';
import { colors, spacing, typography } from '@/theme';
import type { CrisisData } from '@/data/vectors';

/** Crisis summary header on the detail screen: risk + stats + layer chips. */
export function CrisisSummaryCard({ crisis }: { crisis: CrisisData }) {
  return (
    <GeoCard emphasis>
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={typography.headline2}>{crisis.title}</Text>
          <Text style={[typography.bodySm, styles.region]}>{crisis.region}</Text>
        </View>
        <RiskPill level={crisis.risk} />
      </View>

      <View style={styles.statsRow}>
        <Stat label="Tripwires" value={String(crisis.tripwires)} />
        <Stat label="Aktor" value={String(crisis.actors)} />
        <Stat label="Update" value={crisis.lastUpdate} small />
        <Stat label="Skenario" value={String(crisis.scenarioCount)} />
      </View>

      <View style={styles.chips}>
        {crisis.layers.map((l) => (
          <LayerChip
            key={l.code}
            code={l.code}
            label={l.label}
            tooltip={l.tooltip}
            color={l.color}
          />
        ))}
      </View>
    </GeoCard>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text
        style={[small ? typography.titleSm : typography.title, styles.statValue]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={typography.label}>{label.toUpperCase()}</Text>
    </View>
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
  region: {
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  stat: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  statValue: {
    color: colors.textPrimary,
    marginBottom: 2,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
