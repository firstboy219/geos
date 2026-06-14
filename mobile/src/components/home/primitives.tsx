import { Text, View } from 'react-native';

import type { ToneKey } from '@/data/home';

import { toneClasses } from './tone';

/**
 * NativeWind building blocks shared across the home analysis widgets:
 * a tinted tone tag, a probability/confidence bar, and a labelled metric row.
 */

/** A small tinted "tone" tag (non-interactive label). */
export function ToneTag({
  label,
  tone,
  rounded = 'rounded-chip',
}: {
  label: string;
  tone: ToneKey;
  rounded?: string;
}) {
  const t = toneClasses(tone);
  return (
    <View
      className={`self-start border px-[7px] py-[2px] ${rounded} ${t.bg} ${t.border}`}
    >
      <Text className={`text-[11px] font-medium ${t.fg}`}>{label}</Text>
    </View>
  );
}

/** A horizontal progress bar (track + tone fill). */
export function ToneBar({
  percent,
  tone,
  height = 6,
}: {
  percent: number;
  tone: ToneKey;
  height?: number;
}) {
  const t = toneClasses(tone);
  const pct = Math.max(0, Math.min(100, percent));
  return (
    <View
      className="w-full overflow-hidden rounded-full bg-border"
      style={{ height }}
    >
      <View
        className={`h-full rounded-full ${t.dot}`}
        style={{ width: `${pct}%` }}
      />
    </View>
  );
}

/** A labelled metric bar row: `label … track … percent%`. */
export function MetricBarRow({
  label,
  percent,
  tone,
}: {
  label: string;
  percent: number;
  tone: ToneKey;
}) {
  return (
    <View className="mb-[5px] flex-row items-center">
      <Text className="flex-1 text-[12px] text-[#C9D1D9]">{label}</Text>
      <View className="ml-2 w-[72px]">
        <ToneBar percent={percent} tone={tone} height={5} />
      </View>
      <Text className="w-8 text-right text-[12px] font-medium text-textPrimary">
        {percent}%
      </Text>
    </View>
  );
}

/** A small uppercase micro-label used as an in-card sub-heading. */
export function MicroLabel({ text, trailing }: { text: string; trailing?: string }) {
  return (
    <View className="flex-row flex-wrap items-baseline">
      <Text className="text-[10px] font-medium tracking-[0.4px] text-textSecondary">
        {text.toUpperCase()}
      </Text>
      {trailing != null && (
        <Text className="ml-1 text-[11px] text-textMuted"> {trailing}</Text>
      )}
    </View>
  );
}
