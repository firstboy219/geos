import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { toneFor, type AlertItem, type ToneKey } from '@/data/home';

import { ToneTag } from './primitives';
import { toneClasses } from './tone';

// Ionicons needs a concrete color; resolve the tone foreground hex.
function iconColor(tone: ToneKey): string {
  return toneFor(tone).fg;
}

/** "Peringatan terbaru" alerts list (icon + title + meta + tone badge). */
export function AlertsList({ alerts }: { alerts: AlertItem[] }) {
  return (
    <View className="rounded-card border-[0.5px] border-border bg-surface px-[14px] py-1">
      {alerts.map((a, i) => {
        const t = toneClasses(a.tone);
        return (
          <View
            key={`${a.title}-${i}`}
            className={`flex-row items-start py-[10px] ${
              i < alerts.length - 1 ? 'border-b-[0.5px] border-borderSubtle' : ''
            }`}
          >
            <View className={`h-[30px] w-[30px] items-center justify-center rounded-[9px] ${t.bg}`}>
              <Ionicons
                name={a.icon as keyof typeof Ionicons.glyphMap}
                size={14}
                color={iconColor(a.tone)}
              />
            </View>
            <View className="ml-2 flex-1">
              <Text className="text-[12px] font-medium text-textPrimary">{a.title}</Text>
              <Text className="mt-[1px] text-[11px] text-textMuted">{a.meta}</Text>
            </View>
            <View className="ml-[6px]">
              <ToneTag label={a.badge} tone={a.tone} />
            </View>
          </View>
        );
      })}
    </View>
  );
}
