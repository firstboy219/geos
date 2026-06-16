import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useAuth } from "@/state";
import { chronicle } from "@/theme/chronicle";

/** Circular profile avatar (initials) — replaces the old menu icon top-left.
 * Tapping it opens the Profile tab. */
export function Avatar({ size = 36 }: { size?: number }) {
  const { user } = useAuth();
  const name = (user?.fullName || "Pengguna").trim();
  const initials =
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase() || "U";
  return (
    <Pressable onPress={() => router.push("/(tabs)/account")} hitSlop={8}>
      <View
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: chronicle.primaryContainer }}
        className="items-center justify-center"
      >
        <Text className="font-inter-bold text-on-primary" style={{ fontSize: size * 0.38 }}>
          {initials}
        </Text>
      </View>
    </Pressable>
  );
}
