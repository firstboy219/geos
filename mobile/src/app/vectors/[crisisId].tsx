import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, SectionHeader } from '@/components';
import { AssetImpactRow } from '@/components/vectors/AssetImpactRow';
import { CrisisSummaryCard } from '@/components/vectors/CrisisSummaryCard';
import { ScenarioDetailCard } from '@/components/vectors/ScenarioDetailCard';
import { ScenarioTabs } from '@/components/vectors/ScenarioTabs';
import { getCrisis } from '@/data/vectors';
import { borders, colors, radii, spacing, typography } from '@/theme';

export default function VectorDetailScreen() {
  const { crisisId } = useLocalSearchParams<{ crisisId: string }>();
  const crisis = getCrisis(crisisId);

  const [selectedKey, setSelectedKey] = useState(crisis?.scenarios[0]?.key ?? 'A');
  const insets = useSafeAreaInsets();

  if (!crisis) {
    return (
      <>
        <Stack.Screen options={{ title: 'Vector' }} />
        <EmptyState
          icon="alert-circle-outline"
          title="Krisis tidak ditemukan"
          message={`Tidak ada data untuk "${crisisId ?? '—'}".`}
        />
      </>
    );
  }

  const scenario =
    crisis.scenarios.find((s) => s.key === selectedKey) ?? crisis.scenarios[0];

  return (
    <>
      <Stack.Screen options={{ title: crisis.title }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
      >
        <CrisisSummaryCard crisis={crisis} />

        <SectionHeader
          title="Skenario"
          subtitle={`${crisis.scenarios.length} skenario · pilih untuk detail`}
        />
        <ScenarioTabs
          scenarios={crisis.scenarios}
          selectedKey={scenario.key}
          onSelect={setSelectedKey}
        />

        <View style={styles.gap}>
          <ScenarioDetailCard scenario={scenario} />
        </View>

        <SectionHeader
          title="Dampak Aset"
          subtitle="Estimasi pergerakan pada skenario eskalasi"
        />
        <View style={styles.assetList}>
          {crisis.assetImpacts.map((a) => (
            <AssetImpactRow key={a.ticker} asset={a} />
          ))}
        </View>

        <Pressable
          onPress={() =>
            Alert.alert(
              'Laporan lengkap',
              `Laporan dampak penuh untuk "${crisis.title}" akan segera tersedia.`,
            )
          }
          style={({ pressed }) => [styles.reportBtn, pressed && styles.pressed]}
        >
          <Ionicons name="document-text-outline" size={16} color={colors.accent} />
          <Text style={[typography.titleSm, styles.reportText]}>
            Generate laporan lengkap
          </Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  gap: {
    marginTop: spacing.sm,
  },
  assetList: {
    marginTop: spacing.xs,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.accentDark,
    borderColor: colors.accentBorder,
    borderWidth: borders.hairline,
    borderRadius: radii.inner,
  },
  reportText: {
    color: colors.accent,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
