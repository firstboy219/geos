import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: 'error' | 'success'; msg: string } | null>(null);

  const fail = (msg: string): boolean => {
    setFieldError(msg);
    return false;
  };

  const validate = (): boolean => {
    if (!name.trim()) return fail('Full name is required');
    if (!email.trim()) return fail('Email is required');
    if (!EMAIL_RE.test(email.trim())) return fail('Enter a valid email');
    if (!password) return fail('Password is required');
    if (password.length < 8) return fail('Password must be at least 8 characters');
    if (confirm !== password) return fail('Passwords do not match');
    setFieldError(null);
    return true;
  };

  const onSubmit = async () => {
    setToast(null);
    if (!validate()) return;
    clearError();
    const ok = await register(name, email, password);
    if (ok) {
      setToast({ kind: 'success', msg: 'Account created. Please sign in.' });
      router.replace('/(auth)/login');
    } else {
      setToast({ kind: 'error', msg: 'Registration failed. Please try again.' });
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
            <GeoLogo scale={1.8} />
          </View>

          {toast != null && (
            <View
              style={[
                styles.toast,
                toast.kind === 'success' ? styles.toastSuccess : styles.toastError,
              ]}
            >
              <Text
                style={[
                  styles.toastText,
                  { color: toast.kind === 'success' ? colors.success : colors.danger },
                ]}
              >
                {toast.msg}
              </Text>
            </View>
          )}

          <View style={styles.form}>
            <AuthField
              icon="person-outline"
              placeholder="Full Name"
              autoCapitalize="words"
              returnKeyType="next"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
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
              returnKeyType="next"
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
            <AuthField
              icon="lock-closed-outline"
              placeholder="Confirm Password"
              password
              autoCapitalize="none"
              returnKeyType="done"
              value={confirm}
              onChangeText={setConfirm}
              onSubmitEditing={onSubmit}
              editable={!loading}
            />

            {fieldError != null && <Text style={styles.fieldError}>{fieldError}</Text>}

            <PrimaryButton label="DAFTAR" onPress={onSubmit} loading={loading} />

            <Link href="/(auth)/login" asChild>
              <Text style={styles.link}>Already have an account? Sign In</Text>
            </Link>
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
  logo: { alignItems: 'center', marginBottom: spacing.xxxl },
  form: { gap: spacing.lg },
  toast: {
    borderWidth: borders.hairline,
    borderRadius: radii.inner,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  toastError: { backgroundColor: colors.dangerDark, borderColor: colors.dangerBorder },
  toastSuccess: { backgroundColor: colors.successDark, borderColor: colors.successBorder },
  toastText: { ...typography.body },
  fieldError: { ...typography.bodySm, color: colors.danger },
  link: {
    ...typography.bodySm,
    color: colors.accent,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
