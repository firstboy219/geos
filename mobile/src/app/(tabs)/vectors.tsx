import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SectionHeader } from '@/components';
import { CrisisSelectorCard } from '@/components/vectors/CrisisSelectorCard';
import { CRISES } from '@/data/vectors';
import { colors, spacing, typography } from '@/theme';

export default function VectorListScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxxl },
        ]}
      >
        <Text style={typography.headline2}>Impact Vectors</Text>
        <Text style={[typography.bodySm, styles.subtitle]}>
          Pilih krisis untuk menelaah skenario eskalasi dan dampaknya pada aset.
        </Text>

        <SectionHeader title="Krisis Aktif" subtitle={`${CRISES.length} krisis terpantau`} />
        {CRISES.map((c) => (
          <CrisisSelectorCard
            key={c.id}
            crisis={c}
            onPress={() => router.push(`/vectors/${c.id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
});
