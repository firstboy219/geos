import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { GeoCard } from '@/components';
import { assetTypeLabel, formatIdr } from '@/data/portfolio';
import { portfolioAssetValue, type PortfolioAssetDto } from '@/models/api';
import { borders, colors, radii, spacing, typography } from '@/theme';

import { assetVisual } from './assetVisuals';

/** Percent change between current and purchase price. */
function changePct(a: PortfolioAssetDto): number {
  if (a.purchasePrice <= 0) return 0;
  const cur = a.currentPrice > 0 ? a.currentPrice : a.purchasePrice;
  return ((cur - a.purchasePrice) / a.purchasePrice) * 100;
}

/**
 * One portfolio asset row. Swipe left to reveal a delete action; long-press also
 * triggers delete (fallback for environments without swipe).
 */
export function PortfolioAssetRow({
  asset,
  onDelete,
}: {
  asset: PortfolioAssetDto;
  onDelete: () => void;
}) {
  const v = assetVisual(asset.assetType);
  const value = portfolioAssetValue(asset);
  const pct = changePct(asset);
  const trendColor = pct > 0 ? colors.success : pct < 0 ? colors.danger : colors.textMuted;
  const arrow = pct > 0 ? '▲' : pct < 0 ? '▼' : '–';

  const renderRightActions = () => (
    <Pressable onPress={onDelete} style={styles.deleteAction}>
      <Ionicons name="trash-outline" size={20} color={colors.danger} />
    </Pressable>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <Pressable onLongPress={onDelete} delayLongPress={400}>
        <GeoCard padded={false} style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: v.color + '26' }]}>
              <Ionicons name={v.icon} size={18} color={v.color} />
            </View>
            <View style={styles.info}>
              <Text style={[typography.titleSm, styles.name]} numberOfLines={1}>
                {asset.assetName || asset.ticker}
              </Text>
              <Text style={typography.caption} numberOfLines={1}>
                {assetTypeLabel(asset.assetType)} · {asset.ticker}
              </Text>
            </View>
            <View style={styles.valueCol}>
              <Text style={[typography.titleSm, styles.value]} numberOfLines={1}>
                {formatIdr(value)}
              </Text>
              <Text style={[typography.caption, { color: trendColor }]}>
                {arrow} {pct >= 0 ? '+' : ''}
                {pct.toFixed(1)}%
              </Text>
            </View>
          </View>
        </GeoCard>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.inner,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    marginBottom: 1,
  },
  valueCol: {
    alignItems: 'flex-end',
  },
  value: {
    marginBottom: 1,
  },
  deleteAction: {
    width: 64,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerDark,
    borderColor: colors.dangerBorder,
    borderWidth: borders.hairline,
    borderRadius: radii.cardSm,
  },
});
