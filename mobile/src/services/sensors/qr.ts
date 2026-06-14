import { Camera, type BarcodeScanningResult } from 'expo-camera';

/**
 * Helpers + types for QR scanning with expo-camera.
 *
 * The actual <CameraView> is rendered by the scanning screen (Wave-2); this
 * module centralises permission handling and result typing so screens stay thin.
 */

/** Barcode types we care about for QR scanning. */
export const QR_BARCODE_TYPES = ['qr'] as const;

export interface QrScan {
  /** Decoded payload string. */
  data: string;
  /** Barcode type, e.g. "qr". */
  type: string;
}

/** Requests camera permission for scanning. Returns true if granted. */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === 'granted';
}

/** True if camera permission is already granted. */
export async function hasCameraPermission(): Promise<boolean> {
  const { status } = await Camera.getCameraPermissionsAsync();
  return status === 'granted';
}

/** Normalises an expo-camera scan event into our QrScan shape. */
export function toQrScan(result: BarcodeScanningResult): QrScan {
  return { data: result.data, type: result.type };
}
