import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GeoCard, SectionHeader } from '@/components';
import { directionGlyph, directionTone, type Asset } from '@/data/pasar';
import { borders, colors, radii, spacing, typography } from '@/theme';

import { MiniSparkline } from './MiniSparkline';

/**
 * One asset-class section (component #6): a section header plus a card of asset
 * rows. Each row's geo-signal badge calls [onOpenDetail] to surface the sheet.
 */
export interface AssetSectionProps {
  title: string;
  actionLabel: string;
  assets: Asset[];
  onOpenDetail: (asset: Asset) => void;
}

export function AssetSection({ title, actionLabel, assets, onOpenDetail }: AssetSectionProps) {
  if (assets.length === 0) return null;
  return (
    <View>
      <SectionHeader title={title} actionLabel={actionLabel} onAction={() => {}} />
      <GeoCard radius={radii.cardSm} padded={false} style={styles.card}>
        {assets.map((asset, i) => (
          <AssetRow
            key={asset.symbol}
            asset={asset}
            showDivider={i < assets.length - 1}
            onOpenDetail={onOpenDetail}
          />
        ))}
      </GeoCard>
    </View>
  );
}

function AssetRow({
  asset,
  showDivider,
  onOpenDetail,
}: {
  asset: Asset;
  showDivider: boolean;
  onOpenDetail: (asset: Asset) => void;
}) {
  const tone = asset.geoSignalTone;
  const dirTone = directionTone[asset.changeDirection];
  return (
    <View style={[styles.row, showDivider && styles.rowDivider]}>
      <View style={[styles.icon, { backgroundColor: asset.iconBg }]}>
        <Text style={[styles.iconText, { color: asset.iconFg, fontSize: asset.iconLabel.length > 3 ? 11 : 13 }]}>
          {asset.iconLabel}
        </Text>
      </View>

      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {asset.name}
        </Text>
        <Text style={[typography.caption, styles.subtitle]} numberOfLines={1}>
          {asset.subtitle}
        </Text>
        <Pressable
          onPress={() => onOpenDetail(asset)}
          hitSlop={6}
          style={[styles.badge, { backgroundColor: tone.bg, borderColor: tone.border }]}
        >
          <Text style={[typography.caption, { color: tone.fg, fontWeight: '500' }]} numberOfLines={1}>
            {asset.geoSignalText}
          </Text>
        </Pressable>
      </View>

      {asset.sparkline.length > 0 && (
        <View style={styles.spark}>
          <MiniSparkline values={asset.sparkline} direction={asset.changeDirection} />
        </View>
      )}

      <View style={styles.priceCol}>
        <Text style={styles.price}>{asset.price}</Text>
        <Text style={[typography.caption, { color: dirTone.fg, fontWeight: '500' }]}>
          {directionGlyph[asset.changeDirection]} {asset.change}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
  },
  rowDivider: {
    borderBottomWidth: borders.hairline,
    borderBottomColor: colors.borderSubtle,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: radii.inner,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontWeight: '500',
  },
  middle: {
    flex: 1,
    marginLeft: spacing.sm + 2,
  },
  name: {
    ...typography.body,
    fontWeight: '500',
  },
  subtitle: {
    marginTop: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.chip,
    borderWidth: borders.hairline,
    maxWidth: '100%',
  },
  spark: {
    marginHorizontal: spacing.sm,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  price: {
    ...typography.body,
    fontWeight: '500',
  },
});
