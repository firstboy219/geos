import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { borders, colors, padding, radii, spacing, typography } from '@/theme';
import { tones } from '@/components';
import type { AssetImpactData, ImpactDirection } from '@/data/vectors';

const DIRECTION = {
  up: { icon: 'arrow-up' as const, tone: tones.positive },
  down: { icon: 'arrow-down' as const, tone: tones.negative },
  flat: { icon: 'remove' as const, tone: tones.neutral },
};

function dirStyle(d: ImpactDirection) {
  return DIRECTION[d];
}

/** One asset-impact row with a directional badge; tap → modal detail. */
export function AssetImpactRow({ asset }: { asset: AssetImpactData }) {
  const [open, setOpen] = useState(false);
  const d = dirStyle(asset.direction);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={styles.info}>
          <Text style={typography.titleSm}>{asset.ticker}</Text>
          <Text style={[typography.caption, styles.name]} numberOfLines={1}>
            {asset.name}
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: d.tone.bg, borderColor: d.tone.border },
          ]}
        >
          <Ionicons name={d.icon} size={13} color={d.tone.fg} />
          <Text style={[typography.bodySm, { color: d.tone.fg, fontWeight: '600' }]}>
            {asset.magnitude}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={typography.title}>{asset.ticker}</Text>
                <Text style={[typography.bodySm, styles.name]}>{asset.name}</Text>
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: d.tone.bg, borderColor: d.tone.border },
                ]}
              >
                <Ionicons name={d.icon} size={14} color={d.tone.fg} />
                <Text style={[typography.titleSm, { color: d.tone.fg }]}>
                  {asset.magnitude}
                </Text>
              </View>
            </View>
            <Text style={[typography.label, styles.sectionLabel]}>RASIONAL DAMPAK</Text>
            <Text style={styles.rationale}>{asset.rationale}</Text>
            <Pressable style={styles.close} onPress={() => setOpen(false)}>
              <Text style={[typography.titleSm, styles.closeText]}>Tutup</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
  info: {
    flex: 1,
  },
  name: {
    marginTop: 2,
    color: colors.textSecondary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.chip,
    borderWidth: borders.hairline,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: borders.hairline,
    borderRadius: radii.card,
    padding: padding.card,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  rationale: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 19,
  },
  close: {
    marginTop: spacing.lg,
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accentDark,
    borderColor: colors.accentBorder,
    borderWidth: borders.hairline,
    borderRadius: radii.inner,
  },
  closeText: {
    color: colors.accent,
  },
});
