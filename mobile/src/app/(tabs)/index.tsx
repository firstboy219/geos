import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { Sym } from "@/components/chronicle/Sym";
import { chronicle } from "@/theme/chronicle";
import {
  BRIEFS,
  CATEGORIES,
  FEATURED,
  LATEST,
  imageFor,
  timeAgo,
  toArticle,
  toLatest,
  type BeritaArticle,
  type DotTone,
  type LatestItem,
  type NewsApiItem,
} from "@/data/beranda";

const DOT_BG: Record<DotTone, string> = {
  emerald: "bg-success-emerald",
  amber: "bg-warning-amber",
  rose: "bg-error-rose",
};

/** Beranda — news & trends feed (mockup_v2/home_page, "Chronicle Intel"). */
export default function BerandaScreen() {
  const [featured, setFeatured] = useState<BeritaArticle>(FEATURED);
  const [briefs, setBriefs] = useState<BeritaArticle[]>(BRIEFS);
  const [latest, setLatest] = useState<LatestItem[]>(LATEST);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiClient.get(endpoints.news, { params: { size: 30 } });
      const items: NewsApiItem[] = res.data?.data ?? res.data ?? [];
      if (items.length > 0) {
        setFeatured({ ...toArticle(items[0]), badge: { label: "Terkini", tone: "rose" } });
        setBriefs(items.slice(1, 3).map(toArticle));
        setLatest(items.slice(3, 9).map(toLatest));
      }
      setLastUpdated(new Date().toISOString());
    } catch {
      // offline / unauthenticated → keep existing content
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      {/* Top app bar */}
      <View className="flex-row items-center justify-between px-5 py-3 bg-canvas border-b border-surface-variant">
        <Sym name="menu" size={24} color={chronicle.onBackground} />
        <Text className="font-ws-bold text-xl text-primary">Beranda</Text>
        <Sym name="search" size={24} color={chronicle.onBackground} />
      </View>

      {/* Last updated + manual refresh */}
      <View className="flex-row items-center justify-between px-5 py-2 bg-surface-container-low border-b border-surface-variant">
        <Text className="font-inter text-[12px] text-on-surface-variant">
          {lastUpdated
            ? `Terakhir diperbarui ${timeAgo(lastUpdated)}`
            : "Memuat berita…"}
        </Text>
        <Pressable
          onPress={onRefresh}
          disabled={refreshing}
          className="flex-row items-center gap-1"
          hitSlop={8}
        >
          <Sym name="refresh" size={16} color={chronicle.primary} />
          <Text className="font-inter-medium text-[12px] text-primary">
            {refreshing ? "Memperbarui…" : "Perbarui"}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 bg-surface-container-low"
        contentContainerClassName="pb-28"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={chronicle.primary}
            colors={[chronicle.primary]}
          />
        }
      >
        {/* Featured breaking news */}
        <FeaturedCard article={featured} />

        {/* Fokus Utama — category chips */}
        <View className="mt-7">
          <Text className="font-ws-semi text-lg text-on-surface px-5 mb-3">
            Fokus Utama
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-5 gap-2"
          >
            {CATEGORIES.map((c, i) => (
              <View
                key={c}
                className={`px-5 py-2.5 rounded-full ${
                  i === 0 ? "bg-primary-container" : "bg-surface-container-lowest"
                }`}
              >
                <Text
                  className={`font-inter-medium text-[13px] ${
                    i === 0 ? "text-on-primary" : "text-on-surface"
                  }`}
                >
                  {c}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Ringkasan Tren — briefs */}
        <View className="mt-7 px-5">
          <Text className="font-ws-semi text-lg text-on-surface mb-3">
            Ringkasan Tren
          </Text>
          <View className="gap-5">
            {briefs.map((b) => (
              <BriefCard key={b.id} article={b} />
            ))}
          </View>
        </View>

        {/* Intelijen Terbaru — latest list */}
        <View className="mt-7 px-5">
          <Text className="font-ws-semi text-lg text-on-surface mb-3">
            Intelijen Terbaru
          </Text>
          <View className="gap-3">
            {latest.map((l) => (
              <View
                key={l.id}
                className="flex-row gap-3 bg-surface-container-lowest rounded-xl p-3"
              >
                <Image
                  source={{ uri: l.image ?? imageFor(l.id) }}
                  className="w-20 h-20 rounded-lg bg-surface-container-high"
                />
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5 mb-1">
                    <View className={`w-2 h-2 rounded-full ${DOT_BG[l.tone]}`} />
                    <Text className="font-inter text-[11px] text-on-surface-variant">
                      {l.source}
                    </Text>
                  </View>
                  <Text
                    className="font-ws-semi text-[15px] text-on-surface leading-snug"
                    numberOfLines={3}
                  >
                    {l.title}
                  </Text>
                  <Text className="font-inter text-[11px] text-on-surface-variant opacity-70 mt-1">
                    {l.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SourceChip({ source }: { source: string }) {
  return (
    <View className="flex-row items-center gap-1.5 bg-surface-container px-2 py-1 rounded-full">
      <View className="w-4 h-4 rounded-sm bg-surface-container-high items-center justify-center">
        <Text className="font-inter-bold text-[9px] text-on-surface-variant">
          {source.slice(0, 1)}
        </Text>
      </View>
      <Text className="font-inter-medium text-[11px] text-on-surface-variant">
        {source}
      </Text>
    </View>
  );
}

function Intisari({ items }: { items: string[] }) {
  return (
    <View>
      <Text className="font-inter text-[11px] tracking-wider text-on-surface-variant mb-2">
        INTISARI
      </Text>
      <View className="gap-2">
        {items.map((t, i) => (
          <View key={i} className="flex-row gap-3">
            <Text className="text-primary-container mt-0.5">•</Text>
            <Text className="flex-1 font-serif text-[15px] text-on-surface-variant leading-relaxed">
              {t}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Kutipan({ quotes }: { quotes: { text: string; cite: string }[] }) {
  return (
    <View className="border-l-4 border-primary-container pl-4 py-1">
      <Text className="font-inter text-[11px] tracking-wider text-on-surface-variant mb-1">
        KUTIPAN
      </Text>
      {quotes.map((q, i) => (
        <View key={i} className={i > 0 ? "mt-3 pt-3 border-t border-outline-variant" : ""}>
          <Text className="font-serif-italic text-[17px] text-on-surface leading-relaxed">
            “{q.text}”
          </Text>
          <Text className="font-inter text-[12px] text-on-surface-variant mt-1.5">
            {q.cite}
          </Text>
        </View>
      ))}
    </View>
  );
}

function FeaturedCard({ article }: { article: BeritaArticle }) {
  return (
    <View className="bg-surface-container-lowest">
      <View className="relative">
        <Image
          source={{ uri: article.image ?? imageFor(article.id) }}
          className="w-full h-60 bg-surface-container-high"
        />
        {article.badge ? (
          <View
            className={`absolute top-4 left-4 px-3 py-1 rounded-full ${DOT_BG[article.badge.tone]}`}
          >
            <Text className="font-inter-semi text-[11px] text-white uppercase tracking-wider">
              {article.badge.label}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="px-5 pt-4">
        <View className="flex-row mb-3">
          <SourceChip source={article.source} />
        </View>
        <Text className="font-ws-bold text-2xl text-on-surface leading-tight mb-2">
          {article.title}
        </Text>
        <Text className="font-serif text-base text-on-surface-variant leading-relaxed mb-4">
          {article.body}
        </Text>

        <Pressable className="flex-row items-center justify-center gap-2 border border-primary-container rounded-full py-2.5 mb-5">
          <Sym name="volume_up" size={18} color={chronicle.primaryContainer} />
          <Text className="font-inter-semi text-[13px] text-primary-container">
            Dengarkan Ringkasan
          </Text>
        </Pressable>

        <View className="gap-5 bg-surface-container-low rounded-lg p-4">
          {article.intisari ? <Intisari items={article.intisari} /> : null}
          {article.quotes ? <Kutipan quotes={article.quotes} /> : null}
        </View>

        <View className="flex-row items-center justify-between mt-4 pt-3 border-b border-surface-variant pb-4">
          <Text className="font-inter text-[12px] text-on-surface-variant opacity-70">
            {article.time}
          </Text>
          <Sym name="bookmark_add" size={20} color={chronicle.onSurfaceVariant} />
        </View>
      </View>
    </View>
  );
}

function BriefCard({ article }: { article: BeritaArticle }) {
  const [open, setOpen] = useState(false);
  const hasDetail = !!(article.intisari || article.quotes);

  return (
    <View className="bg-surface-container-lowest rounded-xl overflow-hidden">
      <Image
        source={{ uri: article.image ?? imageFor(article.id) }}
        className="w-full h-44 bg-surface-container-high"
      />
      <View className="p-5">
        <View className="flex-row justify-between items-start mb-3">
          {article.status ? (
            <View className="flex-row items-center gap-2 bg-surface-container-high px-2.5 py-1 rounded-full">
              <View className={`w-2 h-2 rounded-full ${DOT_BG[article.status.tone]}`} />
              <Text className="font-inter-medium text-[11px] text-on-surface-variant uppercase tracking-wider">
                {article.status.label}
              </Text>
            </View>
          ) : (
            <View />
          )}
          <SourceChip source={article.source} />
        </View>

        <Text className="font-ws-semi text-lg text-on-surface mb-2 leading-snug">
          {article.title}
        </Text>
        <Text className="font-serif text-base text-on-surface-variant leading-relaxed">
          {article.body}
        </Text>

        {open && hasDetail ? (
          <View className="gap-5 bg-surface-container-low rounded-lg p-4 mt-4">
            {article.intisari ? <Intisari items={article.intisari} /> : null}
            {article.quotes ? <Kutipan quotes={article.quotes} /> : null}
          </View>
        ) : null}

        <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-outline-variant">
          <View className="flex-row items-center gap-2">
            {hasDetail ? (
              <Pressable
                onPress={() => setOpen((v) => !v)}
                className="flex-row items-center gap-1 px-3 py-1.5 rounded-full"
              >
                <Sym
                  name={open ? "expand_less" : "expand_more"}
                  size={18}
                  color={chronicle.onSurfaceVariant}
                />
                <Text className="font-inter-medium text-[13px] text-on-surface-variant">
                  {open ? "Tutup" : "Muat Detail"}
                </Text>
              </Pressable>
            ) : null}
            <Text className="font-inter text-[12px] text-on-surface-variant opacity-70">
              {article.time}
            </Text>
          </View>
          <Sym name="bookmark_add" size={20} color={chronicle.onSurfaceVariant} />
        </View>
      </View>
    </View>
  );
}
