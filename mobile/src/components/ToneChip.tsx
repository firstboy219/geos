import { StyleSheet, Text, View } from 'react-native';

import { borders, colors, radii, typography } from '@/theme';

/**
 * A "signal tone" colour triple used by tinted chips/bars across analysis &
 * market screens (ported from the Flutter `SignalTone`).
 */
export interface SignalTone {
  fg: string;
  bg: string;
  border: string;
}

/** Common preset tones derived from the palette semantics. */
export const tones = {
  neutral: { fg: colors.textSecondary, bg: colors.surface, border: colors.border },
  positive: { fg: colors.success, bg: colors.successDark, border: colors.successBorder },
  warning: { fg: colors.warning, bg: colors.warningDark, border: colors.warningBorder },
  negative: { fg: colors.danger, bg: colors.dangerDark, border: colors.dangerBorder },
  accent: { fg: colors.accent, bg: colors.accentDark, border: colors.accentBorder },
  critical: { fg: colors.purple, bg: colors.purpleDark, border: colors.purpleBorder },
} as const satisfies Record<string, SignalTone>;

/** A small tinted "tone" chip: a rounded label colored from a SignalTone. */
export interface ToneChipProps {
  label: string;
  tone: SignalTone;
  bold?: boolean;
  radius?: number;
}

export function ToneChip({
  label,
  tone,
  bold = true,
  radius = radii.chip,
}: ToneChipProps) {
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: tone.bg, borderColor: tone.border, borderRadius: radius },
      ]}
    >
      <Text
        style={[
          typography.caption,
          { color: tone.fg, fontWeight: bold ? '500' : '400' },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: borders.hairline,
  },
});
