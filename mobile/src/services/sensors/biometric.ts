import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Thin wrapper around expo-local-authentication for biometric unlock.
 */
export interface BiometricResult {
  success: boolean;
  error?: string;
}

/**
 * True when the device has biometric hardware AND the user has enrolled
 * at least one credential (face/fingerprint).
 */
export async function isBiometricAvailable(): Promise<boolean> {
  const [hasHardware, isEnrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);
  return hasHardware && isEnrolled;
}

/**
 * Prompts the user for biometric authentication.
 * @param reason Localised prompt message shown to the user.
 */
export async function authenticateBiometric(
  reason = 'Authenticate to continue',
): Promise<BiometricResult> {
  const available = await isBiometricAvailable();
  if (!available) {
    return { success: false, error: 'Biometrics not available' };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    disableDeviceFallback: false,
    cancelLabel: 'Cancel',
  });

  return result.success
    ? { success: true }
    : { success: false, error: result.error ?? 'Authentication failed' };
}
