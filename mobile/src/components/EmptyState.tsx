import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { borders, colors, radii, spacing, typography } from '@/theme';

/**
 * Empty-state placeholder (BAB 7.3 — illustration + description + optional
 * action button). Uses an icon as the "illustration" by default.
 */
export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'Nothing here yet',
  message,
  icon = 'file-tray-outline',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={44} color={colors.textMuted} />
      <Text style={[typography.title, styles.title]}>{title}</Text>
      {message != null && (
        <Text style={[typography.bodySm, styles.message]}>{message}</Text>
      )}
      {actionLabel != null && onAction != null && (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={[typography.titleSm, styles.buttonText]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  title: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  message: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.xl,
    backgroundColor: colors.accentDark,
    borderColor: colors.accentBorder,
    borderWidth: borders.hairline,
    borderRadius: radii.inner,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: {
    color: colors.accent,
  },
  pressed: {
    opacity: 0.8,
  },
});
