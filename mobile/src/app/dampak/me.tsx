import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { Sym } from "@/components/chronicle/Sym";
import {
  EMPTY_PROFILE,
  ProfileFields,
  isProfileComplete,
  profilePatch,
  type ProfileFormState,
} from "@/components/profile/ProfileFields";
import { chronicle } from "@/theme/chronicle";

interface PersonalItem {
  area: string;
  finding: string;
  recommendation: string;
  timeframe: string;
}
interface PersonalResult {
  profile_complete: boolean;
  summary: string;
  items: PersonalItem[];
  disclaimer?: string;
}

/** F3 — "Dampak ke Diri Saya". Requires profile input only if it's incomplete. */
export default function PersonalImpactScreen() {
  const [form, setForm] = useState<ProfileFormState>(EMPTY_PROFILE);
  const [savedComplete, setSavedComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PersonalResult | null>(null);

  // Re-pull profile each time the screen gains focus (e.g. back from edit).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const r = await apiClient.get(endpoints.me);
          const u = r.data ?? {};
          if (!active) return;
          const next: ProfileFormState = {
            profession: u.profession ?? "",
            country: u.country ?? "",
            city: u.city ?? "",
            birthYear: u.birth_year ? String(u.birth_year) : "",
            gender: u.gender ?? "",
          };
          setForm(next);
          setSavedComplete(isProfileComplete(next));
        } catch {
          /* ignore */
        }
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  const liveComplete = isProfileComplete(form);

  const analyze = async (saveFirst: boolean) => {
    setLoading(true);
    setResult(null);
    try {
      if (saveFirst) {
        await apiClient.patch(endpoints.me, profilePatch(form));
        setSavedComplete(true);
      }
      const res = await apiClient.post(endpoints.personalImpact, {});
      setResult(res.data as PersonalResult);
    } catch {
      setResult({
        profile_complete: true,
        summary: "Gagal menganalisa. Periksa koneksi lalu coba lagi.",
        items: [],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-5 py-3 bg-canvas border-b border-surface-variant">
        <Pressable onPress={() => router.back()}>
          <Sym name="arrow_back" size={24} color={chronicle.onBackground} />
        </Pressable>
        <Text className="font-ws-bold text-xl text-primary">Dampak ke Diri Saya</Text>
      </View>

      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerClassName="px-5 py-4 pb-24"
        keyboardShouldPersistTaps="handled"
      >
        {savedComplete ? (
          // Profile already filled → summary + analyze directly.
          <View className="bg-surface-container-low rounded-xl p-4 mb-5">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="font-ws-semi text-[15px] text-on-surface">Profil Anda</Text>
              <Pressable onPress={() => router.push("/profile/edit")}>
                <Text className="font-inter-medium text-[13px] text-primary">Ubah</Text>
              </Pressable>
            </View>
            <Text className="font-serif text-[14px] text-on-surface-variant leading-relaxed">
              {form.profession}
              {form.city ? ` · ${form.city}` : ""}
              {form.country ? `, ${form.country}` : ""}
              {form.birthYear ? ` · ${form.birthYear}` : ""}
              {form.gender ? ` · ${form.gender}` : ""}
            </Text>
          </View>
        ) : (
          // Profile incomplete → user must input the required data here.
          <View className="mb-5">
            <View className="flex-row items-start gap-2 bg-warning-amber/10 rounded-lg p-3 mb-4">
              <Sym name="info" size={18} color={chronicle.amber} style={{ marginTop: 1 }} />
              <Text className="flex-1 font-serif text-[14px] text-on-surface leading-relaxed">
                Lengkapi data berikut agar AI dapat menganalisa dampak yang spesifik
                untuk Anda. Anda juga bisa mengisinya di halaman Profil.
              </Text>
            </View>
            <ProfileFields value={form} onChange={setForm} />
          </View>
        )}

        <Pressable
          onPress={() => analyze(!savedComplete)}
          disabled={loading || !liveComplete}
          className={`flex-row items-center justify-center gap-2 rounded-full py-3.5 ${
            liveComplete ? "bg-primary" : "bg-surface-container-high"
          }`}
        >
          {loading ? (
            <ActivityIndicator color={chronicle.onPrimary} />
          ) : (
            <>
              <Sym
                name="auto_awesome"
                size={18}
                color={liveComplete ? chronicle.onPrimary : chronicle.onSurfaceVariant}
              />
              <Text
                className={`font-inter-semi text-[14px] ${
                  liveComplete ? "text-on-primary" : "text-on-surface-variant"
                }`}
              >
                {!liveComplete
                  ? "Lengkapi Profesi & Negara dulu"
                  : savedComplete
                    ? result
                      ? "Analisa Ulang"
                      : "Analisa Dampak ke Saya"
                    : "Simpan & Analisa"}
              </Text>
            </>
          )}
        </Pressable>

        {result ? (
          <View className="mt-6">
            {result.summary ? (
              <View className="bg-primary/10 rounded-xl p-4 mb-4">
                <Text className="font-serif text-[15px] text-on-surface leading-relaxed">
                  {result.summary}
                </Text>
              </View>
            ) : null}

            <View className="gap-3">
              {result.items.map((it, i) => (
                <View
                  key={i}
                  className="bg-surface-container-lowest rounded-xl p-4 border border-surface-variant"
                >
                  <Text className="font-ws-semi text-[15px] text-on-surface mb-1">
                    {it.area}
                    {it.timeframe ? (
                      <Text className="font-inter text-[12px] text-on-surface-variant">
                        {"  ·  "}
                        {it.timeframe}
                      </Text>
                    ) : null}
                  </Text>
                  {it.finding ? (
                    <Text className="font-serif text-[14px] text-on-surface-variant leading-relaxed">
                      {it.finding}
                    </Text>
                  ) : null}
                  {it.recommendation ? (
                    <View className="flex-row gap-2 mt-2">
                      <Sym name="lightbulb" size={16} color={chronicle.secondary} style={{ marginTop: 2 }} />
                      <Text className="flex-1 font-serif text-[14px] text-on-surface leading-relaxed">
                        {it.recommendation}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>

            {result.disclaimer ? (
              <Text className="font-inter text-[11px] text-on-surface-variant opacity-70 mt-4">
                {result.disclaimer}
              </Text>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
