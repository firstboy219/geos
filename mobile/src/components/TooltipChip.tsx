import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { borders, colors, padding, radii, spacing, typography } from '@/theme';

import { ToneChip, type SignalTone } from './ToneChip';

/**
 * A tappable chip that reveals an explanatory tooltip on tap (mobile-friendly).
 *
 * Ported from the Flutter `TooltipChip`. Used for scenario tags and actor score
 * chips that each carry a long description. The tooltip is shown in a centered
 * modal that dismisses on outside tap.
 */
export interface TooltipChipProps {
  label: string;
  tooltip: string;
  tone: SignalTone;
}

export function TooltipChip({ label, tooltip, tone }: TooltipChipProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable onPress={() => setOpen(true)}>
        <ToneChip label={label} tone={tone} />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.tooltip}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.body}>{tooltip}</Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  tooltip: {
    maxWidth: 320,
    backgroundColor: colors.tooltipBg,
    borderColor: colors.border,
    borderWidth: borders.hairline,
    borderRadius: radii.chip,
    padding: padding.inner,
  },
  label: {
    ...typography.titleSm,
    marginBottom: spacing.xs,
  },
  body: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 17,
  },
});
