import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { PORTFOLIO_NUDGE_ROWS } from '@/data/home';
import { colors } from '@/theme';

import { toneClasses } from './tone';

/** Portfolio-impact nudge card with weighted rows + a rebalancing CTA. */
export function PortfolioNudge({ onRebalance }: { onRebalance?: () => void }) {
  return (
    <View className="rounded-card border-[0.5px] border-border bg-surface p-[14px]">
      <View className="flex-row items-center">
        <View className="h-7 w-7 items-center justify-center rounded-chip bg-warningDark">
          <Ionicons name="wallet-outline" size={15} color={colors.warning} />
        </View>
        <Text className="ml-2 text-[12px] font-medium text-textPrimary">
          Dampak ke portofolio Anda
        </Text>
      </View>

      <Text className="mt-2 text-[12px] leading-[18px]" style={{ color: '#8B9FB8' }}>
        Berdasarkan probabilitas tertimbang semua skenario aktif:
      </Text>

      <View className="mt-[10px]">
        {PORTFOLIO_NUDGE_ROWS.map((r) => {
          const t = toneClasses(r.tone);
          return (
            <View key={r.label} className="mb-[6px] flex-row items-center">
              <View className={`h-2 w-2 rounded-full ${t.dot}`} />
              <Text className="ml-2 flex-1 text-[12px] text-[#C9D1D9]">{r.label}</Text>
              <Text className={`text-[12px] font-medium ${t.fg}`}>{r.impact}</Text>
            </View>
          );
        })}
      </View>

      <View className="my-2 h-[0.5px] bg-borderSubtle" />

      <Pressable
        onPress={onRebalance}
        className="w-full items-center rounded-inner border-[0.5px] border-accent bg-accentDark py-[10px]"
      >
        <Text className="text-[13px] font-medium text-accent">
          Lihat rekomendasi rebalancing →
        </Text>
      </Pressable>
    </View>
  );
}
