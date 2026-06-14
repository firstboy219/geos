import "../../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { colors } from "@/theme";
import { Providers } from "@/state";

// SDK 56: expo-router no longer uses @react-navigation/native theming.
// We theme the navigator directly via Stack screenOptions (dark palette).
const headerOptions = {
  headerShown: true as const,
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.textPrimary,
  headerTitleStyle: { color: colors.textPrimary },
  contentStyle: { backgroundColor: colors.background },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Providers>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="vectors/[crisisId]"
            options={{ ...headerOptions, title: "Impact Vector" }}
          />
          <Stack.Screen
            name="portfolio/impact"
            options={{ ...headerOptions, title: "Dampak Portofolio" }}
          />
        </Stack>
      </Providers>
    </GestureHandlerRootView>
  );
}
