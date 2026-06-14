import { StyleSheet, Text, View } from 'react-native';

import { GeoCard } from '@/components';
import {
  HEATMAP_COLUMNS,
  HEATMAP_FOOTNOTE,
  HEATMAP_ROWS,
  type HeatLevel,
  type HeatmapRow,
} from '@/data/pasar';
import { colors, radii, spacing, typography } from '@/theme';

const LABEL_WIDTH = 80;
const CELL_HEIGHT = 20;
const CELL_GAP = spacing.xs;

/**
 * Geopolitical heatmap (component #7): rows = asset class, columns = the 3
 * active situations (Natuna / LCS / Taiwan). Cell color encodes intensity.
 */
export function GeoHeatmap() {
  return (
    <GeoCard radius={radii.cardSm} style={styles.card}>
      <Text style={styles.heading}>Geopolitical Heatmap</Text>
      <Text style={[typography.caption, styles.headingSub]}>
        Seberapa besar setiap situasi mempengaruhi kelas aset ini
      </Text>

      <Text style={[typography.label, styles.cardLabel]}>PENGARUH SITUASI KE KELAS ASET</Text>

      <View style={styles.columnHeader}>
        <View style={styles.labelSpacer} />
        {HEATMAP_COLUMNS.map((col) => (
          <Text key={col} style={[typography.caption, styles.colTitle]}>
            {col}
          </Text>
        ))}
      </View>

      {HEATMAP_ROWS.map((row) => (
        <Row key={row.label} row={row} />
      ))}

      <Text style={[typography.caption, styles.footnote]}>{HEATMAP_FOOTNOTE}</Text>
    </GeoCard>
  );
}

function Row({ row }: { row: HeatmapRow }) {
  return (
    <View style={styles.row}>
      <Text style={[typography.bodySm, styles.rowLabel]}>{row.label}</Text>
      {row.levels.map((level, i) => (
        <HeatCell key={i} level={level} />
      ))}
    </View>
  );
}

function HeatCell({ level }: { level: HeatLevel }) {
  return (
    <View style={[styles.cell, { backgroundColor: level.cellColor }]}>
      <Text style={[typography.caption, { color: level.textColor, fontWeight: '500' }]}>
        {level.label}
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
  cardLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.sm - 2,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: CELL_GAP,
  },
  labelSpacer: {
    width: LABEL_WIDTH,
  },
  colTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  row: {
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
    height: CELL_HEIGHT,
    borderRadius: radii.chip / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footnote: {
    marginTop: spacing.xs,
    lineHeight: 16,
  },
});
