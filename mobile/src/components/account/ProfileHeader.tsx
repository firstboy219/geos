import { StyleSheet, Text, View } from 'react-native';

import { GeoCard } from '@/components';
import { borders, colors, radii, spacing, typography } from '@/theme';

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const out = parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
  return out || 'GS';
}

/** Profile header: avatar (initials) + name/email + subscription tier badge. */
export function ProfileHeader({
  name,
  email,
  tier,
}: {
  name: string;
  email: string;
  tier: string;
}) {
  const upper = tier.toUpperCase();
  const isFree = upper === 'FREE';
  const badgeColor = isFree ? colors.textSecondary : colors.accent;
  const badgeBg = isFree ? colors.surfaceAlt : colors.accentDark;

  return (
    <GeoCard emphasis>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={[typography.title, styles.initials]}>
            {initialsFrom(name)}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={typography.title} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[typography.bodySm, styles.email]} numberOfLines={1}>
            {email}
          </Text>
        </View>
        <View
          style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeColor }]}
        >
          <Text style={[typography.caption, { color: badgeColor, fontWeight: '500' }]}>
            {upper}
          </Text>
        </View>
      </View>
    </GeoCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accentDark,
    borderColor: colors.accentBorder,
    borderWidth: borders.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.accent,
  },
  info: {
    flex: 1,
  },
  email: {
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.chip,
    borderWidth: borders.hairline,
  },
});
