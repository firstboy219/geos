import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingSkeleton, SectionHeader, SkeletonList } from '@/components';
import {
  AlertsList,
  CrisisCard,
  FeedTab,
  FrameworkStrip,
  PeriodSelector,
  PortfolioNudge,
  ProtectionCta,
  ShockBanner,
  TdiBanner,
  TopBar,
  WorldStatusHero,
  periodLabel,
  type AnalysisPeriod,
} from '@/components/home';
import {
  DUMMY_ALERTS,
  DUMMY_CRISES,
  alertFromLive,
  crisisFromLive,
  type AlertItem,
  type CrisisModel,
} from '@/data/home';
import { useAlerts, useCrises } from '@/state';
import { radii } from '@/theme';

type HomeTab = 'analysis' | 'feed';

/**
 * Geoscan Home screen — the Analysis (Analisis) + News/Feed (Berita & Umpan)
 * sub-tabs (BAB 7). On mount it fetches live crises + alerts and renders them
 * where the fields map, falling back to the rich dummy content otherwise.
 */
export default function HomeScreen() {
  const crises = useCrises();
  const alerts = useAlerts();

  const [tab, setTab] = useState<HomeTab>('analysis');
  const [period, setPeriod] = useState<AnalysisPeriod>('d90');
  const [lang, setLang] = useState<'EN' | 'ID'>('EN');

  useEffect(() => {
    void crises.fetch();
    void alerts.fetch();
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render live crises where mappable, else the dummy template content.
  const crisisModels = useMemo<CrisisModel[]>(() => {
    if (crises.data.length === 0) return DUMMY_CRISES;
    return crises.data.map((c, i) => crisisFromLive(c, i));
  }, [crises.data]);

  const alertItems = useMemo<AlertItem[]>(() => {
    if (alerts.data.length === 0) return DUMMY_ALERTS;
    return alerts.data.map(alertFromLive);
  }, [alerts.data]);

  const crisesLoading = crises.loading && crises.data.length === 0;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <TopBar
        lang={lang}
        onToggleLang={() => setLang((l) => (l === 'EN' ? 'ID' : 'EN'))}
        hasUnread
      />

      <SubTabBar tab={tab} onSelect={setTab} />

      {tab === 'analysis' ? (
        crisesLoading ? (
          <AnalysisSkeleton />
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 14,
              paddingBottom: 24,
            }}
            showsVerticalScrollIndicator={false}
          >
            <PeriodSelector value={period} onChange={setPeriod} />
            <View className="h-[10px]" />
            <ShockBanner />
            <View className="h-2" />
            <TdiBanner />
            <View className="h-[10px]" />
            <WorldStatusHero />
            <View className="h-[10px]" />
            <FrameworkStrip periodLabel={periodLabel(period)} />
            <View className="h-[10px]" />
            <ProtectionCta />
            <View className="h-[10px]" />

            <SectionHeader
              title="Situasi yang perlu Anda ketahui"
              actionLabel="Lihat semua"
              onAction={() => {}}
            />
            <View className="h-1" />
            {crisisModels.map((c) => (
              <CrisisCard key={c.id} crisis={c} />
            ))}

            <View className="h-1" />
            <PortfolioNudge />
            <View className="h-[10px]" />

            <SectionHeader
              title="Peringatan terbaru"
              actionLabel="Lihat semua"
              onAction={() => {}}
            />
            <View className="h-1" />
            <AlertsList alerts={alertItems} />
          </ScrollView>
        )
      ) : (
        <FeedTab />
      )}
    </SafeAreaView>
  );
}

function SubTabBar({
  tab,
  onSelect,
}: {
  tab: HomeTab;
  onSelect: (t: HomeTab) => void;
}) {
  const items: { key: HomeTab; label: string }[] = [
    { key: 'analysis', label: 'Analisis' },
    { key: 'feed', label: 'Berita & Umpan' },
  ];
  return (
    <View className="flex-row border-b-[0.5px] border-borderSubtle">
      {items.map((item) => {
        const active = item.key === tab;
        return (
          <Pressable
            key={item.key}
            onPress={() => onSelect(item.key)}
            className={`flex-1 items-center border-b-2 py-3 ${
              active ? 'border-accent' : 'border-transparent'
            }`}
          >
            <Text
              className={`text-[12px] ${
                active ? 'font-medium text-accent' : 'text-textSecondary'
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Shimmer skeleton shown while the initial crises load runs. */
function AnalysisSkeleton() {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
      <LoadingSkeleton height={64} radius={radii.cardSm} />
      <View className="h-3" />
      <LoadingSkeleton height={72} radius={radii.inner} />
      <View className="h-3" />
      <LoadingSkeleton height={150} radius={radii.card} />
      <View className="h-3" />
      <SkeletonList count={3} cardHeight={160} />
    </View>
  );
}
