import { Text, View } from 'react-native';

import { WORLD_STATUS } from '@/data/home';

import { toneClasses } from './tone';

/**
 * World Status hero card: status pill + description + a 2×2 metric grid
 * (7 monitored / 3 urgent / 16 AI layers / −8% portfolio impact).
 */
export function WorldStatusHero() {
  return (
    <View className="rounded-[16px] border-[0.5px] border-border bg-surface p-[14px]">
      <Text className="text-[10px] font-medium tracking-[0.4px] text-textSecondary">
        {WORLD_STATUS.label}
      </Text>

      <View
        className="mt-2 flex-row items-center self-start rounded-pill border-[0.5px] px-3 py-[5px]"
        style={{ backgroundColor: '#3D2000', borderColor: '#7A4800' }}
      >
        <View className="h-2 w-2 rounded-full bg-warning" />
        <Text className="ml-2 text-[13px] font-medium text-warning">
          {WORLD_STATUS.statusText}
        </Text>
      </View>

      <Text className="mt-2 text-[13px] leading-[19px]" style={{ color: '#8B9FB8' }}>
        {WORLD_STATUS.description}
      </Text>

      <View className="mt-[10px] flex-row flex-wrap justify-between">
        {WORLD_STATUS.cells.map((c) => (
          <View
            key={c.label}
            className="mb-[7px] w-[48.5%] items-center justify-center rounded-inner bg-surfaceAlt px-3 py-2"
          >
            <Text className={`text-[22px] font-medium ${toneClasses(c.color).fg}`}>
              {c.value}
            </Text>
            <Text className="mt-[2px] text-center text-[11px] leading-[14px] text-textMuted">
              {c.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
