import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { Sym } from "@/components/chronicle/Sym";
import { useCrises } from "@/state";
import { chronicle } from "@/theme/chronicle";
import {
  DUMMY_CRISES,
  crisisFromLive,
  type CrisisModel,
  type ImpactDirection,
  type ToneKey,
} from "@/data/home";

const TONE_TEXT: Record<ToneKey, string> = {
  positive: "text-success-emerald",
  warning: "text-warning-amber",
  danger: "text-error-rose",
  neutral: "text-on-surface-variant",
  info: "text-primary",
  special: "text-secondary",
};
const TONE_BAR: Record<ToneKey, string> = {
  positive: "bg-success-emerald",
  warning: "bg-warning-amber",
  danger: "bg-error-rose",
  neutral: "bg-on-surface-variant",
  info: "bg-primary",
  special: "bg-secondary",
};
const TONE_HEX: Record<ToneKey, string> = {
  positive: chronicle.emerald,
  warning: chronicle.amber,
  danger: chronicle.rose,
  neutral: chronicle.onSurfaceVariant,
  info: chronicle.primary,
  special: chronicle.secondary,
};

const CATS = ["Internasional", "Regional", "Nasional"];
const SUMBER = [32, 24, 18];
const HARI = [32, 21, 45];
const KEBERLANJUTAN = ["3 bulan", "6 bulan", "2 tahun"];

function imageFor(id: string): string {
  return `https://picsum.photos/seed/geoscan-map-${id}/800/360`;
}

interface SituationCardData {
  model: CrisisModel;
  crisisId?: string;
  newsCount?: number;
}

