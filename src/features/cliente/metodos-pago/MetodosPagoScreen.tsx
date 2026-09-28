import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ClienteStackParamList } from '@navigation/types';
import type { PaymentMode } from '@shared/types';
import { usePaymentSelectionStore } from '@store/usePaymentSelectionStore';
import { useRideDraftStore } from '@store/useRideDraftStore';
import { useScheduledTripsStore } from '@store/useScheduledTripsStore';
import { PAYMENT_METHODS, type PaymentMethodId } from '@shared/data/paymentMethods';
import { PageHeader } from '@shared/components/ui/PageHeader';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius } from '@theme/spacing';

type Props = NativeStackScreenProps<ClienteStackParamList, 'MetodosPago'>;

const MODE_BY_ID: Record<PaymentMethodId, PaymentMode> = { efectivo: 'Efectivo', yape: 'Yape', plin: 'Plin' };
const ID_BY_MODE: Record<PaymentMode, PaymentMethodId> = { Efectivo: 'efectivo', Yape: 'yape', Plin: 'plin' };

export function MetodosPagoScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const forRide = route.params?.forRide === true;
  const scheduledTripId = route.params?.scheduledTripId;
  const scheduledTrip = useScheduledTripsStore((s) => s.trips.find((t) => t.id === scheduledTripId));
  const updateScheduledTrip = useScheduledTripsStore((s) => s.updateTrip);

  const preferredId = usePaymentSelectionStore((s) => s.selectedId);
  const setPreferred = usePaymentSelectionStore((s) => s.setSelected);
  const ridePayment = useRideDraftStore((s) => s.paymentMethod);
  const setRidePayment = useRideDraftStore((s) => s.setPaymentMethod);

  const selectedId = scheduledTripId
    ? ID_BY_MODE[scheduledTrip?.paymentMode ?? 'Efectivo']
    : forRide
    ? ID_BY_MODE[ridePayment.mode]
    : preferredId;

  const handleSelect = (id: PaymentMethodId) => {
    void Haptics.selectionAsync();
    if (scheduledTripId) {
      // Desde un viaje programado: cambia solo el pago de ese viaje.
      updateScheduledTrip(scheduledTripId, { paymentMode: MODE_BY_ID[id] });
      navigation.goBack();
      return;
    }
    if (forRide) {
      // Desde la solicitud de viaje: se aplica al viaje y se vuelve a la lista de servicios.
      setRidePayment({ ...ridePayment, mode: MODE_BY_ID[id] });
      navigation.goBack();
      return;
    }
    setPreferred(id);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.pad, { paddingBottom: insets.bottom + 22 }]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title="Métodos de pago" onBack={() => navigation.goBack()} />

        <Text style={[styles.lead, { color: theme.textMuted }]}>
          {forRide || scheduledTripId
            ? 'Elige cómo vas a pagar este viaje.'
            : 'El que elijas se usará en tus próximos viajes. Puedes cambiarlo antes de pedir.'}
        </Text>

        <View
          style={[styles.cardBox, { backgroundColor: theme.surface, borderColor: theme.line }]}
          accessibilityRole="radiogroup"
          accessibilityLabel="Métodos de pago"
        >
          {PAYMENT_METHODS.map((method, index) => {
            const isSelected = selectedId === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                style={[styles.pm, index > 0 && { borderTopWidth: 1, borderTopColor: theme.line }]}
                onPress={() => handleSelect(method.id)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`${method.label}. ${method.description}`}
              >
                <Image source={method.image} style={styles.logo} resizeMode="contain" />
                <View style={styles.text}>
                  <Text style={[styles.label, { color: theme.text }]}>{method.label}</Text>
                  <Text style={[styles.description, { color: theme.textMuted }]}>{method.description}</Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    isSelected ? { borderWidth: 7, borderColor: theme.text } : { borderColor: theme.line },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pad: {
    paddingTop: 10,
    paddingHorizontal: 18,
    gap: 16,
  },
  lead: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
  },
  cardBox: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  pm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
  },
  text: {
    flex: 1,
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.bodyLg,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
});
