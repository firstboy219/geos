import { Pressable, Text, View } from 'react-native';

/** The analysis horizon options (Temporal Calibration — Layer P). */
export type AnalysisPeriod = 'h72' | 'd90' | 'y5';

const ITEMS: { key: AnalysisPeriod; title: string; subtitle: string }[] = [
  { key: 'h72', title: '72 Jam', subtitle: 'Peringatan dini · Tripwire dominan' },
  { key: 'd90', title: '30–90 Hari', subtitle: 'Semua 16 faktor aktif' },
  { key: 'y5', title: '1–5 Tahun', subtitle: 'Faktor struktural dominan' },
];

/** Resolves a period into the short label used by the framework strip. */
export function periodLabel(value: AnalysisPeriod): string {
  switch (value) {
    case 'h72':
      return '72 Jam';
    case 'y5':
      return '1–5 Tahun';
    case 'd90':
    default:
      return '90 Hari';
  }
}

/**
 * Period selector = Temporal Calibration (Layer P). Three selectable tabs, each
 * with a sub-label describing how the AI re-weights for that horizon.
 */
export function PeriodSelector({
  value,
  onChange,
}: {
  value: AnalysisPeriod;
  onChange: (p: AnalysisPeriod) => void;
}) {
  return (
    <View className="rounded-cardSm border-[0.5px] border-border bg-surface px-3 py-[10px]">
      <Text className="text-[12px]">
        <Text className="text-textPrimary">🕐 </Text>
        <Text className="font-semibold text-textPrimary">Horizon analisis</Text>
        <Text className="text-[11px] text-textMuted">
          {' '}
          — Bobot AI berubah otomatis sesuai pilihan
        </Text>
      </Text>
      <View className="mt-2 flex-row">
        {ITEMS.map((item, i) => {
          const selected = value === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => onChange(item.key)}
              className={`flex-1 rounded-chip border-[0.5px] px-1 py-[6px] ${
                i < ITEMS.length - 1 ? 'mr-1' : ''
              } ${
                selected
                  ? 'border-accent bg-accentDark'
                  : 'border-borderSubtle bg-surfaceAlt'
              }`}
            >
              <Text
                className={`text-center text-[11px] font-medium ${
                  selected ? 'text-accent' : 'text-textSecondary'
                }`}
              >
                {item.title}
              </Text>
              <Text
                className={`mt-[2px] text-center text-[10px] leading-[13px] ${
                  selected ? 'text-accent' : 'text-textMuted'
                }`}
              >
                {item.subtitle}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
