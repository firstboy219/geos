import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ToneChip } from '@/components';
import { type Asset } from '@/data/pasar';
import { borders, colors, radii, spacing, typography } from '@/theme';

/**
 * Bottom sheet shown when a row's geo-signal badge is tapped — full explanation
 * of the geopolitical impact on that asset. Implemented as a slide-up Modal.
 */
export interface AssetGeoSignalSheetProps {
  asset: Asset | null;
  visible: boolean;
  onClose: () => void;
}

export function AssetGeoSignalSheet({ asset, visible, onClose }: AssetGeoSignalSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible && asset != null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {asset != null && (
          <Pressable
            style={[styles.sheet, { paddingBottom: spacing.xl + insets.bottom }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.grabber} />

            <View style={styles.headerRow}>
              <View style={[styles.icon, { backgroundColor: asset.iconBg }]}>
                <Text style={[styles.iconText, { color: asset.iconFg, fontSize: asset.iconLabel.length > 3 ? 11 : 13 }]}>
                  {asset.iconLabel}
                </Text>
              </View>
              <View style={styles.headerText}>
                <Text style={typography.title}>{asset.name}</Text>
                <Text style={[typography.bodySm, styles.subtitle]}>{asset.subtitle}</Text>
              </View>
              <Text style={styles.price}>{asset.price}</Text>
            </View>

            <View style={styles.toneRow}>
              <ToneChip label={asset.geoSignalText} tone={asset.geoSignalTone} />
            </View>

            <Text style={styles.detail}>{asset.geoSignalDetail}</Text>
          </Pressable>
        )}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopWidth: borders.hairline,
    borderTopColor: colors.border,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: radii.inner,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontWeight: '500',
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  subtitle: {
    marginTop: 1,
  },
  price: {
    ...typography.title,
    fontWeight: '500',
  },
  toneRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  detail: {
    ...typography.body,
    color: '#C9D1D9',
    lineHeight: 20,
    marginTop: spacing.md,
  },
});
