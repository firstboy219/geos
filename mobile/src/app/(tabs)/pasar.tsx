import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SkeletonList, type SignalTone } from '@/components';
import {
  AssetGeoSignalSheet,
  AssetSection,
  CategoryTabs,
  FilterChips,
  GeoHeatmap,
  GeoRiskBanner,
  PortfolioSummary,
  ScenarioMatrix,
} from '@/components/pasar';
import {
  ASSETS,
  CATEGORY_ORDER,
  CATEGORY_TABS,
  SECTION_META,
  pasarTones,
  type Asset,
  type AssetCategory,
  type PriceDirection,
} from '@/data/pasar';
import { type PasarAssetDto } from '@/models/api';
import { usePasar } from '@/state';
import { colors, spacing } from '@/theme';

/**
 * Pasar (Market) screen — geopolitical market overlay. Mirrors
 * `Knowledge Base/Mockup_mobile/pasar_screen.html` and the Flutter archive.
 *
 * Overview blocks (risk banner, portfolio, scenario matrix, heatmap) render only
 * on the "Semua" tab; filtered category tabs stay focused on their asset list.
 * On mount we fetch `/pasar/assets`; live rows are merged over the dummy data
 * (live price / change / geo-signal win, dummy fills presentation extras).
 */

/** A row-level filter applied on top of the active category. */
interface AssetFilter {
  label: string;
  matches: (a: Asset) => boolean;
}

const FILTERS: AssetFilter[] = [
  { label: 'Semua aset', matches: () => true },
  { label: '↑ Potensi naik', matches: (a) => a.changeDirection === 'up' },
  { label: '↓ Potensi turun', matches: (a) => a.changeDirection === 'down' },
  { label: '⚡ Dipengaruhi Natuna', matches: (a) => a.affectedByNatuna },
  { label: '⚛ Dipengaruhi Taiwan', matches: (a) => a.affectedByTaiwan },
];

const FILTER_LABELS = FILTERS.map((f) => f.label);

/** Maps a signed change percent onto a price direction. */
function directionFromChange(changePercent: number): PriceDirection {
  if (changePercent > 0) return 'up';
  if (changePercent < 0) return 'down';
  return 'neutral';
}

/** Maps the API `geo_signal_type` string onto a presentation tone. */
function toneFromSignalType(type: string): SignalTone | null {
  switch (type.toLowerCase()) {
    case 'positive':
    case 'up':
      return pasarTones.positive;
    case 'negative':
    case 'down':
      return pasarTones.negative;
    case 'warning':
    case 'watch':
      return pasarTones.warning;
    case 'neutral':
      return pasarTones.neutral;
    case 'info':
      return pasarTones.info;
    case 'special':
      return pasarTones.special;
    default:
      return null;
  }
}

/** Live API row wins; dummy fills the presentation-only fields. */
function mergeAsset(dummy: Asset, live: PasarAssetDto): Asset {
  const direction = directionFromChange(live.changePercent);
  const liveTone = toneFromSignalType(live.geoSignalType);
  const sign = live.changePercent > 0 ? '+' : '';
  return {
    ...dummy,
    name: live.name || dummy.name,
    price: live.price > 0 ? String(live.price) : dummy.price,
    change: Number.isFinite(live.changePercent)
      ? `${sign}${live.changePercent}%`
      : dummy.change,
    changeDirection: direction,
    geoSignalText: live.geoSignalText || dummy.geoSignalText,
    geoSignalDetail: live.geoSignalDetail || dummy.geoSignalDetail,
    geoSignalTone: liveTone ?? dummy.geoSignalTone,
  };
}

/** Merges fetched rows over the dummy catalogue (matched by symbol). */
function mergeAssets(live: PasarAssetDto[]): Asset[] {
  if (live.length === 0) return ASSETS;
  const bySymbol = new Map(live.map((a) => [a.symbol.toUpperCase(), a]));
  return ASSETS.map((dummy) => {
    const match = bySymbol.get(dummy.symbol.toUpperCase());
    return match ? mergeAsset(dummy, match) : dummy;
  });
}

export default function PasarScreen() {
  const insets = useSafeAreaInsets();
  const { data, loading, fetch } = usePasar();

  const [categoryIndex, setCategoryIndex] = useState(0);
  const [filterIndex, setFilterIndex] = useState(0);
  const [sheetAsset, setSheetAsset] = useState<Asset | null>(null);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const assets = useMemo(() => mergeAssets(data), [data]);

  // 0 = "Semua"; 1..n map onto CATEGORY_ORDER.
  const selectedCategory: AssetCategory | null =
    categoryIndex === 0 ? null : CATEGORY_ORDER[categoryIndex - 1];
  const showOverview = selectedCategory == null;
  const selectedFilter = FILTERS[filterIndex];

  const visibleCategories: AssetCategory[] = showOverview
    ? CATEGORY_ORDER
    : [selectedCategory];

  const assetsFor = (category: AssetCategory): Asset[] =>
    assets.filter((a) => a.category === category && selectedFilter.matches(a));

  const showSkeleton = loading && data.length === 0;

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <CategoryTabs
          tabs={CATEGORY_TABS}
          selectedIndex={categoryIndex}
          onSelect={setCategoryIndex}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        {showSkeleton ? (
          <SkeletonList count={5} />
        ) : (
          <>
            {showOverview && (
              <>
                <View style={styles.block}>
                  <GeoRiskBanner />
                </View>
                <View style={styles.block}>
                  <PortfolioSummary />
                </View>
                <View style={styles.block}>
                  <ScenarioMatrix />
                </View>
              </>
            )}

            <View style={styles.filters}>
              <FilterChips
                filters={FILTER_LABELS}
                selectedIndex={filterIndex}
                onSelect={setFilterIndex}
              />
            </View>

            {visibleCategories.map((category) => (
              <View key={category} style={styles.section}>
                <AssetSection
                  title={SECTION_META[category].title}
                  actionLabel={SECTION_META[category].action}
                  assets={assetsFor(category)}
                  onOpenDetail={setSheetAsset}
                />
              </View>
            ))}

            {showOverview && (
              <View style={styles.block}>
                <GeoHeatmap />
              </View>
            )}
          </>
        )}
      </ScrollView>

      <AssetGeoSignalSheet
        asset={sheetAsset}
        visible={sheetAsset != null}
        onClose={() => setSheetAsset(null)}
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
    paddingHorizontal: spacing.md + 2,
    paddingTop: spacing.md,
  },
  block: {
    marginBottom: spacing.sm + 2,
  },
  filters: {
    marginBottom: spacing.sm,
  },
  section: {
    marginBottom: spacing.xs,
  },
});
