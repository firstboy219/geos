import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { borders, colors, spacing, typography } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * A single account menu row. Renders a leading icon, a label, and either a
 * custom `trailing` node (e.g. a Switch or value text) or a chevron.
 */
export function MenuTile({
  icon,
  label,
  trailing,
  onPress,
  color,
  divider = true,
}: {
  icon: IoniconName;
  label: string;
  trailing?: ReactNode;
  onPress?: () => void;
  color?: string;
  divider?: boolean;
}) {
  const fg = color ?? colors.textPrimary;
  const iconColor = color ?? colors.textSecondary;

  const content = (
    <View style={[styles.row, divider && styles.divider]}>
      <Ionicons name={icon} size={20} color={iconColor} style={styles.icon} />
      <Text style={[typography.body, styles.label, { color: fg }]}>{label}</Text>
      {trailing ?? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      )}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  divider: {
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: borders.hairline,
  },
  icon: {
    width: 28,
  },
  label: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
