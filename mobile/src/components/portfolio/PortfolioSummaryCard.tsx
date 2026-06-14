import { StyleSheet, Text, View } from 'react-native';

import { GeoCard } from '@/components';
import { formatIdr } from '@/data/portfolio';
import { colors, spacing, typography } from '@/theme';

/**
 * Portfolio summary header: total value + geopolitical risk score + estimated
 * negative impact, framed against the dominant active scenario.
 */
export function PortfolioSummaryCard({
  total,
  assetCount,
  riskScore = 6.4,
  negativeImpactPct = 12,
  dominantScenario = 'skenario eskalasi Selat Taiwan (C)',
}: {
  total: number;
  assetCount: number;
  riskScore?: number;
  negativeImpactPct?: number;
  dominantScenario?: string;
}) {
  return (
    <GeoCard emphasis>
      <Text style={typography.label}>TOTAL NILAI PORTOFOLIO</Text>
      <Text style={[typography.headline1, styles.total]}>{formatIdr(total)}</Text>
      <Text style={[typography.caption, styles.count]}>
        {assetCount} aset terpantau
      </Text>

      <View style={styles.metrics}>
        <Metric
          label="Skor risiko geopolitik"
          value={`${riskScore.toFixed(1)}/10`}
          color={colors.warning}
        />
        <Metric
          label="Estimasi dampak"
          value={`-${negativeImpactPct.toFixed(0)}%`}
          color={colors.danger}
        />
      </View>

      <Text style={[typography.caption, styles.basis]}>
        Berdasarkan {dominantScenario}
      </Text>
    </GeoCard>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={[typography.headline2, { color }]}>{value}</Text>
      <Text style={[typography.caption, styles.metricLabel]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  total: {
    marginTop: spacing.xs,
  },
  count: {
    marginTop: 2,
  },
  metrics: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    marginTop: 2,
  },
  basis: {
    marginTop: spacing.md,
  },
});
