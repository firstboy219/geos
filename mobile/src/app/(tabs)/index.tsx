import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { Sym } from "@/components/chronicle/Sym";
import { Avatar } from "@/components/chronicle/Avatar";
import { useHidingHeader } from "@/components/chronicle/useHidingHeader";
import { ArticleImage } from "@/components/beranda/ArticleImage";
import { PulseDot } from "@/components/beranda/PulseDot";
import { chronicle } from "@/theme/chronicle";
import {
  BRIEFS,
  FEATURED,
  LATEST,
  NEWS_CATEGORIES,
  faviconFor,
  isOpenableUrl,
  matchesCategory,
  timeAgo,
  toArticle,
  toLatestFromArticle,
  type BeritaArticle,
  type DotTone,
  type LatestItem,
  type NewsApiItem,
  type NewsCategory,
} from "@/data/beranda";

const PAGE_SIZE = 100; // Home-7: fetch a large master page up front.
const MAX_PAGES = 5; // cap how far infinite scroll grows the master list.
const HEADER_H = 150; // top bar + last-updated row + category bar (auto-hides).

const DOT_BG: Record<DotTone, string> = {
  emerald: "bg-success-emerald",
  amber: "bg-warning-amber",
  rose: "bg-error-rose",
};

/** Offline/empty demo master list (kept so the screen is never blank). */
const DEMO_MASTER: BeritaArticle[] = [FEATURED, ...BRIEFS, ...LATEST.map(latestToArticle)];

function latestToArticle(l: LatestItem): BeritaArticle {
  return {
    id: l.id,
    source: l.source,
    title: l.title,
    body: l.intisari?.[0] ?? "",
    time: l.time,
    url: l.url,
    image: l.image,
    categories: l.categories,
    intisari: l.intisari,
    quotes: l.quotes,
  };
}

function openSource(url?: string) {
  if (isOpenableUrl(url)) void Linking.openURL(url);
}

