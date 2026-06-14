import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

/**
 * Minimal dark placeholder used by Wave-1 stub screens. Wave-2 agents replace
 * each screen body with the real UI.
 */
export function PlaceholderScreen({
  name,
  detail,
}: {
  name: string;
  detail?: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>
      {detail != null && <Text style={styles.detail}>{detail}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  title: {
    ...typography.headline2,
  },
  detail: {
    ...typography.bodySm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
