import { StyleSheet, Text, View } from 'react-native';

import { GeoCard, tones, type SignalTone } from '@/components';
import { PORTFOLIO_CELLS, type PortfolioCell } from '@/data/pasar';
import { colors, radii, spacing, typography } from '@/theme';

/** Portfolio ringkasan — 4-grid summary (component #3). */
export function PortfolioSummary() {
  return (
    <GeoCard>
      <Text style={styles.title}>Portofolio Anda</Text>
      <Text style={[typography.caption, styles.subtitle]}>
        Dampak geopolitik tertimbang real-time
      </Text>
      <View style={styles.grid}>
        {PORTFOLIO_CELLS.map((cell) => (
          <Cell key={cell.label} {...cell} />
        ))}
      </View>
    </GeoCard>
  );
}

function Cell({ value, label, tone }: PortfolioCell) {
  const valueColor: string =
    tone === (tones.neutral as SignalTone) ? colors.textPrimary : tone.fg;
  return (
    <View style={styles.cell}>
      <Text style={[styles.value, { color: valueColor }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[typography.caption, styles.cellLabel]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.bodySm,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  subtitle: {
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm + 2,
    gap: 7,
  },
  cell: {
    // two columns minus the 7px gap
    width: '48.5%',
    flexGrow: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.inner,
    paddingHorizontal: 11,
    paddingVertical: 9,
    justifyContent: 'center',
  },
  value: {
    ...typography.title,
    fontSize: 18,
  },
  cellLabel: {
    marginTop: 2,
    lineHeight: 14,
  },
});
