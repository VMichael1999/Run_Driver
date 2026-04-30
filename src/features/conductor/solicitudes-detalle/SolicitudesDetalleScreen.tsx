import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import type { SolicitudesDetalleProps } from '@navigation/types';
import { BackAppBar } from '@shared/components/appbar/BackAppBar';
import { RoundedButton } from '@shared/components/button/RoundedButton';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Nav = NativeStackNavigationProp<ConductorStackParamList, 'SolicitudesDetalle'>;

export function SolicitudesDetalleScreen({ route }: SolicitudesDetalleProps) {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [offerAmount, setOfferAmount] = useState('');

  const handleSendOffer = () => {
    navigation.navigate('SolicitudesTrayecto');
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + Spacing.lg }]}>
      <BackAppBar title="Detalle de solicitud" />

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Pasajero</Text>
          <Text style={styles.value}>{route.params.alertId}</Text>

          <Text style={[styles.label, styles.mt]}>Ruta</Text>
          <Text style={styles.value}>📍 Miraflores → 🏁 San Borja</Text>

          <Text style={[styles.label, styles.mt]}>Método de pago</Text>
          <Text style={styles.value}>💳 Efectivo</Text>
        </View>

        <View style={styles.offerCard}>
          <Text style={styles.offerTitle}>Tu oferta</Text>
          <Text style={styles.offerSubtitle}>Ingresa el monto que cobrarás por este viaje</Text>
          <View style={styles.inputRow}>
            <Text style={styles.currency}>S/</Text>
            <TextInput
              style={styles.input}
              value={offerAmount}
              onChangeText={setOfferAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={Colors.textDisabled}
            />
          </View>
        </View>

        <RoundedButton
          label="Enviar oferta"
          onPress={handleSendOffer}
          disabled={!offerAmount || parseFloat(offerAmount) <= 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  content: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  label: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.regular,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  mt: { marginTop: Spacing.md },
  offerCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  offerTitle: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  offerSubtitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.divider,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  currency: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
  },
});
