import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { Sym } from "@/components/chronicle/Sym";
import { chronicle } from "@/theme/chronicle";
import {
  ASSET_TYPES,
  DEMO_TREASURY,
  assetMeta,
  fmtMoney,
  type AssetView,
  type TreasuryData,
} from "@/data/treasury";

const DIR: Record<string, { color: string; cls: string; sym: string }> = {
  up: { color: chronicle.emerald, cls: "text-success-emerald", sym: "arrow_upward" },
  down: { color: chronicle.rose, cls: "text-error-rose", sym: "arrow_downward" },
  neutral: { color: chronicle.onSurfaceVariant, cls: "text-on-surface-variant", sym: "remove" },
};

/** Treasury — user asset tracker with current valuation + gain/loss (F4). */
export default function TreasuryScreen() {
  const [data, setData] = useState<TreasuryData>(DEMO_TREASURY);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiClient.get(endpoints.treasury);
      const d = res.data as TreasuryData;
      if (d && Array.isArray(d.items)) setData(d.items.length ? d : { ...d, items: [] });
    } catch {
      /* keep demo */
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const totalDir = data.total_gain_value > 0 ? "up" : data.total_gain_value < 0 ? "down" : "neutral";

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 py-3 bg-canvas border-b border-surface-variant">
        <Sym name="menu" size={24} color={chronicle.onBackground} />
        <Text className="font-ws-bold text-xl text-primary">Treasury</Text>
        <Pressable onPress={() => router.push("/treasury/edit")} hitSlop={8}>
          <Sym name="add" size={24} color={chronicle.onBackground} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerClassName="px-5 py-4 pb-28"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={chronicle.primary} />
        }
      >
        {/* Net worth summary */}
        <View className="bg-primary rounded-2xl p-5 mb-5">
          <Text className="font-inter text-[12px] text-on-primary opacity-80">
            Total Nilai Harta Saat Ini
          </Text>
          <Text className="font-ws-bold text-3xl text-on-primary mt-1">
            {fmtMoney(data.total_current_value)}
          </Text>
          <View className="flex-row items-center gap-1 mt-2">
            <Sym
              name={DIR[totalDir].sym}
              size={16}
              color={totalDir === "down" ? "#ffb4ab" : "#7ff0c0"}
            />
            <Text
              className="font-inter-semi text-[13px]"
              style={{ color: totalDir === "down" ? "#ffb4ab" : "#7ff0c0" }}
            >
              {fmtMoney(data.total_gain_value)} ({data.total_gain_pct.toFixed(1)}%)
            </Text>
            <Text className="font-inter text-[12px] text-on-primary opacity-70">
              {"  "}vs harga beli
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-ws-semi text-lg text-on-background">Aset Saya</Text>
          <Pressable
            onPress={() => router.push("/treasury/edit")}
            className="flex-row items-center gap-1"
          >
            <Sym name="add" size={16} color={chronicle.primary} />
            <Text className="font-inter-medium text-[13px] text-primary">Tambah Aset</Text>
          </Pressable>
        </View>

        {data.items.length === 0 ? (
          <Text className="font-serif text-on-surface-variant text-center mt-8">
            Belum ada aset. Tambahkan harta Anda untuk memantau naik/turun nilainya.
          </Text>
        ) : (
          <View className="gap-3">
            {data.items.map((a) => (
              <AssetRow key={a.id} a={a} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AssetRow({ a }: { a: AssetView }) {
  const meta = assetMeta(a.asset_type);
  const dir = DIR[a.direction] ?? DIR.neutral;
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/treasury/edit", params: { id: a.id } })}
      className="flex-row items-center gap-3 bg-surface-container-lowest rounded-xl p-4 border border-surface-variant"
    >
      <View className="w-10 h-10 rounded-full bg-surface-container items-center justify-center">
        <Sym name={meta.icon} size={20} color={chronicle.primary} />
      </View>
      <View className="flex-1">
        <Text className="font-ws-semi text-[15px] text-on-surface" numberOfLines={1}>
          {a.name}
        </Text>
        <Text className="font-inter text-[12px] text-on-surface-variant">
          {meta.label}
          {a.quantity !== 1 ? ` · ${a.quantity}${a.symbol ? " " + a.symbol : ""}` : ""}
        </Text>
      </View>
      <View className="items-end">
        <Text className="font-ws-semi text-[15px] text-on-surface">
          {fmtMoney(a.current_value, a.currency)}
        </Text>
        <View className="flex-row items-center gap-0.5">
          <Sym name={dir.sym} size={13} color={dir.color} />
          <Text className={`font-inter-medium text-[12px] ${dir.cls}`}>
            {a.gain_pct > 0 ? "+" : ""}
            {a.gain_pct.toFixed(1)}%
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export { ASSET_TYPES };
