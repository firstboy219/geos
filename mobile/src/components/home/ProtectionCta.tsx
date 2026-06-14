import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/theme';

/** Blue CTA banner: "Ada 3 langkah yang bisa Anda ambil sekarang". */
export function ProtectionCta({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-cardSm border-[0.5px] border-accent bg-accentDark px-[13px] py-[11px]"
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-inner"
        style={{ backgroundColor: '#1A3A6A' }}
      >
        <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent} />
      </View>
      <View className="ml-[9px] flex-1">
        <Text className="text-[12px] font-medium text-textPrimary">
          Ada 3 langkah yang bisa Anda ambil sekarang
        </Text>
        <Text className="mt-[2px] text-[11px]" style={{ color: '#8B9FB8' }}>
          Lindungi portofolio dari risiko aktif
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.accent} />
    </Pressable>
  );
}
