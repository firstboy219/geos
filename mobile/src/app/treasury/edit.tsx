import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { Sym } from "@/components/chronicle/Sym";
import { ASSET_TYPES, type AssetView, type TreasuryData } from "@/data/treasury";
import { chronicle } from "@/theme/chronicle";

function Field({
  label, value, onChangeText, placeholder, keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View className="mb-3">
      <Text className="font-inter-medium text-[12px] text-on-surface-variant mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={chronicle.onSurfaceVariant}
        keyboardType={keyboardType ?? "default"}
        className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-3 font-serif text-[15px] text-on-surface"
      />
    </View>
  );
}

/** Add / edit a Treasury asset (F4). */
export default function AssetEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = !!id;

  const [type, setType] = useState("house");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [buyPrice, setBuyPrice] = useState("");
  const [buyDate, setBuyDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    (async () => {
      try {
        const res = await apiClient.get(endpoints.treasury);
        const d = res.data as TreasuryData;
        const a = d.items.find((x: AssetView) => x.id === id);
        if (a) {
          setType(a.asset_type);
          setName(a.name);
          setSymbol(a.symbol ?? "");
          setQuantity(String(a.quantity));
          setBuyPrice(String(a.buy_price));
          setBuyDate(a.buy_date ?? "");
        }
      } catch {
        /* ignore */
      }
    })();
  }, [editing, id]);

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert("Lengkapi", "Nama aset wajib diisi.");
      return;
    }
    setSaving(true);
    const body: Record<string, unknown> = {
      asset_type: type,
      name: name.trim(),
      symbol: symbol.trim() || null,
      quantity: Number(quantity) || 1,
      buy_price: buyPrice ? Number(buyPrice) : null,
      buy_date: buyDate.trim() || null,
    };
    try {
      if (editing) await apiClient.patch(endpoints.treasuryAsset(id!), body);
      else await apiClient.post(endpoints.treasury, body);
      router.back();
    } catch {
      Alert.alert("Gagal", "Tidak dapat menyimpan aset. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    Alert.alert("Hapus aset", "Yakin menghapus aset ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete(endpoints.treasuryAsset(id!));
            router.back();
          } catch {
            Alert.alert("Gagal", "Tidak dapat menghapus.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-5 py-3 bg-canvas border-b border-surface-variant">
        <Pressable onPress={() => router.back()}>
          <Sym name="arrow_back" size={24} color={chronicle.onBackground} />
        </Pressable>
        <Text className="font-ws-bold text-xl text-primary">
          {editing ? "Ubah Aset" : "Tambah Aset"}
        </Text>
      </View>

      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerClassName="px-5 py-4 pb-24"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-inter-medium text-[12px] text-on-surface-variant mb-2">
          Jenis Aset
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {ASSET_TYPES.map((t) => (
            <Pressable
              key={t.value}
              onPress={() => setType(t.value)}
              className={`flex-row items-center gap-1 px-3 py-2 rounded-full border ${
                type === t.value
                  ? "bg-on-background border-on-background"
                  : "border-outline-variant"
              }`}
            >
              <Sym
                name={t.icon}
                size={15}
                color={type === t.value ? chronicle.onPrimary : chronicle.onSurfaceVariant}
              />
              <Text
                className={`font-inter-medium text-[13px] ${
                  type === t.value ? "text-on-primary" : "text-on-surface-variant"
                }`}
              >
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Field label="Nama Aset *" value={name} onChangeText={setName} placeholder="cth: Rumah Surabaya, BTC, Emas Antam" />
        <Field label="Simbol pasar (opsional)" value={symbol} onChangeText={setSymbol} placeholder="cth: BTC, XAU, USD (untuk harga otomatis)" />
        <Field label="Jumlah" value={quantity} onChangeText={(t) => setQuantity(t.replace(/[^0-9.]/g, ""))} placeholder="1" keyboardType="numeric" />
        <Field label="Harga beli per unit (opsional)" value={buyPrice} onChangeText={(t) => setBuyPrice(t.replace(/[^0-9.]/g, ""))} placeholder="kosongkan → sistem buat estimasi (bisa diedit)" keyboardType="numeric" />
        <Field label="Tanggal beli (opsional)" value={buyDate} onChangeText={setBuyDate} placeholder="YYYY-MM-DD" />

        <Pressable
          onPress={onSave}
          disabled={saving}
          className="flex-row items-center justify-center gap-2 bg-primary rounded-full py-3.5 mt-4"
        >
          {saving ? (
            <ActivityIndicator color={chronicle.onPrimary} />
          ) : (
            <Text className="font-inter-semi text-[14px] text-on-primary">Simpan</Text>
          )}
        </Pressable>

        {editing ? (
          <Pressable onPress={onDelete} className="items-center py-4 mt-1">
            <Text className="font-inter-medium text-[13px] text-error-rose">Hapus Aset</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
