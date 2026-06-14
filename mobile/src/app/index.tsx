import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { GeoLogo } from '@/components';
import { useAuth } from '@/state';
import { colors, spacing } from '@/theme';

/**
 * Splash / gate: waits for the initial token check, then redirects to the app
 * shell or the auth flow.
 */
export default function SplashScreen() {
  const { initialized, user } = useAuth();

  if (!initialized) {
    return (
      <View style={styles.container}>
        <GeoLogo scale={2.2} />
        <ActivityIndicator color={colors.accent} style={styles.spinner} />
      </View>
    );
  }

  return <Redirect href={user ? '/(tabs)' : '/(auth)/login'} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  spinner: {
    marginTop: spacing.xxl,
  },
});
