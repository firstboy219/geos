import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GeoCard, RiskPill } from '@/components';
import { colors, spacing, typography } from '@/theme';
import type { CrisisData } from '@/data/vectors';

/** A tappable crisis selector card shown on the Vectors list screen. */
export function CrisisSelectorCard({
  crisis,
  onPress,
}: {
  crisis: CrisisData;
  onPress: () => void;
}) {
  return (
    <GeoCard onPress={onPress} style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={typography.title}>{crisis.title}</Text>
          <Text style={[typography.bodySm, styles.sub]} numberOfLines={1}>
            {crisis.subtitle}
          </Text>
        </View>
        <RiskPill level={crisis.risk} />
      </View>

      <View style={styles.statsRow}>
        <Stat label="Tripwires" value={String(crisis.tripwires)} />
        <Stat label="Aktor" value={String(crisis.actors)} />
        <Stat label="Skenario" value={String(crisis.scenarioCount)} />
      </View>

      <View style={styles.footerRow}>
        <View style={styles.updateRow}>
          <Ionicons name="time-outline" size={13} color={colors.textMuted} />
          <Text style={[typography.caption, styles.update]}>{crisis.lastUpdate}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.accent} />
      </View>
    </GeoCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[typography.headline2, styles.statValue]}>{value}</Text>
      <Text style={typography.label}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleCol: {
    flex: 1,
  },
  sub: {
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    color: colors.textPrimary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    borderTopColor: colors.borderSubtle,
    borderTopWidth: 0.5,
    paddingTop: spacing.sm,
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  update: {
    color: colors.textMuted,
  },
});