/** Beranda — news & trends feed (mockup_v2/home_page, "Chronicle Intel"). */
export default function BerandaScreen() {
  // Home-7: one master list of every loaded article; everything derives from it.
  const [master, setMaster] = useState<BeritaArticle[]>(DEMO_MASTER);
  const [usingDemo, setUsingDemo] = useState(true);
  const [cat, setCat] = useState(0); // index into NEWS_CATEGORIES
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // General-3: client-side search over loaded articles.
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { onScroll: headerOnScroll, headerStyle, headerHeight } = useHidingHeader(HEADER_H);

  const fetchNews = useCallback(async (pageNum: number) => {
    const res = await apiClient.get(endpoints.news, {
      params: { size: PAGE_SIZE, page: pageNum },
    });
    const data: NewsApiItem[] = res.data?.data ?? res.data ?? [];
    const tot: number = res.data?.total ?? data.length;
    return { data, tot };
  }, []);

  // Re-fetch the master list from page 1 (mount, Perbarui, pull-to-refresh).
  const loadFirst = useCallback(async () => {
    try {
      const { data, tot } = await fetchNews(1);
      if (data.length > 0) {
        setMaster(data.map(toArticle));
        setUsingDemo(false);
        setTotal(tot);
        setPage(1);
      }
      setLastUpdated(new Date().toISOString());
    } catch {
      // offline / unauthenticated → keep existing (demo) content
    }
  }, [fetchNews]);

  useEffect(() => {
    void loadFirst();
  }, [loadFirst]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFirst();
    setRefreshing(false);
  }, [loadFirst]);

  // Infinite scroll — append the next backend page into the master list.
  const loadMore = useCallback(async () => {
    if (loadingMore || usingDemo) return;
    if (page >= MAX_PAGES) return;
    if (page * PAGE_SIZE >= total) return; // no more
    setLoadingMore(true);
    try {
      const next = page + 1;
      const { data } = await fetchNews(next);
      if (data.length > 0) {
        setMaster((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...data.map(toArticle).filter((x) => !seen.has(x.id))];
        });
        setPage(next);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, usingDemo, page, total, fetchNews]);

  // Infinite-scroll detection runs on plain JS scroll callbacks so it doesn't
  // interfere with the native-driven hiding-header onScroll event.
  const onScrollCheck = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
      if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 500) {
        void loadMore();
      }
    },
    [loadMore],
  );

  // ── Derived (client-side) feed: filter by category, then by search query ──
  const label = NEWS_CATEGORIES[cat];
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    let list = master.filter((a) => matchesCategory(a, label));
    if (q) list = list.filter((a) => a.title.toLowerCase().includes(q));
    return list;
  }, [master, label, q]);

  const featured: BeritaArticle | null = filtered[0]
    ? { ...filtered[0], badge: { label: "Terkini", tone: "rose" } }
    : null;
  const briefs = filtered.slice(1, 3);
  const latest: LatestItem[] = filtered.slice(3).map(toLatestFromArticle);

  const hasMore = !usingDemo && !q && page < MAX_PAGES && page * PAGE_SIZE < total;

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      {/* General-4: auto-hiding header (top bar + last-updated + categories). */}
      <Animated.View
        style={[{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20 }, headerStyle]}
        pointerEvents="box-none"
      >
        <View className="bg-canvas">
          {/* Top app bar */}
          <View className="flex-row items-center justify-between px-5 py-3 bg-canvas border-b border-surface-variant">
            {/* General-2: profile avatar replaces the menu icon. */}
            <Avatar />
            {searchOpen ? (
              <View className="flex-1 mx-3 flex-row items-center bg-surface-container rounded-full px-3">
                <Sym name="search" size={18} color={chronicle.onSurfaceVariant} />
                <TextInput
                  autoFocus
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Cari berita…"
                  placeholderTextColor={chronicle.onSurfaceVariant}
                  className="flex-1 px-2 py-2 font-inter text-[14px] text-on-surface"
                  returnKeyType="search"
                />
                {query.length > 0 ? (
                  <Pressable onPress={() => setQuery("")} hitSlop={8}>
                    <Sym name="close" size={18} color={chronicle.onSurfaceVariant} />
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <Text className="font-ws-bold text-xl text-primary">Beranda</Text>
            )}
            {/* General-3: search toggle. */}
            <Pressable onPress={() => (searchOpen ? closeSearch() : setSearchOpen(true))} hitSlop={8}>
              <Sym name={searchOpen ? "close" : "search"} size={24} color={chronicle.onBackground} />
            </Pressable>
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

          {/* Category filter bar (instant, client-side). */}
          <View className="bg-canvas border-b border-surface-variant">
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="px-4 gap-2 py-2.5"
            >
              {NEWS_CATEGORIES.map((lbl, i) => (
                <Pressable
                  key={lbl}
                  onPress={() => setCat(i)}
                  className={`px-4 py-1.5 rounded-full ${i === cat ? "bg-primary" : "bg-surface-container"}`}
                >
                  <Text
                    className={`font-inter-medium text-[13px] ${
                      i === cat ? "text-on-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {lbl}
                  </Text>
                </Pressable>
              ))}
            </Animated.ScrollView>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        className="flex-1 bg-surface-container-low"
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 112 }}
        showsVerticalScrollIndicator={false}
        onScroll={headerOnScroll}
        onScrollEndDrag={onScrollCheck}
        onMomentumScrollEnd={onScrollCheck}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={headerHeight}
            tintColor={chronicle.primary}
            colors={[chronicle.primary]}
          />
        }
      >
        {featured ? (
          <FeaturedCard article={featured} />
        ) : (
          <View className="px-5 py-16 items-center">
            <Sym name="search_off" size={40} color={chronicle.onSurfaceVariant} />
            <Text className="font-inter text-[14px] text-on-surface-variant text-center mt-3">
              {q ? `Tidak ada berita untuk "${query.trim()}"` : "Belum ada berita untuk kategori ini."}
            </Text>
          </View>
        )}

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
        {latest.length > 0 ? (
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
            ) : (
              <Text className="font-inter text-[12px] text-on-surface-variant opacity-60 text-center mt-5">
                — Sudah paling bawah —
              </Text>
            )}
          </View>
        ) : null}
      </Animated.ScrollView>
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
      {/* Home-4: "INTISARI" → "Singkatnya..". */}
      <Text className="font-inter text-[11px] tracking-wider text-on-surface-variant mb-2">Singkatnya..</Text>
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
          {/* Home-3: real image or neutral placeholder (no random picsum). */}
          <ArticleImage uri={article.image} className="w-full h-60" iconSize={40} />
          {article.badge ? (
            <View
              className={`absolute top-4 left-4 flex-row items-center gap-1.5 px-3 py-1 rounded-full ${DOT_BG[article.badge.tone]}`}
            >
              {/* Home-6: pulsing "beep" dot next to "Terkini". */}
              <PulseDot color="#ffffff" />
              <Text className="font-inter-semi text-[11px] text-white uppercase tracking-wider">
                {article.badge.label}
              </Text>
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
        <ArticleImage uri={article.image} className="w-full h-44" iconSize={32} />
      </Pressable>
      <View className="p-5">
        {/* Home-5: source (favicon + name) LEFT ↔ time RIGHT, same top row. */}
        <View className="flex-row justify-between items-center mb-3">
          <SourceChip source={article.source} url={article.url} />
          <Text className="font-inter text-[12px] text-on-surface-variant opacity-70">{article.time}</Text>
        </View>

        {/* Keep status chip if present (below the source/time row). */}
        {article.status ? (
          <View className="flex-row mb-3">
            <View className="flex-row items-center gap-2 bg-surface-container-high px-2.5 py-1 rounded-full">
              <View className={`w-2 h-2 rounded-full ${DOT_BG[article.status.tone]}`} />
              <Text className="font-inter-medium text-[11px] text-on-surface-variant uppercase tracking-wider">
                {article.status.label}
              </Text>
            </View>
          </View>
        ) : null}

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
          {hasDetail ? (
            <Pressable
              onPress={() => setOpen((v) => !v)}
              className="flex-row items-center gap-1 px-3 py-1.5 rounded-full"
              hitSlop={6}
            >
              <Sym name={open ? "expand_less" : "expand_more"} size={18} color={chronicle.onSurfaceVariant} />
              <Text className="font-inter-medium text-[13px] text-on-surface-variant">
                {open ? "Tutup" : "Muat Detail"}
              </Text>
            </Pressable>
          ) : (
            <View />
          )}
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
          <ArticleImage uri={item.image} className="w-20 h-20 rounded-lg" iconSize={22} />
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
