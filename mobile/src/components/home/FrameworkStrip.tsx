import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { FRAMEWORK_CHIPS } from '@/data/home';
import { colors } from '@/theme';

import { ToneTag } from './primitives';

/**
 * Collapsible 16-layer framework strip. Tap the header to reveal a wrap of all
 * layer chips; the temporal (P) chip reflects the active analysis period.
 */
export function FrameworkStrip({ periodLabel }: { periodLabel: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Pressable
      onPress={() => setOpen((v) => !v)}
      className="rounded-cardSm border-[0.5px] border-border bg-surface p-[14px]"
    >
      <View className="flex-row items-center">
        <View className="flex-1">
          <Text className="text-[12px] font-medium text-textPrimary">
            Geoscan Framework v3.0 — 16 Lapisan AI Aktif
          </Text>
          <Text className="mt-[2px] text-[11px] text-textMuted">
            Tap untuk lihat semua faktor yang sedang berjalan
          </Text>
        </View>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textSecondary}
        />
      </View>
      {open && (
        <View className="mt-2 flex-row flex-wrap gap-[3px]">
          {FRAMEWORK_CHIPS.map((c) => (
            <ToneTag
              key={c.label}
              label={c.label.replace('{P}', periodLabel)}
              tone={c.tone}
            />
          ))}
        </View>
      )}
    </Pressable>
  );
}
