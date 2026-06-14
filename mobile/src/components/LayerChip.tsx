import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { borders, colors, padding, radii, spacing, typography } from '@/theme';

/**
 * A small square chip representing one of the 16 Geoscan AI layers
 * (e.g. `A·Redline`, `K·CSI`, `M·+12%`), with a tap-to-reveal tooltip
 * explaining the layer (BAB 7.3).
 *
 * Ported from the Flutter `LayerChip`. The tooltip surfaces in a centered modal
 * that dismisses on outside tap (RN has no built-in Tooltip widget).
 */
export interface LayerChipProps {
  /** Short layer code, e.g. `A`, `K`, `O`, `M`. */
  code: string;
  /** Human label, e.g. `Redline`, `CSI`, `+12%`. */
  label: string;
  /** Optional explanatory text shown on tap. */
  tooltip?: string;
  /** Accent color for the code badge. */
  color?: string;
  onPress?: () => void;
}

export function LayerChip({
  code,
  label,
  tooltip,
  color = colors.accent,
  onPress,
}: LayerChipProps) {
  const [open, setOpen] = useState(false);
  const hasTooltip = tooltip != null && tooltip.length > 0;

  const handlePress = () => {
    if (hasTooltip) setOpen(true);
    onPress?.();
  };

  const chip = (
    <View style={styles.chip}>
      <Text style={[typography.caption, styles.code, { color }]}>{code}</Text>
      <Text style={[typography.caption, styles.label]}>{label}</Text>
    </View>
  );

  return (
    <>
      {hasTooltip || onPress ? (
        <Pressable onPress={handlePress} style={({ pressed }) => pressed && styles.pressed}>
          {chip}
        </Pressable>
      ) : (
        chip
      )}
      {hasTooltip && (
        <Modal
          visible={open}
          transparent
          animationType="fade"
          onRequestClose={() => setOpen(false)}
        >
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
            <View style={styles.tooltip}>
              <Text style={[typography.titleSm, styles.tooltipTitle]}>
                {code} · {label}
              </Text>
              <Text style={styles.tooltipBody}>{tooltip}</Text>
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: borders.hairline,
    borderRadius: radii.chip,
  },
  code: {
    fontWeight: '600',
  },
  label: {
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  tooltip: {
    maxWidth: 320,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: borders.hairline,
    borderRadius: radii.inner,
    padding: padding.inner,
  },
  tooltipTitle: {
    marginBottom: spacing.xs,
  },
  tooltipBody: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 17,
  },
});
