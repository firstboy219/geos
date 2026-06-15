import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { Sym } from "@/components/chronicle/Sym";
import {
  EMPTY_PROFILE,
  ProfileFields,
  profilePatch,
  type ProfileFormState,
} from "@/components/profile/ProfileFields";
import { chronicle } from "@/theme/chronicle";

/** Profile / personal data editor (used for personal impact analysis). */
export default function ProfileEditScreen() {
  const [form, setForm] = useState<ProfileFormState>(EMPTY_PROFILE);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await apiClient.get(endpoints.me);
        const u = r.data ?? {};
        setForm({
          profession: u.profession ?? "",
          country: u.country ?? "",
          city: u.city ?? "",
          birthYear: u.birth_year ? String(u.birth_year) : "",
          gender: u.gender ?? "",
        });
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch(endpoints.me, profilePatch(form));
      router.back();
    } catch {
      Alert.alert("Gagal", "Tidak dapat menyimpan data. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-5 py-3 bg-canvas border-b border-surface-variant">
        <Pressable onPress={() => router.back()}>
          <Sym name="arrow_back" size={24} color={chronicle.onBackground} />
        </Pressable>
        <Text className="font-ws-bold text-xl text-primary">Data Pribadi</Text>
      </View>

      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerClassName="px-5 py-4 pb-24"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-serif text-[15px] text-on-surface-variant leading-relaxed mb-5">
          Data ini dipakai untuk menganalisa dampak situasi terhadap Anda secara
          personal. Tanda * wajib diisi.
        </Text>

        <ProfileFields value={form} onChange={setForm} />

        <Pressable
          onPress={onSave}
          disabled={saving}
          className="flex-row items-center justify-center gap-2 bg-primary rounded-full py-3.5 mt-6"
        >
          {saving ? (
            <ActivityIndicator color={chronicle.onPrimary} />
          ) : (
            <Text className="font-inter-semi text-[14px] text-on-primary">Simpan</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
