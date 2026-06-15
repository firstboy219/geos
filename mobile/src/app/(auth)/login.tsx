import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GeoLogo } from '@/components';
import { AuthField } from '@/components/forms/AuthField';
import { PrimaryButton } from '@/components/forms/PrimaryButton';
import { useAuth } from '@/state';
import { borders, colors, radii, spacing, typography } from '@/theme';

const EMAIL_RE = /^[\w.\-+]+@([\w-]+\.)+[\w-]{2,}$/;

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const validate = (): boolean => {
    if (!email.trim()) return fail('Email is required');
    if (!EMAIL_RE.test(email.trim())) return fail('Enter a valid email');
    if (!password) return fail('Password is required');
    setFieldError(null);
    return true;
  };

  const fail = (msg: string): boolean => {
    setFieldError(msg);
    return false;
  };

  const onSubmit = async () => {
    setToast(null);
    if (!validate()) return;
    clearError();
    const ok = await login(email, password);
    if (ok) {
      router.replace('/(tabs)');
    } else {
      setToast('Invalid email or password.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logo}>
            <GeoLogo scale={2.4} />
          </View>
          <Text style={styles.tagline}>Predictive Intelligence. Real-time.</Text>

          {toast != null && (
            <View style={styles.toast}>
              <Text style={styles.toastText}>{toast}</Text>
            </View>
          )}

          <View style={styles.form}>
            <AuthField
              icon="mail-outline"
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
            <AuthField
              icon="lock-closed-outline"
              placeholder="Password"
              password
              autoCapitalize="none"
              returnKeyType="done"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={onSubmit}
              editable={!loading}
            />

            {fieldError != null && <Text style={styles.fieldError}>{fieldError}</Text>}

            <PrimaryButton label="MASUK" onPress={onSubmit} loading={loading} />

            <Link href="/(auth)/register" asChild>
              <Text style={styles.link}>Don&apos;t have an account? Register</Text>
            </Link>

            <Text style={styles.divider}>atau</Text>
            <Pressable
              style={styles.waBtn}
              onPress={() => router.push('/(auth)/whatsapp')}
              disabled={loading}
            >
              <Text style={styles.waText}>Masuk dengan OTP (WhatsApp / Email)</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
  },
  logo: { alignItems: 'center' },
  tagline: {
    ...typography.bodySm,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xxxl,
  },
  form: { gap: spacing.lg },
  toast: {
    backgroundColor: colors.dangerDark,
    borderColor: colors.dangerBorder,
    borderWidth: borders.hairline,
    borderRadius: radii.inner,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  toastText: { ...typography.body, color: colors.danger },
  fieldError: { ...typography.bodySm, color: colors.danger },
  link: {
    ...typography.bodySm,
    color: colors.accent,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  divider: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  waBtn: {
    backgroundColor: colors.successDark,
    borderColor: colors.successBorder,
    borderWidth: borders.hairline,
    borderRadius: radii.inner,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  waText: { ...typography.titleSm, color: colors.success },
});
