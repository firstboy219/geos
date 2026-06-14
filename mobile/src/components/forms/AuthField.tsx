import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { borders, colors, radii, spacing, typography } from '@/theme';

/**
 * Themed text field used by the auth screens. Optional leading icon and a
 * password visibility toggle.
 */
export interface AuthFieldProps extends Omit<TextInputProps, 'style'> {
  icon?: keyof typeof Ionicons.glyphMap;
  /** When true, renders as an obscured password field with a reveal toggle. */
  password?: boolean;
}

export function AuthField({ icon, password = false, ...props }: AuthFieldProps) {
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.wrapper}>
      {icon != null && (
        <Ionicons
          name={icon}
          size={18}
          color={colors.textMuted}
          style={styles.icon}
        />
      )}
      <TextInput
        {...props}
        secureTextEntry={password && hidden}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      {password && (
        <Pressable onPress={() => setHidden((v) => !v)} hitSlop={8}>
          <Ionicons
            name={hidden ? 'eye-outline' : 'eye-off-outline'}
            size={18}
            color={colors.textMuted}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: borders.hairline,
    borderRadius: radii.inner,
    paddingHorizontal: spacing.md,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    ...typography.body,
  },
});
