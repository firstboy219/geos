import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';

import { borders, colors, typography } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IoniconName) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: borders.hairline,
        },
        tabBarLabelStyle: {
          fontSize: typography.label.fontSize,
          fontWeight: typography.label.fontWeight,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Analisis', tabBarIcon: tabIcon('home-outline') }}
      />
      <Tabs.Screen
        name="pasar"
        options={{ title: 'Pasar', tabBarIcon: tabIcon('bar-chart-outline') }}
      />
      <Tabs.Screen
        name="vectors"
        options={{ title: 'Vectors', tabBarIcon: tabIcon('pulse-outline') }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{ title: 'Portofolio', tabBarIcon: tabIcon('wallet-outline') }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Profil', tabBarIcon: tabIcon('person-outline') }}
      />
    </Tabs>
  );
}
