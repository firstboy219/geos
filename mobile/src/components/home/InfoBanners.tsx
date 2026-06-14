import { Text, View } from 'react-native';

import { SHOCK_BANNER, TDI_BANNER } from '@/data/home';

import { ToneTag } from './primitives';

/** Shock Multiplier (Layer M) callout banner. */
export function ShockBanner() {
  return (
    <View
      className="flex-row items-start rounded-inner border-[0.5px] px-3 py-[9px]"
      style={{ backgroundColor: '#1A1208', borderColor: '#7A4800' }}
    >
      <Text className="text-[18px]">{SHOCK_BANNER.emoji}</Text>
      <View className="ml-2 flex-1">
        <Text className="text-[12px] font-medium text-warning">
          {SHOCK_BANNER.title}
          <Text className="text-[11px] font-normal" style={{ color: '#8B9FB8' }}>
            {' '}
            — {SHOCK_BANNER.subtitle}
          </Text>
        </Text>
        <Text
          className="mt-[3px] text-[11px] leading-[16px]"
          style={{ color: '#8B9FB8' }}
        >
          {SHOCK_BANNER.body}
        </Text>
        <View className="mt-[5px] flex-row flex-wrap gap-[5px]">
          {SHOCK_BANNER.chips.map((c) => (
            <ToneTag key={c.label} label={c.label} tone={c.tone} />
          ))}
        </View>
      </View>
    </View>
  );
}

/** Technology Disruption Index (Layer N) callout banner. */
export function TdiBanner() {
  return (
    <View
      className="flex-row items-start rounded-inner border-[0.5px] px-3 py-[9px]"
      style={{ backgroundColor: '#0D1020', borderColor: '#3D2080' }}
    >
      <Text className="text-[18px]">{TDI_BANNER.emoji}</Text>
      <View className="ml-2 flex-1">
        <Text className="text-[12px] font-medium text-purple">
          {TDI_BANNER.title}
          <Text className="text-[11px] font-normal" style={{ color: '#8B9FB8' }}>
            {' '}
            — {TDI_BANNER.subtitle}
          </Text>
        </Text>
        <Text
          className="mt-[3px] text-[11px] leading-[16px]"
          style={{ color: '#8B9FB8' }}
        >
          {TDI_BANNER.bodyPrefix}
          <Text className="font-medium text-danger">{TDI_BANNER.bodyHighlight}</Text>
          {TDI_BANNER.bodySuffix}
        </Text>
        <View className="mt-[5px] flex-row flex-wrap gap-[5px]">
          {TDI_BANNER.chips.map((c) => (
            <ToneTag key={c.label} label={c.label} tone={c.tone} />
          ))}
        </View>
      </View>
    </View>
  );
}
