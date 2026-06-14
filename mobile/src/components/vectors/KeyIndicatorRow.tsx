import { StyleSheet, Text, View } from 'react-native';

import { tones } from '@/components';
import { colors, spacing, typography } from '@/theme';
import type { KeyIndicator } from '@/data/vectors';

/** A single key-indicator line: a coloured dot + label + detail. */
export function KeyIndicatorRow({ indicator }: { indicator: KeyIndicator }) {
  const tone = tones[indicator.tone];
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: tone.fg }]} />
      <Text style={[typography.bodySm, styles.label]} numberOfLines={1}>
        {indicator.label}
      </Text>
      <Text style={[typography.bodySm, { color: tone.fg }]}>{indicator.detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 0.5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  label: {
    flex: 1,
    color: colors.textPrimary,
  },
});
