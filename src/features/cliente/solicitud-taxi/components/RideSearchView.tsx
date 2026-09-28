import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { LocationMarker, PaymentMode } from '@shared/types';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Shadow } from '@theme/spacing';
import { PaymentRow } from '@shared/components/ui/PaymentRow';
import { SearchPulse } from './SearchPulse';

interface RideSearchViewProps {
  serviceName: string;
  serviceImage: ReturnType<typeof require>;
  /** Lo que paga el pasajero, ya con descuento. */
  price: number;
  currency: string;
  origin?: LocationMarker | null;
  destination?: LocationMarker | null;
  stops: LocationMarker[];
  /** Método con el que se pidió; no se puede cambiar mientras se busca. */
  paymentMode: PaymentMode;
  /** Pide confirmación y cancela la solicitud. */
  onCancel: () => void;
}

/** Búsqueda de conductor para un viaje de precio fijo: ondas sobre el mapa y la solicitud abajo. */
export function RideSearchView({
  serviceName,
  serviceImage,
  price,
  currency,
  origin,
  destination,
  stops,
  paymentMode,
  onCancel,
}: RideSearchViewProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const halo = { textShadowColor: theme.surface, textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } };
  const places = [
    { label: 'Desde', place: origin, color: Colors.pinOrigin },
    ...stops.map((stop, index) => ({ label: `Parada ${index + 1}`, place: stop, color: theme.textMuted })),
    { label: 'Hacia', place: destination, color: Colors.pinDestination },
  ];

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Svg style={styles.topFade} width="100%" height={insets.top + 230} pointerEvents="none">
        <Defs>
          <LinearGradient id="rideFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.background} stopOpacity={0.96} />
            <Stop offset="0.7" stopColor={theme.background} stopOpacity={0.85} />
            <Stop offset="1" stopColor={theme.background} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#rideFade)" />
      </Svg>
      <View style={[styles.searchTop, { marginTop: insets.top + 6 }]} pointerEvents="none" accessibilityLiveRegion="polite">
        <SearchPulse active />
        <Text style={[styles.title, halo, { color: theme.text }]}>Buscando conductor</Text>
        <Text style={[styles.subtitle, halo, { color: theme.text }]}>
          {serviceName} · {currency} {price.toFixed(2)}
        </Text>
      </View>

      <View style={styles.flex} pointerEvents="none" />

      <View style={[styles.panel, { backgroundColor: theme.surface, paddingBottom: 18 + insets.bottom }, Shadow.sheet]}>
        <View style={styles.serviceRow}>
          <Image source={serviceImage} style={styles.serviceImage} resizeMode="contain" />
          <View style={styles.flex}>
            <Text style={[styles.serviceName, { color: theme.text }]}>{serviceName}</Text>
            <Text style={[styles.serviceMeta, { color: theme.textMuted }]}>Precio fijo</Text>
          </View>
          <Text style={[styles.price, { color: theme.text }]}>
            {currency} {price.toFixed(2)}
          </Text>
        </View>

        <View style={styles.route}>
          {places.map(({ label, place, color }, index) => (
            <View key={`${label}-${index}`} style={styles.routeRow}>
              <View style={styles.ring}>
                <View style={[styles.dot, { backgroundColor: color }]} />
              </View>
              <View style={styles.flex}>
                <Text style={[styles.routeLabel, { color: theme.textMuted }]}>{label}</Text>
                <Text style={[styles.routeValue, { color: theme.text }]} numberOfLines={1}>
                  {place?.placeName ?? 'Tu ubicación'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <PaymentRow mode={paymentMode} label={`Pagas con ${paymentMode}`} />

        <TouchableOpacity
          style={[styles.cancel, { borderColor: theme.line }]}
          onPress={onCancel}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Cancelar solicitud"
        >
          <Text style={[styles.cancelText, { color: theme.danger }]}>Cancelar solicitud</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  searchTop: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 64,
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lead,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: -6,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.caption,
    textAlign: 'center',
  },
  flex: {
    flex: 1,
  },
  panel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 14,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serviceImage: {
    width: 74,
    height: 48,
  },
  serviceName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.bodyLg,
  },
  serviceMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  price: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  route: {
    gap: 10,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ring: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.pinRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
  },
  routeValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.body,
  },
  cancel: {
    height: 48,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.bodyLg,
  },
});
