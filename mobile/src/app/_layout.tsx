import "../../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import {
  WorkSans_600SemiBold,
  WorkSans_700Bold,
} from "@expo-google-fonts/work-sans";
import {
  SourceSerif4_400Regular,
  SourceSerif4_400Regular_Italic,
} from "@expo-google-fonts/source-serif-4";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { MaterialSymbols_400Regular } from "@expo-google-fonts/material-symbols";

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
  const [fontsLoaded] = useFonts({
    WorkSans_600SemiBold,
    WorkSans_700Bold,
    SourceSerif4_400Regular,
    SourceSerif4_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    MaterialSymbols_400Regular,
  });

  if (!fontsLoaded) return null;

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
          <Stack.Screen name="dampak/me" />
          <Stack.Screen name="profile/edit" />
          <Stack.Screen name="treasury/edit" />
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
