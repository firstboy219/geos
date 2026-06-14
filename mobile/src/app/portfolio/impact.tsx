import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GeoCard, SectionHeader } from '@/components';
import { ImpactMatrix, RecommendationCard } from '@/components/portfolio';
import { FALLBACK_PORTFOLIO, RECOMMENDATIONS } from '@/data/portfolio';
import { usePortfolio } from '@/state';
import { colors, spacing, typography } from '@/theme';

export default function PortfolioImpactScreen() {
  const insets = useSafeAreaInsets();
  const { data: live } = usePortfolio();
  const assets = live.length > 0 ? live : FALLBACK_PORTFOLIO;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xxxl },
      ]}
    >
      <GeoCard emphasis>
        <Text style={typography.label}>DAMPAK TERTIMBANG</Text>
        <Text style={[typography.headline1, styles.headline]}>-12%</Text>
        <Text style={[typography.bodySm, styles.lead]}>
          Estimasi dampak ke seluruh portofolio berdasarkan probabilitas semua
          skenario aktif (16 lapisan AI Geoscan).
        </Text>
      </GeoCard>

      <SectionHeader
        title="Matriks dampak per skenario"
        subtitle="Aset × skenario aktif (A status quo → E de-eskalasi)"
      />
      <GeoCard padded={false} style={styles.matrixCard}>
        <ImpactMatrix assets={assets} />
      </GeoCard>

      <SectionHeader title="Rekomendasi rebalancing" />
      {RECOMMENDATIONS.map((r) => (
        <RecommendationCard key={r.title} reco={r} />
      ))}

      <Text style={[typography.caption, styles.disclaimer]}>
        Bukan nasihat keuangan. Output Geoscan bersifat edukatif dan probabilistik.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headline: {
    color: colors.danger,
    marginTop: spacing.xs,
  },
  lead: {
    marginTop: spacing.xs,
    lineHeight: 17,
  },
  matrixCard: {
    padding: spacing.md,
  },
  disclaimer: {
    marginTop: spacing.md,
    lineHeight: 15,
  },
});
