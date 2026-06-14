import { StyleSheet, Text } from 'react-native';

import { colors, typography } from '@/theme';

/**
 * The "GEOSCAN" wordmark: `GEO` in textPrimary and `SCAN` in accent (BAB 7.2).
 *
 * `scale` multiplies the base font size so the same component serves both the
 * app bar (scale 1) and the large login hero (scale ~2.4).
 */
export function GeoLogo({ scale = 1 }: { scale?: number }) {
  const fontSize = typography.logo.fontSize * scale;
  return (
    <Text style={[styles.base, { fontSize }]}>
      <Text style={styles.geo}>GEO</Text>
      <Text style={styles.scan}>SCAN</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontWeight: typography.logo.fontWeight,
    letterSpacing: typography.logo.letterSpacing,
  },
  geo: { color: colors.textPrimary },
  scan: { color: colors.accent },
});
