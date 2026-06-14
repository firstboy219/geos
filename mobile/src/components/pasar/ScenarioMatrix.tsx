import { StyleSheet, Text, View } from 'react-native';

import { GeoCard, type SignalTone } from '@/components';
import { MATRIX_LEGEND, MATRIX_ROWS, MATRIX_SCENARIOS, type MatrixRow } from '@/data/pasar';
import { colors, radii, spacing, typography } from '@/theme';

const LABEL_WIDTH = 88;
const CELL_GAP = 3;

/**
 * Skenario × Pasar matrix (component #4): S1..S4 columns × asset-class rows,
 * every cell colored and labelled with its expected direction.
 */
export function ScenarioMatrix() {
  return (
    <GeoCard radius={radii.cardSm} style={styles.card}>
      <Text style={styles.heading}>Dampak Skenario ke Kelas Aset</Text>
      <Text style={[typography.caption, styles.headingSub]}>
        Tap setiap sel untuk detail · Probabilitas tertimbang
      </Text>

      <View style={styles.headerRow}>
        <View style={styles.labelSpacer} />
        {MATRIX_SCENARIOS.map((scn) => (
          <Cell key={scn.id} label={`${scn.id} · ${scn.probability}%`} tone={scn.tone} />
        ))}
      </View>

      {MATRIX_ROWS.map((row) => (
        <BodyRow key={row.label} row={row} />
      ))}

      <Text style={[typography.caption, styles.legend]}>{MATRIX_LEGEND}</Text>
    </GeoCard>
  );
}

function BodyRow({ row }: { row: MatrixRow }) {
  return (
    <View style={styles.bodyRow}>
      <Text style={[typography.bodySm, styles.rowLabel]}>{row.label}</Text>
      {row.cells.map((cell, i) => (
        <Cell key={i} label={cell.label} tone={cell.tone} />
      ))}
    </View>
  );
}

function Cell({ label, tone }: { label: string; tone: SignalTone }) {
  return (
    <View style={[styles.cell, { backgroundColor: tone.bg }]}>
      <Text style={[typography.caption, { color: tone.fg, fontWeight: '500' }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
  },
  heading: {
    ...typography.bodySm,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  headingSub: {
    marginTop: 2,
    lineHeight: 15,
    marginBottom: spacing.sm + 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: spacing.xs + 2,
    gap: CELL_GAP,
  },
  labelSpacer: {
    width: LABEL_WIDTH,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: CELL_GAP,
  },
  rowLabel: {
    width: LABEL_WIDTH,
    color: '#C9D1D9',
  },
  cell: {
    flex: 1,
    borderRadius: 5,
    paddingHorizontal: 2,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    marginTop: spacing.xs,
  },
});
