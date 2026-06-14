import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, SectionHeader, SkeletonList } from '@/components';
import {
  AddAssetModal,
  PortfolioAssetRow,
  PortfolioSummaryCard,
  type NewAsset,
} from '@/components/portfolio';
import { FALLBACK_PORTFOLIO } from '@/data/portfolio';
import { portfolioAssetValue, type PortfolioAssetDto } from '@/models/api';
import { usePortfolio } from '@/state';
import { borders, colors, radii, spacing, typography } from '@/theme';

export default function PortfolioScreen() {
  const insets = useSafeAreaInsets();
  const { data: live, loading, fetch } = usePortfolio();

  // Local-only mutations layered over the live/fallback list (the live resource
  // is read-only). Locally added assets + a set of locally removed ids.
  const [localAdded, setLocalAdded] = useState<PortfolioAssetDto[]>([]);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const base = live.length > 0 ? live : FALLBACK_PORTFOLIO;

  const assets = useMemo(
    () => [...base, ...localAdded].filter((a) => !removedIds.has(a.id)),
    [base, localAdded, removedIds],
  );

  const total = useMemo(
    () => assets.reduce((sum, a) => sum + portfolioAssetValue(a), 0),
    [assets],
  );

  const handleAdd = (n: NewAsset) => {
    setLocalAdded((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        assetType: n.assetType,
        assetName: n.assetName,
        ticker: n.ticker,
        quantity: n.quantity,
        purchasePrice: n.purchasePrice,
        currentPrice: n.purchasePrice,
        currency: 'IDR',
      },
    ]);
  };

  const handleDelete = (id: string) => {
    setLocalAdded((prev) => prev.filter((a) => a.id !== id));
    setRemovedIds((prev) => new Set(prev).add(id));
  };

  const showLoading = loading && live.length === 0 && assets.length === 0;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 96 },
        ]}
      >
        <Text style={typography.headline2}>Portofolio</Text>
        <Text style={[typography.bodySm, styles.subtitle]}>
          Pantau nilai aset dan eksposur risiko geopolitiknya.
        </Text>

        <View style={styles.gap}>
          <PortfolioSummaryCard total={total} assetCount={assets.length} />
        </View>

        <SectionHeader
          title="Aset Anda"
          subtitle="Geser kiri atau tahan untuk menghapus"
        />

        {showLoading ? (
          <SkeletonList count={4} cardHeight={64} />
        ) : assets.length === 0 ? (
          <EmptyState
            icon="wallet-outline"
            title="Belum ada aset"
            message="Tambahkan aset untuk melihat dampak geopolitiknya."
            actionLabel="Tambah Aset"
            onAction={() => setAddOpen(true)}
          />
        ) : (
          assets.map((a) => (
            <PortfolioAssetRow
              key={a.id}
              asset={a}
              onDelete={() => handleDelete(a.id)}
            />
          ))
        )}

        <Pressable
          onPress={() => router.push('/portfolio/impact')}
          style={({ pressed }) => [styles.rebalanceBtn, pressed && styles.pressed]}
        >
          <Ionicons name="analytics-outline" size={16} color={colors.accent} />
          <Text style={[typography.titleSm, styles.rebalanceText]}>
            Generate rekomendasi rebalancing
          </Text>
        </Pressable>
      </ScrollView>

      <Pressable
        onPress={() => setAddOpen(true)}
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + spacing.lg },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="add" size={28} color={colors.textPrimary} />
      </Pressable>

      <AddAssetModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />
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
  },
  gap: {
    marginTop: spacing.md,
  },
  rebalanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.accentDark,
    borderColor: colors.accentBorder,
    borderWidth: borders.hairline,
    borderRadius: radii.inner,
  },
  rebalanceText: {
    color: colors.accent,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  pressed: {
    opacity: 0.85,
  },
});
