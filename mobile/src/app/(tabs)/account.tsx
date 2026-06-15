import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GeoCard, SectionHeader } from '@/components';
import { MenuTile, ProfileHeader, SensorSection } from '@/components/account';
import { useAuth } from '@/state';
import { colors, spacing, typography } from '@/theme';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [lang, setLang] = useState<'ID' | 'EN'>('ID');

  const name = user?.fullName || 'Demo Investor';
  const email = user?.email || 'demo@geoscan.app';
  const tier = user?.tier || 'free';

  const soon = () => Alert.alert('Segera hadir', 'Fitur ini akan tersedia.');

  const handleLogout = () => {
    Alert.alert('Keluar', 'Anda yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xxxl },
        ]}
      >
        <Text style={typography.headline2}>Profil</Text>
        <View style={styles.gap}>
          <ProfileHeader name={name} email={email} tier={tier} />
        </View>

        <SectionHeader title="Pengaturan" />
        <GeoCard padded={false}>
          <MenuTile
            icon="person-circle-outline"
            label="Data Pribadi"
            onPress={() => router.push('/profile/edit')}
          />
          <MenuTile icon="notifications-outline" label="Notifikasi" onPress={soon} />
          <MenuTile icon="options-outline" label="Konfigurasi Tripwire" onPress={soon} />
          <MenuTile
            icon="card-outline"
            label="Subscription & billing"
            onPress={soon}
          />
          <MenuTile icon="download-outline" label="Export laporan" onPress={soon} />
          <MenuTile
            icon="language-outline"
            label="Bahasa"
            onPress={() => setLang((l) => (l === 'ID' ? 'EN' : 'ID'))}
            trailing={<Text style={[typography.bodySm, styles.langValue]}>{lang}</Text>}
          />
          <MenuTile
            icon="shield-checkmark-outline"
            label="Privasi & keamanan"
            divider={false}
            onPress={soon}
          />
        </GeoCard>

        <SensorSection />

        <View style={styles.logoutBlock}>
          <GeoCard padded={false}>
            <MenuTile
              icon="log-out-outline"
              label="Keluar"
              color={colors.danger}
              divider={false}
              onPress={handleLogout}
            />
          </GeoCard>
        </View>

        <Text style={[typography.caption, styles.version]}>
          Geoscan v0.1.0 · Framework v3.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  gap: {
    marginTop: spacing.md,
  },
  langValue: {
    color: colors.accent,
  },
  logoutBlock: {
    marginTop: spacing.lg,
  },
  version: {
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
