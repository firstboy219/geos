import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { borders, colors, radii, spacing, typography } from '@/theme';
import type { ScenarioData } from '@/data/vectors';

/** Horizontal scenario selector tabs (A..E) with probability percentages. */
export function ScenarioTabs({
  scenarios,
  selectedKey,
  onSelect,
}: {
  scenarios: ScenarioData[];
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {scenarios.map((s) => {
        const active = s.key === selectedKey;
        return (
          <Pressable
            key={s.key}
            onPress={() => onSelect(s.key)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[typography.titleSm, active ? styles.keyActive : styles.key]}>
              {s.key}
            </Text>
            <Text style={[typography.caption, active ? styles.pctActive : styles.pct]}>
              {Math.round(s.probability * 100)}%
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tab: {
    alignItems: 'center',
    minWidth: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.inner,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabActive: {
    backgroundColor: colors.accentDark,
    borderColor: colors.accentBorder,
  },
  key: {
    color: colors.textSecondary,
  },
  keyActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  pct: {
    color: colors.textMuted,
    marginTop: 2,
  },
  pctActive: {
    color: colors.accent,
    marginTop: 2,
  },
});
