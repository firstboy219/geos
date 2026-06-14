import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Switch, Text } from 'react-native';

import { GeoCard, SectionHeader } from '@/components';
import {
  authenticateBiometric,
  isBiometricAvailable,
} from '@/services/sensors/biometric';
import { getCurrentPosition } from '@/services/sensors/location';
import { colors, spacing, typography } from '@/theme';

import { MenuTile } from './MenuTile';
import { QrScanModal } from './QrScanModal';

/**
 * "Perangkat & Sensor" section: device location, QR scanning, and a biometric
 * lock toggle. Handles permission denial and runtime errors gracefully.
 */
export function SensorSection() {
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [coords, setCoords] = useState<string | null>(null);

  const [qrOpen, setQrOpen] = useState(false);

  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioOn, setBioOn] = useState(false);

  useEffect(() => {
    let active = true;
    isBiometricAvailable().then((v) => {
      if (active) setBioAvailable(v);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleLocation = async () => {
    setLoadingLoc(true);
    try {
      const pos = await getCurrentPosition();
      if (!pos) {
        Alert.alert(
          'Izin lokasi ditolak',
          'Aktifkan izin lokasi untuk melihat posisi Anda.',
        );
        return;
      }
      setCoords(`${pos.latitude.toFixed(4)}, ${pos.longitude.toFixed(4)}`);
    } catch {
      Alert.alert('Gagal', 'Tidak dapat mengambil lokasi. Coba lagi.');
    } finally {
      setLoadingLoc(false);
    }
  };

  const handleQrScanned = (data: string) => {
    setQrOpen(false);
    Alert.alert('QR terpindai', data);
  };

  const handleBioToggle = async (next: boolean) => {
    if (!next) {
      setBioOn(false);
      return;
    }
    if (!bioAvailable) {
      Alert.alert(
        'Biometrik tidak tersedia',
        'Perangkat ini tidak memiliki biometrik terdaftar.',
      );
      return;
    }
    const result = await authenticateBiometric('Aktifkan kunci biometrik Geoscan');
    if (result.success) {
      setBioOn(true);
    } else {
      Alert.alert('Gagal', result.error ?? 'Autentikasi biometrik gagal.');
    }
  };

  return (
    <>
      <SectionHeader title="Perangkat & Sensor" />
      <GeoCard padded={false}>
        <MenuTile
          icon="location-outline"
          label="Lokasi saya"
          onPress={handleLocation}
          trailing={
            loadingLoc ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : coords != null ? (
              <Text style={[typography.caption, styles.value]}>{coords}</Text>
            ) : undefined
          }
        />
        <MenuTile icon="qr-code-outline" label="Scan QR" onPress={() => setQrOpen(true)} />
        <MenuTile
          icon="finger-print-outline"
          label="Kunci biometrik"
          divider={false}
          trailing={
            <Switch
              value={bioOn}
              onValueChange={handleBioToggle}
              trackColor={{ true: colors.accent, false: colors.border }}
              thumbColor={colors.textPrimary}
            />
          }
        />
      </GeoCard>

      <QrScanModal
        visible={qrOpen}
        onClose={() => setQrOpen(false)}
        onScanned={handleQrScanned}
      />
    </>
  );
}

const styles = StyleSheet.create({
  value: {
    color: colors.accent,
  },
});
