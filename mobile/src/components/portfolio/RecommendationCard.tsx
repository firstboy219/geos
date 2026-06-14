import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GeoCard, tones } from '@/components';
import type { RebalanceRecommendation } from '@/data/portfolio';
import { radii, spacing, typography } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const ACTION: Record<
  RebalanceRecommendation['action'],
  { icon: IoniconName; tone: (typeof tones)[keyof typeof tones] }
> = {
  reduce: { icon: 'trending-down-outline', tone: tones.negative },
  increase: { icon: 'trending-up-outline', tone: tones.positive },
  hedge: { icon: 'shield-outline', tone: tones.warning },
  hold: { icon: 'remove-outline', tone: tones.accent },
};

/** A single rebalancing recommendation row with an action-coded icon. */
export function RecommendationCard({ reco }: { reco: RebalanceRecommendation }) {
  const a = ACTION[reco.action];
  return (
    <GeoCard padded={false} style={styles.card}>
      <View style={styles.row}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: a.tone.bg, borderColor: a.tone.border },
          ]}
        >
          <Ionicons name={a.icon} size={16} color={a.tone.fg} />
        </View>
        <View style={styles.body}>
          <Text style={[typography.titleSm, styles.title]}>{reco.title}</Text>
          <Text style={[typography.caption, styles.detail]}>{reco.detail}</Text>
        </View>
      </View>
    </GeoCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: radii.inner,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
  detail: {
    lineHeight: 16,
  },
});
