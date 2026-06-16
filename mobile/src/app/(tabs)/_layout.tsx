import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { Sym } from '@/components/chronicle/Sym';
import { chronicle } from '@/theme/chronicle';

function tabIcon(name: string) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Sym name={name} color={color as string} size={size} />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: chronicle.primary,
        tabBarInactiveTintColor: chronicle.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: chronicle.canvas,
          borderTopColor: chronicle.surfaceVariant,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
        },
        sceneStyle: { backgroundColor: chronicle.canvas },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Beranda', tabBarIcon: tabIcon('home') }}
      />
      <Tabs.Screen
        name="analisa"
        options={{ title: 'Situasi', tabBarIcon: tabIcon('schedule') }}
      />
      <Tabs.Screen
        name="dampak"
        options={{ title: 'Dampak', tabBarIcon: tabIcon('thermostat') }}
      />
      <Tabs.Screen
        name="treasury"
        options={{ title: 'Treasury', tabBarIcon: tabIcon('diamond') }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Profil', tabBarIcon: tabIcon('person') }}
      />
      {/* Routes kept for deep-links but not shown as their own tab. */}
      <Tabs.Screen name="vectors" options={{ href: null }} />
      <Tabs.Screen name="pasar" options={{ href: null }} />
      <Tabs.Screen name="portfolio" options={{ href: null }} />
    </Tabs>
  );
}