/** Analisa — critical-situation cards (mockup_v2/analisa_page, "Chronicle Intel"). */
export default function AnalisaScreen() {
  const [cat, setCat] = useState(0);
  const crises = useCrises();

  useEffect(() => {
    void crises.fetch();
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedRegion = CATS[cat];
  const allCards: SituationCardData[] = crises.data.length
    ? crises.data.map((c, i) => ({
        model: crisisFromLive(c, i),
        crisisId: c.id,
        newsCount: c.newsCount,
      }))
    : // Offline demo fallback ONLY when the live list is completely empty.
      DUMMY_CRISES.map((m) => ({ model: m }));

  // A1 — client-side region filter over the already-fetched list. Live
  // situations carry a real region; when the list is the offline demo (no
  // region set) we show everything so the screen is never blank.
  const cards = crises.data.length
    ? allCards.filter((card) => (card.model.region || "") === selectedRegion)
    : allCards;

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 py-3 bg-canvas border-b border-surface-variant">
        <Sym name="menu" size={24} color={chronicle.onBackground} />
        <Text className="font-ws-bold text-xl text-primary">Analisis</Text>
        <Sym name="share" size={22} color={chronicle.onBackground} />
      </View>

      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerClassName="px-5 pt-4 pb-28"
        showsVerticalScrollIndicator={false}
      >
        {/* Global situation overview */}
        <View className="bg-surface-container-lowest rounded-lg border border-surface-variant overflow-hidden mb-7">
          <View className="px-4 py-3 border-b border-surface-variant">
            <Text className="font-ws-semi text-lg text-on-background">
              Global Situation Overview
            </Text>
          </View>
          <Image
            source={{ uri: imageFor("globe") }}
            className="w-full h-44 bg-surface-container-high"
          />
          <View className="bg-surface-container-low px-4 py-2 border-t border-surface-variant flex-row items-center gap-1">
            <Sym name="public" size={16} color={chronicle.onSurfaceVariant} />
            <Text className="font-inter text-[12px] text-on-surface-variant">
              Real-time global risk monitoring
            </Text>
          </View>
        </View>

        {/* Category chips */}
        <View className="flex-row gap-2 mb-6 pb-3 border-b border-surface-variant">
          {CATS.map((c, i) => (
            <Pressable
              key={c}
              onPress={() => setCat(i)}
              className={`px-4 py-1.5 rounded-full border ${
                i === cat
                  ? "bg-on-background border-on-background"
                  : "border-outline-variant"
              }`}
            >
              <Text
                className={`font-inter-medium text-[13px] ${
                  i === cat ? "text-on-primary" : "text-on-surface-variant"
                }`}
              >
                {c}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="font-ws-semi text-lg text-on-background mb-4">
          Situasi Kritis Saat ini :
        </Text>

        {cards.length === 0 ? (
          <Text className="font-serif text-on-surface-variant text-center mt-8">
            Belum ada situasi {selectedRegion.toLowerCase()} yang dipantau saat
            ini.
          </Text>
        ) : (
          <View className="gap-7">
            {cards.map((card, i) => (
              <SituationCard
                key={card.model.id}
                crisis={card.model}
                index={i}
                crisisId={card.crisisId}
                newsCount={card.newsCount}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="font-inter text-[11px] tracking-widest text-on-surface-variant uppercase mb-3 border-b border-surface-variant pb-1">
      {children}
    </Text>
  );
}

function ProbBar({
  label,
  percent,
  tone,
  emphasize,
}: {
  label: string;
  percent: number;
  tone: ToneKey;
  emphasize?: boolean;
}) {
  return (
    <View className="flex-row items-center mb-1.5">
      <Text
        className={`w-1/2 text-[13px] text-on-background ${
          emphasize ? "font-inter-semi" : "font-inter"
        }`}
      >
        {label}
      </Text>
      <View className="flex-1 bg-surface-variant h-1.5 rounded-full mx-2 overflow-hidden">
        <View
          className={`h-full rounded-full ${TONE_BAR[tone]}`}
          style={{ width: `${percent}%` }}
        />
      </View>
      <Text className={`w-10 text-right font-inter-bold text-[13px] ${TONE_TEXT[tone]}`}>
        {percent}%
      </Text>
    </View>
  );
}

function ImpactTag({ label, direction }: { label: string; direction: ImpactDirection }) {
  const map: Record<ImpactDirection, { sym: string; bg: string; txt: string }> = {
    up: { sym: "↑", bg: "bg-success-emerald/10", txt: "text-success-emerald" },
    down: { sym: "↓", bg: "bg-error-rose/10", txt: "text-error" },
    neutral: { sym: "↔", bg: "bg-surface-variant", txt: "text-on-surface-variant" },
    watch: { sym: "!", bg: "bg-warning-amber/10", txt: "text-warning-amber" },
  };
  const s = map[direction];
  return (
    <View className={`px-2 py-0.5 rounded ${s.bg}`}>
      <Text className={`font-inter-medium text-[12px] ${s.txt}`}>
        {s.sym} {label}
      </Text>
    </View>
  );
}

interface RelatedNews {
  id: string;
  title: string;
  source_name: string | null;
  url: string;
  published_at: string | null;
}

function SituationCard({
  crisis,
  index,
  crisisId,
  newsCount,
}: {
  crisis: CrisisModel;
  index: number;
  crisisId?: string;
  newsCount?: number;
}) {
  const [open, setOpen] = useState(index === 0);
  const [news, setNews] = useState<RelatedNews[]>([]);
  const hoax = Math.max(0, 100 - crisis.credibilityScore);
  const bars = open ? crisis.probabilityBars : crisis.probabilityBars.slice(0, 1);
  const sumber = newsCount ?? SUMBER[index] ?? 20;

  useEffect(() => {
    if (!open || !crisisId || news.length) return;
    let active = true;
    apiClient
      .get(endpoints.crisisNews(crisisId), { params: { limit: 20 } })
      .then((r) => {
        if (active) setNews(r.data?.data ?? r.data ?? []);
      })
      .catch(() => {
        /* keep empty */
      });
    return () => {
      active = false;
    };
  }, [open, crisisId, news.length]);

  return (
    <View className="pb-7 border-b border-surface-variant">
      {/* Map */}
      <View className="mb-4 rounded-lg border border-surface-variant overflow-hidden">
        <Image
          source={{ uri: imageFor(crisis.id) }}
          className="w-full h-40 bg-surface-container-high"
        />
        <View className="bg-surface-container-low px-4 py-2 border-t border-surface-variant flex-row items-center gap-1">
          <Sym name="map" size={16} color={chronicle.onSurfaceVariant} />
          <Text className="font-inter text-[12px] text-on-surface-variant">
            Visualisasi Zona Insiden
          </Text>
        </View>
      </View>

      {/* Header */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 pr-3">
          <Text className="font-ws-bold text-2xl text-on-background mb-0.5">
            {crisis.title}
          </Text>
          <Text className="font-inter text-[12px] text-success-emerald uppercase tracking-wider">
            Potensi Hoax {hoax}%
          </Text>
        </View>
        <View className="items-end">
          <Text className="font-ws-bold text-2xl text-primary">{sumber}</Text>
          <Text className="font-inter text-[12px] text-on-surface-variant">Sumber</Text>
        </View>
      </View>

      {/* Summary */}
      {crisis.summaryText ? (
        <Text
          className="font-serif text-[17px] text-on-background leading-relaxed mb-4"
          numberOfLines={open ? undefined : 3}
        >
          {crisis.summaryText}
        </Text>
      ) : null}

      {/* Status box (only when a real status exists) */}
      {crisis.statusText ? (
        <View className="bg-surface-container-low p-3 rounded border-l-[6px] border-success-emerald mb-4 flex-row gap-2">
          <Sym name="circle" size={14} color={chronicle.emerald} style={{ marginTop: 2 }} />
          <Text className="flex-1 font-inter text-[13px] text-on-background leading-relaxed">
            {crisis.statusText}
          </Text>
        </View>
      ) : null}

      {/* Probability (only when real projection data exists) */}
      {crisis.probabilityBars.length > 0 ? (
        <>
          <Text className="font-inter text-[12px] text-on-surface-variant uppercase tracking-wide mb-2">
            Apa yang paling mungkin terjadi:
          </Text>
          <View className="mb-4">
            {bars.map((b, i) => (
              <ProbBar
                key={b.label}
                label={b.label}
                percent={b.percent}
                tone={b.tone}
                emphasize={i === 0}
              />
            ))}
          </View>
        </>
      ) : null}

      {open ? (
        <View>
          {/* Berita terkait (live grouped articles) */}
          {news.length > 0 ? (
            <View className="mb-7">
              <SectionLabel>{`Berita Terkait (${news.length})`}</SectionLabel>
              <View className="gap-3">
                {news.map((n) => (
                  <View key={n.id} className="flex-row items-start gap-2">
                    <Sym
                      name="article"
                      size={16}
                      color={chronicle.onSurfaceVariant}
                      style={{ marginTop: 2 }}
                    />
                    <View className="flex-1">
                      <Text className="font-serif text-[15px] text-on-background leading-snug">
                        {n.title}
                      </Text>
                      <Text className="font-inter text-[12px] text-on-surface-variant mt-0.5">
                        {n.source_name ?? "Sumber"}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Regional sentiment */}
          {crisis.perceptions.length > 0 ? (
          <View className="mb-7">
            <SectionLabel>Analisis Sentimen Regional</SectionLabel>
            <View className="gap-4">
              {crisis.perceptions.map((p, i) => {
                const flag = p.actor.slice(0, 2);
                const rest = p.actor.slice(2).trim();
                return (
                  <View key={i} className="flex-row items-start">
                    <Text className="text-xl w-8 mr-2">{flag}</Text>
                    <View className="flex-1">
                      <Text className="font-inter text-[12px] text-on-surface-variant mb-0.5">
                        {rest}
                      </Text>
                      <Text className="font-serif text-[15px] text-on-background mb-1">
                        {p.reading}
                      </Text>
                      <Text className={`font-inter text-[12px] ${TONE_TEXT[p.tone]}`}>
                        {p.verdict}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
          ) : null}

          {/* Key actors */}
          {crisis.actors.length > 0 ? (
          <View className="mb-7">
            <SectionLabel>Profil Aktor Kunci</SectionLabel>
            <View className="gap-4">
              {crisis.actors.map((a, i) => (
                <View key={i} className="flex-row items-start">
                  <View className="w-10 h-10 rounded-full bg-surface-container items-center justify-center mr-3">
                    <Text className="font-inter-bold text-[13px] text-on-surface-variant">
                      {a.initials}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-inter-medium text-[14px] text-on-background">
                      {a.name}
                    </Text>
                    <Text className="font-inter text-[12px] text-on-surface-variant mt-0.5">
                      Tekanan domestik {a.stressLabel}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          ) : null}

          {/* Game changer */}
          {crisis.pivotWatches.length > 0 ? (
          <View className="mb-7">
            <SectionLabel>Game Changer Event</SectionLabel>
            <View className="gap-3">
              {crisis.pivotWatches.map((p, i) => {
                const symName =
                  p.tone === "danger"
                    ? "gavel"
                    : p.icon.includes("trending")
                      ? "trending_down"
                      : "public";
                return (
                  <View key={i} className="flex-row items-start gap-2">
                    <Sym
                      name={symName}
                      size={18}
                      color={TONE_HEX[p.tone]}
                      style={{ marginTop: 2 }}
                    />
                    <View className="flex-1">
                      <Text className="font-serif text-[15px] text-on-background leading-relaxed">
                        {p.text}
                      </Text>
                      <Text className={`font-inter-medium text-[12px] mt-1 ${TONE_TEXT[p.tone]}`}>
                        {p.badge}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
          ) : null}

          {/* Scenarios */}
          {crisis.scenarios.length > 0 ? (
          <View className="mb-7">
            <SectionLabel>Skenario Proyeksi</SectionLabel>
            <View className="gap-6">
              {crisis.scenarios.map((s, i) => (
                <View key={i} className={`pl-3 border-l-[6px] ${TONE_BAR[s.tone]}`}>
                  <View className="flex-row justify-between items-end mb-2">
                    <Text className="flex-1 font-ws-semi text-lg text-on-background pr-2">
                      {i + 1}. {s.name.replace(/^Skenario \d+ — /, "")}
                    </Text>
                    <Text className={`font-inter-bold text-lg ${TONE_TEXT[s.tone]}`}>
                      {s.probability}%
                    </Text>
                  </View>
                  <Text className="font-inter text-[12px] text-on-surface-variant uppercase tracking-wide mb-2">
                    {s.rung} • Durasi: {s.duration}
                  </Text>
                  <Text className="font-serif text-[15px] text-on-background leading-relaxed mb-4">
                    {s.hint}
                  </Text>

                  {s.financialWeapons.length > 0 ? (
                    <View className="bg-surface-container-low p-3 rounded mb-4">
                      <Text className="font-inter-semi text-[12px] text-on-background mb-2">
                        Financial Warfare Inventory
                      </Text>
                      <View className="gap-2">
                        {s.financialWeapons.map((w, j) => (
                          <Text
                            key={j}
                            className="font-inter text-[12px] text-on-surface-variant leading-relaxed"
                          >
                            {w.flag} {w.text}
                          </Text>
                        ))}
                      </View>
                    </View>
                  ) : null}

                  <Text className="font-inter text-[12px] text-on-surface-variant mb-1">
                    Kepercayaan AI
                  </Text>
                  <View className="flex-row items-center mb-3">
                    <View className="flex-1 bg-surface-variant h-1 rounded-full mr-3 overflow-hidden">
                      <View
                        className={`h-full rounded-full ${TONE_BAR[s.tone]}`}
                        style={{ width: `${s.confidenceScore}%` }}
                      />
                    </View>
                    <Text className={`font-inter-bold text-[13px] ${TONE_TEXT[s.tone]}`}>
                      {s.confidenceScore}%
                    </Text>
                  </View>

                  <View className="flex-row flex-wrap gap-2">
                    {s.industryImpacts.map((im, j) => (
                      <ImpactTag key={j} label={im.label} direction={im.direction} />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
          ) : null}

          {/* Honest placeholder when no deep analysis exists yet (A2) */}
          {crisis.perceptions.length === 0 &&
          crisis.actors.length === 0 &&
          crisis.pivotWatches.length === 0 &&
          crisis.scenarios.length === 0 ? (
            <View className="bg-surface-container-low p-4 rounded-lg border border-surface-variant flex-row items-start gap-2">
              <Sym
                name="hourglass_empty"
                size={18}
                color={chronicle.onSurfaceVariant}
                style={{ marginTop: 2 }}
              />
              <Text className="flex-1 font-serif text-[15px] text-on-surface-variant leading-relaxed">
                Analisa mendalam (16 lapis) sedang diproses. Skenario, profil
                aktor, dan sentimen akan muncul di sini setelah situasi selesai
                dianalisa.
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Footer */}
      <View className="flex-row justify-between items-center border-t border-surface-variant pt-3 mt-1">
        <Text className="font-inter text-[12px] text-on-surface-variant leading-relaxed">
          Sudah Berlangsung {HARI[index] ?? 30} Hari{"\n"}
          <Text className="font-inter-medium text-on-background">
            Potensi Keberlanjutan {KEBERLANJUTAN[index] ?? "3 bulan"}
          </Text>
        </Text>
        <Pressable
          onPress={() => setOpen((v) => !v)}
          className="flex-row items-center gap-1"
        >
          <Text className="font-inter-medium text-[13px] text-primary">
            {open ? "Collapse" : "Expand"}
          </Text>
          <Sym
            name={open ? "expand_less" : "expand_more"}
            size={18}
            color={chronicle.primary}
          />
        </Pressable>
      </View>
    </View>
  );
}
