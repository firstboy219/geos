import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { borders, colors, radii, spacing, typography } from '@/theme';

/**
 * Compact pill / square chip used for filters, tags and status labels (BAB 7.3).
 *
 * pill radius 20, square radius 8, 0.5dp border. Use `selected` for the active
 * filter state (accent fill). Provide `leading` for a small icon, `onPress` to
 * make it interactive.
 */
export interface GeoChipProps {
  label: string;
  selected?: boolean;
  square?: boolean;
  dense?: boolean;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  leading?: ReactNode;
  onPress?: () => void;
}

export function GeoChip({
  label,
  selected = false,
  square = false,
  dense = false,
  color,
  backgroundColor,
  borderColor,
  leading,
  onPress,
}: GeoChipProps) {
  const fg = color ?? (selected ? colors.accent : colors.textSecondary);
  const bg = backgroundColor ?? (selected ? colors.accentDark : colors.surface);
  const bc = borderColor ?? (selected ? colors.accentBorder : colors.border);

  const content = (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: bg,
          borderColor: bc,
          borderRadius: square ? radii.chip : radii.pill,
          paddingHorizontal: dense ? spacing.sm : spacing.md,
          paddingVertical: dense ? spacing.xs : spacing.sm,
        },
      ]}
    >
      {leading != null && <View style={styles.leading}>{leading}</View>}
      <Text
        style={[
          typography.bodySm,
          { color: fg, fontWeight: selected ? '500' : '400' },
        ]}
      >
        {label}
      </Text>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: borders.hairline,
  },
  leading: {
    marginRight: spacing.xs,
  },
  pressed: {
    opacity: 0.8,
  },
});
