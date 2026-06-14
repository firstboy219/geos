import { StyleSheet, Text, View } from 'react-native';

import { ToneChip, tones } from '@/components';
import { colors, radii, spacing, typography } from '@/theme';
import type { ImpactVectorBar as ImpactVectorBarData } from '@/data/vectors';

/** A labelled horizontal progress bar for one impact vector + a tone tag. */
export function ImpactVectorBar({ data }: { data: ImpactVectorBarData }) {
  const tone = tones[data.tone];
  const pct = Math.max(0, Math.min(1, data.value));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={typography.bodySm}>{data.label}</Text>
        <ToneChip label={data.tag} tone={tone} />
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${pct * 100}%`, backgroundColor: tone.fg },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  track: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
  },
});
