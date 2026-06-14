import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { GeoLogo } from '@/components';
import { colors } from '@/theme';

/**
 * Home top bar: GEOSCAN wordmark, an EN/ID language toggle, and a bell button
 * with a red unread dot.
 */
export function TopBar({
  lang,
  onToggleLang,
  hasUnread = true,
}: {
  lang: string;
  onToggleLang: () => void;
  hasUnread?: boolean;
}) {
  return (
    <View className="flex-row items-center border-b border-borderSubtle px-[18px] py-[10px]">
      <GeoLogo />
      <View className="flex-1" />
      <Pressable
        onPress={onToggleLang}
        hitSlop={6}
        className="rounded-md border border-accentBorder bg-accentDark px-[7px] py-[3px]"
      >
        <Text className="text-[11px] font-medium text-accent">{lang}</Text>
      </Pressable>
      <Pressable hitSlop={6} className="ml-[10px] h-8 w-8">
        <View className="h-8 w-8 items-center justify-center rounded-full border border-border bg-surface">
          <Ionicons name="notifications-outline" size={16} color={colors.textSecondary} />
        </View>
        {hasUnread && (
          <View className="absolute right-[1px] top-[1px] h-[7px] w-[7px] rounded-full border border-background bg-danger" />
        )}
      </Pressable>
    </View>
  );
}
