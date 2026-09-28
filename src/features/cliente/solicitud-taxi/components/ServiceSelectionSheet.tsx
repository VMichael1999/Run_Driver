import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PaymentMethod } from '@shared/types';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';
import { AppButton } from '@shared/components/ui/AppButton';

export interface VehicleServiceOption {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  currency: string;
  etaMinutes: number;
  seats: number;
  image: ReturnType<typeof require>;
  isAuction?: boolean;
}

interface ServiceSelectionSheetProps {
  services: VehicleServiceOption[];
  selectedId: string;
  onSelectService: (id: string) => void;
  paymentMethod: PaymentMethod;
  onOpenPayment: () => void;
  tripNotes: string;
  onOpenNotes: () => void;
  distanceKm?: number;
  durationMin?: number;
  onSubmit: () => void;
  onSchedulePress?: () => void;
}

export function ServiceSelectionSheet({
  services,
  selectedId,
  onSelectService,
  paymentMethod,
  onOpenPayment,
  tripNotes,
  onOpenNotes,
  distanceKm,
  durationMin,
  onSubmit,
  onSchedulePress,
}: ServiceSelectionSheetProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const selectedService = services.find((s) => s.id === selectedId) ?? services[0];
  const isAuction = selectedService?.isAuction === true;

  const getPaymentLogo = () => {
    switch (paymentMethod.mode) {
      case 'Yape':
        return require('../../../../../assets/payment/yape.png');
      case 'Plin':
        return require('../../../../../assets/payment/plin.png');
      case 'Efectivo':
      default:
        return require('../../../../../assets/payment/efectivo.png');
    }
  };

  const submitLabel = isAuction
    ? 'Continuar a subasta'
    : `Pedir ${selectedService?.name ?? 'viaje'} · S/ ${(selectedService?.price ?? 25).toFixed(2)}`;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          paddingBottom: Math.max(insets.bottom, Spacing.md),
        },
        Shadow.sheet,
      ]}
    >
      <View style={[styles.handle, { backgroundColor: theme.line }]} />

      {/* Cabecera con distancia y tiempo total estimado */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Elige cómo viajar</Text>
          {distanceKm && durationMin ? (
            <Text style={[styles.metaText, { color: theme.textMuted }]}>
              {distanceKm.toFixed(1)} km · aprox. {durationMin} min
            </Text>
          ) : null}
        </View>

        {onSchedulePress ? (
          <TouchableOpacity
            style={[styles.scheduleBtn, { borderColor: theme.line }]}
            onPress={onSchedulePress}
            activeOpacity={0.8}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Programar viaje para más tarde"
          >
            <Ionicons name="calendar-outline" size={16} color={theme.text} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Lista vertical de servicios */}
      <ScrollView
        style={styles.servicesScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.servicesList}
      >
        {services.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.serviceCard,
                {
                  backgroundColor: isSelected ? theme.surfaceMuted : theme.surface,
                  borderColor: isSelected
                    ? item.isAuction
                      ? theme.sig
                      : theme.primary
                    : theme.line,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => onSelectService(item.id)}
              activeOpacity={0.82}
              accessible
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Servicio ${item.name}, ${item.isAuction ? 'Tú propones precio' : `${item.currency} ${item.price.toFixed(2)}`}`}
            >
              <Image source={item.image} style={styles.serviceImage} resizeMode="contain" />

              <View style={styles.serviceInfo}>
                <View style={styles.serviceNameRow}>
                  <Text style={[styles.serviceName, { color: theme.text }]}>{item.name}</Text>
                  {item.isAuction ? (
                    <View style={[styles.auctionTag, { backgroundColor: theme.sig }]}>
                      <Text style={[styles.auctionTagText, { color: theme.onSig }]}>Subasta</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={[styles.serviceMeta, { color: theme.textMuted }]}>
                  {item.isAuction
                    ? item.subtitle ?? 'Tú propones el precio'
                    : `${item.seats} asientos · ${item.etaMinutes} min`}
                </Text>
              </View>

              <View style={styles.servicePriceWrap}>
                {item.isAuction ? (
                  <Text style={[styles.auctionPriceText, { color: theme.text }]}>Tú propones</Text>
                ) : (
                  <Text style={[styles.servicePrice, { color: theme.text }]}>
                    {item.currency} {item.price.toFixed(2)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Fila de método de pago y notas */}
      <View style={[styles.footerControls, { borderTopColor: theme.line }]}>
        <TouchableOpacity
          style={[styles.paymentSelector, { backgroundColor: theme.surfaceMuted, borderColor: theme.line }]}
          onPress={onOpenPayment}
          activeOpacity={0.8}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Método de pago seleccionado: ${paymentMethod.mode}. Toca para cambiar`}
        >
          <Image source={getPaymentLogo()} style={styles.paymentLogo} resizeMode="contain" />
          <Text style={[styles.paymentText, { color: theme.text }]}>{paymentMethod.mode}</Text>
          <Text style={[styles.paymentChange, { color: theme.textMuted }]}>Cambiar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.notesSelector, { backgroundColor: theme.surfaceMuted, borderColor: theme.line }]}
          onPress={onOpenNotes}
          activeOpacity={0.8}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Agregar o ver notas del viaje"
        >
          <Ionicons
            name={tripNotes ? 'document-text' : 'document-text-outline'}
            size={18}
            color={theme.text}
          />
          <Text style={[styles.notesText, { color: theme.text }]} numberOfLines={1}>
            {tripNotes ? 'Con notas' : 'Notas'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Botón principal de solicitud (en Sentence case, no mayúsculas) */}
      <AppButton
        label={submitLabel}
        variant={isAuction ? 'sig' : 'primary'}
        onPress={onSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
    maxHeight: '62%',
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    letterSpacing: -0.3,
  },
  metaText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    marginTop: 1,
  },
  scheduleBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servicesScroll: {
    flexGrow: 0,
  },
  servicesList: {
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
  },
  serviceImage: {
    width: 58,
    height: 38,
  },
  serviceInfo: {
    flex: 1,
    gap: 2,
  },
  serviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serviceName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md - 1,
  },
  auctionTag: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.full,
  },
  auctionTagText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
  },
  serviceMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  servicePriceWrap: {
    alignItems: 'flex-end',
  },
  servicePrice: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontVariant: ['tabular-nums'],
  },
  auctionPriceText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  footerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
  },
  paymentSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  paymentLogo: {
    width: 24,
    height: 24,
  },
  paymentText: {
    flex: 1,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  paymentChange: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  notesSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  notesText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
});
