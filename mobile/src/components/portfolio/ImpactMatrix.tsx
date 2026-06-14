import { StyleSheet, Text, View } from 'react-native';

import { tones } from '@/components';
import { IMPACT_SCENARIOS } from '@/data/portfolio';
import type { PortfolioAssetDto } from '@/models/api';
import { colors, spacing, typography } from '@/theme';

type Cell = 'up' | 'down' | 'flat';

const CELL_TONE: Record<Cell, (typeof tones)[keyof typeof tones]> = {
  up: tones.positive,
  down: tones.negative,
  flat: tones.neutral,
};

const CELL_ARROW: Record<Cell, string> = { up: '▲', down: '▼', flat: '–' };

/**
 * Derives a deterministic 5-cell impact row (one per active scenario) from an
 * asset. Risk-sensitive types react negatively to escalation scenarios (B-D)
 * and recover under de-escalation (E); safe-havens behave inversely.
 */
function cellsFor(asset: PortfolioAssetDto): Cell[] {
  const t = asset.assetType.toLowerCase();
  if (t === 'gold' || t === 'emas' || t === 'commodity') {
    // Safe-haven: rises with escalation.
    return ['flat', 'up', 'up', 'up', 'down'];
  }
  if (t === 'deposit' || t === 'property') {
    // Defensive: largely stable.
    return ['flat', 'flat', 'down', 'down', 'flat'];
  }
  // Risk assets (stocks, crypto): hurt by escalation, recover on de-escalation.
  return ['flat', 'down', 'down', 'down', 'up'];
}

/** Weighted impact matrix: assets (rows) × active scenarios (cols). */
export function ImpactMatrix({ assets }: { assets: PortfolioAssetDto[] }) {
  return (
    <View>
      <View style={styles.headerRow}>
        <View style={styles.tickerCol} />
        {IMPACT_SCENARIOS.map((s) => (
          <View key={s.key} style={styles.cell}>
            <Text style={[typography.caption, styles.headerKey]}>{s.key}</Text>
            <Text style={styles.headerLabel} numberOfLines={1}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      {assets.map((a) => {
        const cells = cellsFor(a);
        return (
          <View key={a.id} style={styles.row}>
            <View style={styles.tickerCol}>
              <Text style={[typography.bodySm, styles.ticker]} numberOfLines={1}>
                {a.ticker || a.assetName}
              </Text>
            </View>
            {cells.map((c, i) => {
              const tone = CELL_TONE[c];
              return (
                <View key={i} style={styles.cell}>
                  <View
                    style={[
                      styles.chip,
                      { backgroundColor: tone.bg, borderColor: tone.border },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: tone.fg }]}>
                      {CELL_ARROW[c]}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tickerCol: {
    width: 64,
    paddingRight: spacing.xs,
  },
  ticker: {
    color: colors.textPrimary,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  headerKey: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  headerLabel: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
  },
  chip: {
    width: '100%',
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 0.5,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
