import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { GeoChip } from '@/components';
import { PrimaryButton } from '@/components/forms/PrimaryButton';
import {
  ASSET_TYPES,
  assetTypeToken,
  type AssetTypeLabel,
} from '@/data/portfolio';
import { borders, colors, radii, spacing, typography } from '@/theme';

export interface NewAsset {
  assetType: string;
  assetName: string;
  ticker: string;
  quantity: number;
  purchasePrice: number;
}

/** Bottom-sheet style modal to add a new portfolio asset. */
export function AddAssetModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (asset: NewAsset) => void;
}) {
  const [type, setType] = useState<AssetTypeLabel>('Saham');
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setType('Saham');
    setName('');
    setQty('');
    setPrice('');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Nama / ticker aset wajib diisi.');
      return;
    }
    const quantity = Number(qty.replace(',', '.')) || 0;
    const purchasePrice = Number(price.replace(',', '.')) || 0;
    if (quantity <= 0 || purchasePrice <= 0) {
      setError('Jumlah dan harga beli harus lebih dari 0.');
      return;
    }
    onAdd({
      assetType: assetTypeToken(type),
      assetName: trimmed,
      ticker: trimmed.toUpperCase(),
      quantity,
      purchasePrice,
    });
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={[typography.title, styles.heading]}>Tambah Aset</Text>

            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={[typography.label, styles.fieldLabel]}>JENIS ASET</Text>
              <View style={styles.typeRow}>
                {ASSET_TYPES.map((t) => (
                  <GeoChip
                    key={t}
                    label={t}
                    dense
                    selected={t === type}
                    onPress={() => setType(t)}
                  />
                ))}
              </View>

              <Text style={[typography.label, styles.fieldLabel]}>
                NAMA / TICKER (mis. BBCA)
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Bank Central Asia"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <View style={styles.twoCol}>
                <View style={styles.col}>
                  <Text style={[typography.label, styles.fieldLabel]}>JUMLAH</Text>
                  <TextInput
                    value={qty}
                    onChangeText={setQty}
                    keyboardType="numeric"
                    placeholder="100"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={[typography.label, styles.fieldLabel]}>HARGA BELI</Text>
                  <TextInput
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    placeholder="9200"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                  />
                </View>
              </View>

              {error != null && <Text style={styles.error}>{error}</Text>}

              <View style={styles.actions}>
                <PrimaryButton label="SIMPAN" onPress={handleSave} />
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  kav: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    borderColor: colors.border,
    borderWidth: borders.hairline,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  heading: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: borders.hairline,
    borderRadius: radii.inner,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
  },
  twoCol: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  col: {
    flex: 1,
  },
  error: {
    ...typography.bodySm,
    color: colors.danger,
    marginTop: spacing.md,
  },
  actions: {
    marginTop: spacing.xl,
  },
});
