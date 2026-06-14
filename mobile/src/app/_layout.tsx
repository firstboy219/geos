import "../../global.css";
import {
  DarkTheme,
  ThemeProvider,
  type Theme,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { colors } from '@/theme';
import { Providers } from '@/state';

/** Navigation theme tinted with the Geoscan dark palette. */
const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    text: colors.textPrimary,
    primary: colors.accent,
    notification: colors.danger,
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Providers>
        <ThemeProvider value={navTheme}>
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
            <Stack.Screen name="vectors/[crisisId]" options={{ headerShown: true, title: 'Vector' }} />
            <Stack.Screen
              name="portfolio/impact"
              options={{ headerShown: true, title: 'Portfolio Impact' }}
            />
          </Stack>
        </ThemeProvider>
      </Providers>
    </GestureHandlerRootView>
  );
}
