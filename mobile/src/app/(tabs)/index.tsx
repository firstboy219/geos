import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { Sym } from "@/components/chronicle/Sym";
import { chronicle } from "@/theme/chronicle";
import {
  BRIEFS,
  FEATURED,
  LATEST,
  NEWS_CATEGORIES,
  categoryParam,
  faviconFor,
  imageFor,
  isOpenableUrl,
  timeAgo,
  toArticle,
  toLatest,
  type BeritaArticle,
  type DotTone,
  type LatestItem,
  type NewsApiItem,
  type NewsCategory,
} from "@/data/beranda";

const PAGE_SIZE = 20;

const DOT_BG: Record<DotTone, string> = {
  emerald: "bg-success-emerald",
  amber: "bg-warning-amber",
  rose: "bg-error-rose",
};

function openSource(url?: string) {
  if (isOpenableUrl(url)) void Linking.openURL(url);
}

/** Beranda — news & trends feed (mockup_v2/home_page, "Chronicle Intel"). */
export default function BerandaScreen() {
  const [featured, setFeatured] = useState<BeritaArticle>(FEATURED);
  const [briefs, setBriefs] = useState<BeritaArticle[]>(BRIEFS);
  const [latest, setLatest] = useState<LatestItem[]>(LATEST);
  const [cat, setCat] = useState(0); // index into NEWS_CATEGORIES
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNews = useCallback(async (pageNum: number, label: NewsCategory) => {
    const category = categoryParam(label);
    const res = await apiClient.get(endpoints.news, {
      params: { size: PAGE_SIZE, page: pageNum, ...(category ? { category } : {}) },
    });
    const data: NewsApiItem[] = res.data?.data ?? res.data ?? [];
    const tot: number = res.data?.total ?? data.length;
    return { data, tot };
  }, []);

  // (Re)load page 1 for the active category → resets featured/briefs/latest.
  const loadFirst = useCallback(
    async (label: NewsCategory) => {
      try {
        const { data, tot } = await fetchNews(1, label);
        if (data.length > 0) {
          setFeatured({ ...toArticle(data[0]), badge: { label: "Terkini", tone: "rose" } });
          setBriefs(data.slice(1, 3).map(toArticle));
          setLatest(data.slice(3).map(toLatest));
        } else {
          setBriefs([]);
          setLatest([]);
        }
        setTotal(tot);
        setPage(1);
        setLastUpdated(new Date().toISOString());
      } catch {
        // offline / unauthenticated → keep existing content
      }
    },
    [fetchNews],
  );

  useEffect(() => {
    void loadFirst(NEWS_CATEGORIES[cat]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFirst(NEWS_CATEGORIES[cat]);
    setRefreshing(false);
  }, [loadFirst, cat]);

  // Infinite scroll — append next page into "Intelijen Terbaru".
  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    if (page * PAGE_SIZE >= total) return; // no more
    setLoadingMore(true);
    try {
      const next = page + 1;
      const { data } = await fetchNews(next, NEWS_CATEGORIES[cat]);
      if (data.length > 0) {
        setLatest((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...data.map(toLatest).filter((x) => !seen.has(x.id))];
        });
        setPage(next);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, page, total, fetchNews, cat]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
      if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 500) {
        void loadMore();
      }
    },
    [loadMore],
  );

  const hasMore = page * PAGE_SIZE < total;

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
          {lastUpdated ? `Terakhir diperbarui ${timeAgo(lastUpdated)}` : "Memuat berita…"}
        </Text>
        <Pressable onPress={onRefresh} disabled={refreshing} className="flex-row items-center gap-1" hitSlop={8}>
          <Sym name="refresh" size={16} color={chronicle.primary} />
          <Text className="font-inter-medium text-[12px] text-primary">
            {refreshing ? "Memperbarui…" : "Perbarui"}
          </Text>
        </Pressable>
      </View>

      {/* Category filter bar (portal-style, clickable) */}
      <View className="bg-canvas border-b border-surface-variant">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 gap-2 py-2.5"
        >
          {NEWS_CATEGORIES.map((label, i) => (
            <Pressable
              key={label}
              onPress={() => setCat(i)}
              className={`px-4 py-1.5 rounded-full ${
                i === cat ? "bg-primary" : "bg-surface-container"
              }`}
            >
              <Text
                className={`font-inter-medium text-[13px] ${
                  i === cat ? "text-on-primary" : "text-on-surface-variant"
                }`}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1 bg-surface-container-low"
        contentContainerClassName="pb-28"
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={400}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={chronicle.primary} colors={[chronicle.primary]} />
        }
      >
        {/* Featured breaking news */}
        <FeaturedCard article={featured} />

        {/* Ringkasan Tren — briefs */}
        {briefs.length > 0 ? (
          <View className="mt-7 px-5">
            <Text className="font-ws-semi text-lg text-on-surface mb-3">Ringkasan Tren</Text>
            <View className="gap-5">
              {briefs.map((b) => (
                <BriefCard key={b.id} article={b} />
              ))}
            </View>
          </View>
        ) : null}

        {/* Intelijen Terbaru — paginated list */}
        <View className="mt-7 px-5">
          <Text className="font-ws-semi text-lg text-on-surface mb-3">Intelijen Terbaru</Text>
          <View className="gap-3">
            {latest.map((l) => (
              <LatestRow key={l.id} item={l} />
            ))}
          </View>
          {hasMore ? (
            <Text className="font-inter text-[12px] text-on-surface-variant text-center mt-5">
              {loadingMore ? "Memuat berita lainnya…" : "Gulir untuk memuat lebih banyak"}
            </Text>
          ) : latest.length > 0 ? (
            <Text className="font-inter text-[12px] text-on-surface-variant opacity-60 text-center mt-5">
              — Sudah paling bawah —
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SourceChip({ source, url }: { source: string; url?: string }) {
  const fav = faviconFor(url);
  return (
    <View className="flex-row items-center gap-2 bg-surface-container px-2.5 py-1.5 rounded-full">
      {fav ? (
        <Image source={{ uri: fav }} className="w-6 h-6 rounded" />
      ) : (
        <View className="w-6 h-6 rounded bg-surface-container-high items-center justify-center">
          <Text className="font-inter-bold text-[12px] text-on-surface-variant">{source.slice(0, 1)}</Text>
        </View>
      )}
      <Text className="font-inter-semi text-[13px] text-on-surface-variant">{source}</Text>
    </View>
  );
}

function Intisari({ items }: { items: string[] }) {
  return (
    <View>
      <Text className="font-inter text-[11px] tracking-wider text-on-surface-variant mb-2">INTISARI</Text>
      <View className="gap-2">
        {items.map((t, i) => (
          <View key={i} className="flex-row gap-3">
            <Text className="text-primary-container mt-0.5">•</Text>
            <Text className="flex-1 font-serif text-[15px] text-on-surface-variant leading-relaxed">{t}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Kutipan({ quotes }: { quotes: { text: string; cite: string }[] }) {
  return (
    <View className="border-l-4 border-primary-container pl-4 py-1">
      <Text className="font-inter text-[11px] tracking-wider text-on-surface-variant mb-1">KUTIPAN</Text>
      {quotes.map((q, i) => (
        <View key={i} className={i > 0 ? "mt-3 pt-3 border-t border-outline-variant" : ""}>
          <Text className="font-serif-italic text-[17px] text-on-surface leading-relaxed">“{q.text}”</Text>
          {q.cite ? <Text className="font-inter text-[12px] text-on-surface-variant mt-1.5">{q.cite}</Text> : null}
        </View>
      ))}
    </View>
  );
}

function FeaturedCard({ article }: { article: BeritaArticle }) {
  return (
    <View className="bg-surface-container-lowest">
      <Pressable onPress={() => openSource(article.url)}>
        <View className="relative">
          <Image source={{ uri: article.image ?? imageFor(article.id) }} className="w-full h-60 bg-surface-container-high" />
          {article.badge ? (
            <View className={`absolute top-4 left-4 px-3 py-1 rounded-full ${DOT_BG[article.badge.tone]}`}>
              <Text className="font-inter-semi text-[11px] text-white uppercase tracking-wider">{article.badge.label}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>

      <View className="px-5 pt-4">
        <View className="flex-row mb-3">
          <SourceChip source={article.source} url={article.url} />
        </View>
        <Pressable onPress={() => openSource(article.url)}>
          <Text className="font-ws-bold text-2xl text-on-surface leading-tight mb-2">{article.title}</Text>
        </Pressable>
        <Text className="font-serif text-base text-on-surface-variant leading-relaxed mb-4">{article.body}</Text>

        {article.intisari || article.quotes ? (
          <View className="gap-5 bg-surface-container-low rounded-lg p-4">
            {article.intisari ? <Intisari items={article.intisari} /> : null}
            {article.quotes ? <Kutipan quotes={article.quotes} /> : null}
          </View>
        ) : null}

        <View className="flex-row items-center justify-between mt-4 pt-3 border-b border-surface-variant pb-4">
          <Text className="font-inter text-[12px] text-on-surface-variant opacity-70">{article.time}</Text>
          {isOpenableUrl(article.url) ? (
            <Pressable onPress={() => openSource(article.url)} className="flex-row items-center gap-1" hitSlop={8}>
              <Sym name="open_in_new" size={16} color={chronicle.primary} />
              <Text className="font-inter-medium text-[12px] text-primary">Baca di sumber</Text>
            </Pressable>
          ) : (
            <Sym name="bookmark_add" size={20} color={chronicle.onSurfaceVariant} />
          )}
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
      <Pressable onPress={() => openSource(article.url)}>
        <Image source={{ uri: article.image ?? imageFor(article.id) }} className="w-full h-44 bg-surface-container-high" />
      </Pressable>
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
          <SourceChip source={article.source} url={article.url} />
        </View>

        <Pressable onPress={() => openSource(article.url)}>
          <Text className="font-ws-semi text-lg text-on-surface mb-2 leading-snug">{article.title}</Text>
        </Pressable>
        <Text className="font-serif text-base text-on-surface-variant leading-relaxed">{article.body}</Text>

        {open && hasDetail ? (
          <View className="gap-5 bg-surface-container-low rounded-lg p-4 mt-4">
            {article.intisari ? <Intisari items={article.intisari} /> : null}
            {article.quotes ? <Kutipan quotes={article.quotes} /> : null}
          </View>
        ) : null}

        <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-outline-variant">
          <View className="flex-row items-center gap-2">
            {hasDetail ? (
              <Pressable onPress={() => setOpen((v) => !v)} className="flex-row items-center gap-1 px-3 py-1.5 rounded-full" hitSlop={6}>
                <Sym name={open ? "expand_less" : "expand_more"} size={18} color={chronicle.onSurfaceVariant} />
                <Text className="font-inter-medium text-[13px] text-on-surface-variant">{open ? "Tutup" : "Muat Detail"}</Text>
              </Pressable>
            ) : null}
            <Text className="font-inter text-[12px] text-on-surface-variant opacity-70">{article.time}</Text>
          </View>
          {isOpenableUrl(article.url) ? (
            <Pressable onPress={() => openSource(article.url)} hitSlop={8}>
              <Sym name="open_in_new" size={18} color={chronicle.primary} />
            </Pressable>
          ) : (
            <Sym name="bookmark_add" size={20} color={chronicle.onSurfaceVariant} />
          )}
        </View>
      </View>
    </View>
  );
}

function LatestRow({ item }: { item: LatestItem }) {
  const [open, setOpen] = useState(false);
  const hasDetail = !!(item.intisari || item.quotes);
  return (
    <View className="bg-surface-container-lowest rounded-xl p-3">
      <View className="flex-row gap-3">
        <Pressable onPress={() => openSource(item.url)}>
          <Image source={{ uri: item.image ?? imageFor(item.id) }} className="w-20 h-20 rounded-lg bg-surface-container-high" />
        </Pressable>
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5 mb-1">
            {faviconFor(item.url) ? (
              <Image source={{ uri: faviconFor(item.url)! }} className="w-5 h-5 rounded" />
            ) : (
              <View className={`w-2 h-2 rounded-full ${DOT_BG[item.tone]}`} />
            )}
            <Text className="font-inter-semi text-[12px] text-on-surface-variant">{item.source}</Text>
          </View>
          <Pressable onPress={() => openSource(item.url)}>
            <Text className="font-ws-semi text-[15px] text-on-surface leading-snug" numberOfLines={3}>
              {item.title}
            </Text>
          </Pressable>
          <View className="flex-row items-center justify-between mt-1">
            <Text className="font-inter text-[11px] text-on-surface-variant opacity-70">{item.time}</Text>
            {hasDetail ? (
              <Pressable onPress={() => setOpen((v) => !v)} className="flex-row items-center gap-1" hitSlop={6}>
                <Text className="font-inter-medium text-[12px] text-primary">{open ? "Tutup" : "Detail"}</Text>
                <Sym name={open ? "expand_less" : "expand_more"} size={16} color={chronicle.primary} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      {open && hasDetail ? (
        <View className="gap-5 bg-surface-container-low rounded-lg p-4 mt-3">
          {item.intisari ? <Intisari items={item.intisari} /> : null}
          {item.quotes ? <Kutipan quotes={item.quotes} /> : null}
        </View>
      ) : null}
    </View>
  );
}
