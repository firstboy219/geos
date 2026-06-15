import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { Sym } from "@/components/chronicle/Sym";
import { chronicle } from "@/theme/chronicle";
import {
  DEMO_IMPACTS,
  IMPACT_FILTERS,
  groupImpacts,
  type ImpactApiItem,
  type ImpactDir,
  type SituationImpacts,
} from "@/data/dampak";

const DIR: Record<ImpactDir, { sym: string; color: string; cls: string }> = {
  up: { sym: "arrow_upward", color: chronicle.emerald, cls: "text-success-emerald" },
  down: { sym: "arrow_downward", color: chronicle.rose, cls: "text-error-rose" },
  neutral: { sym: "remove", color: chronicle.onSurfaceVariant, cls: "text-on-surface-variant" },
  mixed: { sym: "swap_vert", color: chronicle.amber, cls: "text-warning-amber" },
};

/** Dampak — general consequences of situations, filterable by category (F2). */
export default function DampakScreen() {
  const [filter, setFilter] = useState(0);
  const [groups, setGroups] = useState<SituationImpacts[]>(DEMO_IMPACTS);

  useEffect(() => {
    let active = true;
    const cat = IMPACT_FILTERS[filter]?.value ?? null;
    (async () => {
      try {
        const res = await apiClient.get(endpoints.impacts, {
          params: { size: 100, ...(cat ? { category: cat } : {}) },
        });
        const items: ImpactApiItem[] = res.data?.data ?? res.data ?? [];
        if (!active) return;
        setGroups(items.length ? groupImpacts(items) : cat ? [] : DEMO_IMPACTS);
      } catch {
        if (active && !cat) setGroups(DEMO_IMPACTS);
      }
    })();
    return () => {
      active = false;
    };
  }, [filter]);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 py-3 bg-canvas border-b border-surface-variant">
        <Sym name="menu" size={24} color={chronicle.onBackground} />
        <Text className="font-ws-bold text-xl text-primary">Dampak</Text>
        <Sym name="tune" size={22} color={chronicle.onBackground} />
      </View>

      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerClassName="pb-28"
        showsVerticalScrollIndicator={false}
      >
        {/* Personal impact CTA */}
        <View className="px-5 pt-4">
          <Pressable
            onPress={() => router.push("/dampak/me")}
            className="flex-row items-center justify-between bg-primary rounded-xl px-4 py-4"
          >
            <View className="flex-row items-center gap-3 flex-1">
              <Sym name="person_search" size={24} color={chronicle.onPrimary} />
              <View className="flex-1">
                <Text className="font-ws-semi text-[15px] text-on-primary">
                  Dampak ke Diri Saya
                </Text>
                <Text className="font-inter text-[12px] text-on-primary opacity-80">
                  AI menganalisa berdasarkan profil Anda
                </Text>
              </View>
            </View>
            <Sym name="chevron_right" size={22} color={chronicle.onPrimary} />
          </Pressable>
        </View>

        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-5 gap-2 py-4"
        >
          {IMPACT_FILTERS.map((f, i) => (
            <Pressable
              key={f.label}
              onPress={() => setFilter(i)}
              className={`px-4 py-1.5 rounded-full border ${
                i === filter ? "bg-on-background border-on-background" : "border-outline-variant"
              }`}
            >
              <Text
                className={`font-inter-medium text-[13px] ${
                  i === filter ? "text-on-primary" : "text-on-surface-variant"
                }`}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {groups.length === 0 ? (
          <Text className="font-serif text-on-surface-variant text-center px-5 mt-10">
            Belum ada dampak untuk kategori ini.
          </Text>
        ) : (
          <View className="px-5 gap-6">
            {groups.map((g) => (
              <View key={g.crisisId}>
                <Text className="font-ws-semi text-lg text-on-background mb-3">
                  {g.title}
                </Text>
                <View className="gap-3">
                  {g.impacts.map((im) => {
                    const d = DIR[im.direction];
                    return (
                      <View
                        key={im.id}
                        className="bg-surface-container-lowest rounded-xl p-4 border border-surface-variant"
                      >
                        <View className="flex-row items-start gap-2">
                          <Sym name={d.sym} size={18} color={d.color} style={{ marginTop: 2 }} />
                          <View className="flex-1">
                            <Text className="font-ws-semi text-[15px] text-on-surface">
                              {im.title}
                            </Text>
                            {im.detail ? (
                              <Text className="font-serif text-[14px] text-on-surface-variant leading-relaxed mt-1">
                                {im.detail}
                              </Text>
                            ) : null}
                            <View className="flex-row items-center gap-2 mt-2">
                              <View className="px-2 py-0.5 rounded bg-surface-container">
                                <Text className="font-inter text-[11px] text-on-surface-variant uppercase">
                                  {im.category}
                                </Text>
                              </View>
                              {im.timeframe ? (
                                <Text className="font-inter text-[11px] text-on-surface-variant">
                                  {im.timeframe}
                                </Text>
                              ) : null}
                              {im.severity ? (
                                <Text className={`font-inter-medium text-[11px] ${d.cls}`}>
                                  {im.severity}
                                </Text>
                              ) : null}
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
