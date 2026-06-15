import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/state";

export default function WhatsappLoginScreen() {
  const { requestWaOtp, verifyWaOtp, loading, error } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const onRequest = async () => {
    if (phone.trim().length < 8) return;
    const ok = await requestWaOtp(phone);
    if (ok) setStep("otp");
  };

  const onVerify = async () => {
    const ok = await verifyWaOtp(phone, code);
    if (ok) router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center px-6">
        <Text className="text-2xl font-semibold text-textPrimary text-center">
          GEO<Text className="text-accent">SCAN</Text>
        </Text>
        <Text className="text-textMuted text-xs text-center mt-1 mb-8">
          Masuk dengan WhatsApp
        </Text>

        {error ? (
          <View className="bg-dangerDark border border-dangerBorder rounded-lg px-3 py-2 mb-4">
            <Text className="text-danger text-sm">{error}</Text>
          </View>
        ) : null}

        {step === "phone" ? (
          <>
            <Text className="text-textSecondary text-sm mb-1">Nomor WhatsApp</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="08xxxxxxxxxx"
              placeholderTextColor="#6E7681"
              className="bg-surface border border-border rounded-lg px-3 py-3 text-textPrimary mb-4"
            />
            <Pressable
              onPress={onRequest}
              disabled={loading}
              className="bg-accent rounded-lg py-3 items-center"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-medium">Kirim kode OTP</Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <Text className="text-textSecondary text-sm mb-1">
              Kode OTP (dikirim ke WhatsApp {phone})
            </Text>
            <TextInput
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="6 digit"
              placeholderTextColor="#6E7681"
              className="bg-surface border border-border rounded-lg px-3 py-3 text-textPrimary mb-4 tracking-widest text-center"
            />
            <Pressable
              onPress={onVerify}
              disabled={loading}
              className="bg-accent rounded-lg py-3 items-center"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-medium">Verifikasi & Masuk</Text>
              )}
            </Pressable>
            <Pressable onPress={() => setStep("phone")} className="py-3 items-center">
              <Text className="text-textSecondary text-sm">Ganti nomor</Text>
            </Pressable>
          </>
        )}

        <Pressable onPress={() => router.replace("/(auth)/login")} className="py-4 items-center">
          <Text className="text-accent text-sm">← Masuk dengan email</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
