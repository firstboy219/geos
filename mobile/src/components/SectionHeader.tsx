import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

/**
 * A section title with an optional "see all" / action affordance on the right
 * (BAB 7.3).
 */
export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.titleCol}>
        <Text style={typography.title}>{title}</Text>
        {subtitle != null && (
          <Text style={[typography.bodySm, styles.subtitle]}>{subtitle}</Text>
        )}
      </View>
      {actionLabel != null && onAction != null && (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          hitSlop={8}
        >
          <Text style={[typography.bodySm, styles.actionText]}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  titleCol: {
    flex: 1,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  actionText: {
    color: colors.accent,
  },
  pressed: {
    opacity: 0.7,
  },
});
