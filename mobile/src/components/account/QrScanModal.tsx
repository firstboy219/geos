import { Ionicons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  hasCameraPermission,
  QR_BARCODE_TYPES,
  requestCameraPermission,
  toQrScan,
} from '@/services/sensors/qr';
import { borders, colors, radii, spacing, typography } from '@/theme';

type PermState = 'checking' | 'granted' | 'denied';

/** Full-screen camera modal that scans a QR code and returns its payload. */
export function QrScanModal({
  visible,
  onClose,
  onScanned,
}: {
  visible: boolean;
  onClose: () => void;
  onScanned: (data: string) => void;
}) {
  const [perm, setPerm] = useState<PermState>('checking');
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!visible) {
      setLocked(false);
      setPerm('checking');
      return;
    }
    let active = true;
    (async () => {
      const granted =
        (await hasCameraPermission()) || (await requestCameraPermission());
      if (active) setPerm(granted ? 'granted' : 'denied');
    })();
    return () => {
      active = false;
    };
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
    >
      <View style={styles.container}>
        {perm === 'granted' && (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: [...QR_BARCODE_TYPES] }}
            onBarcodeScanned={(result) => {
              if (locked) return;
              setLocked(true);
              onScanned(toQrScan(result).data);
            }}
          />
        )}

        {perm === 'granted' && (
          <View style={styles.overlay} pointerEvents="none">
            <View style={styles.frame} />
            <Text style={styles.hint}>Arahkan kamera ke kode QR</Text>
          </View>
        )}

        {perm === 'denied' && (
          <View style={styles.center}>
            <Ionicons name="camera-outline" size={48} color={colors.textMuted} />
            <Text style={[typography.title, styles.deniedTitle]}>
              Izin kamera ditolak
            </Text>
            <Text style={[typography.bodySm, styles.deniedMsg]}>
              Aktifkan izin kamera di pengaturan perangkat untuk memindai QR.
            </Text>
          </View>
        )}

        {perm === 'checking' && (
          <View style={styles.center}>
            <Text style={typography.bodySm}>Meminta izin kamera…</Text>
          </View>
        )}

        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}
        >
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: 240,
    height: 240,
    borderRadius: radii.card,
    borderColor: colors.accent,
    borderWidth: 2,
  },
  hint: {
    ...typography.bodySm,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    backgroundColor: colors.background,
  },
  deniedTitle: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  deniedMsg: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  close: {
    position: 'absolute',
    top: 56,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderColor: colors.border,
    borderWidth: borders.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
