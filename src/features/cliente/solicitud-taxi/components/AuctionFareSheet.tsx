import React from 'react';
import { BackHandler, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import type { PaymentMode } from '@shared/types';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius } from '@theme/spacing';
import { PageHeader } from '@shared/components/ui/PageHeader';
import { PriceStepper } from '@shared/components/ui/PriceStepper';
import { PaymentRow } from '@shared/components/ui/PaymentRow';
import { AppButton } from '@shared/components/ui/AppButton';
import { AppIcon } from '@shared/components/ui/AppIcon';

const AUCTION_IMAGE = require('../../../../../assets/servicios/recorte/subasta.png');

interface AuctionFareSheetProps {
  visible: boolean;
  fare: number;
  /** Tarifa de referencia del trayecto; de ella salen el rango sugerido y los extremos de la barra. */
  baseFare?: number;
  /** "Av. Brasil 2450 → Av. José Larco 1150" (se recorta si no entra). */
  routeLabel?: string;
  /** "6.1 km", siempre visible al final de la ruta. */
  routeDistance?: string;
  paymentMode: PaymentMode;
  onOpenPayment: () => void;
  onChangeFare: (newFare: number) => void;
  onConfirm: (fare: number) => void;
  onClose: () => void;
}

/** Rango de la subasta a partir de la tarifa de referencia (estimado, sin datos reales de respuesta). */
export function getAuctionRange(baseFare: number) {
  return {
    trackMin: Math.max(5, Math.round(baseFare * 0.6)),
    trackMax: Math.round(baseFare * 1.6),
    suggestedMin: Math.round(baseFare * 0.95),
    suggestedMax: Math.round(baseFare * 1.2),
  };
}

/** Pantalla completa "Subasta · propón tu precio" del diseño. */
export function AuctionFareSheet({
  visible,
  fare,
  baseFare = 25,
  routeLabel,
  routeDistance,
  paymentMode,
  onOpenPayment,
  onChangeFare,
  onConfirm,
  onClose,
}: AuctionFareSheetProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  // El botón atrás de Android cierra esta pantalla antes que la solicitud.
  React.useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  if (!visible) return null;

  const { trackMin, trackMax, suggestedMin, suggestedMax } = getAuctionRange(baseFare);
  const pct = (value: number) => Math.min(100, Math.max(0, ((value - trackMin) / (trackMax - trackMin)) * 100));
  const farePct = pct(fare);
  const isLow = fare < suggestedMin;

  return (
    <Animated.View
      entering={SlideInRight.duration(260)}
      exiting={SlideOutRight.duration(200)}
      style={[StyleSheet.absoluteFill, styles.screen, { backgroundColor: theme.background, paddingTop: insets.top }]}
    >
      <ScrollView
        contentContainerStyle={[styles.pad, { paddingBottom: insets.bottom + 22 }]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title="Subasta" onBack={onClose} />

        <Image source={AUCTION_IMAGE} style={styles.image} resizeMode="contain" accessibilityIgnoresInvertColors />

        <View style={styles.titleBlock}>
          <Text style={[styles.question, { color: theme.text }]}>¿Cuánto quieres pagar?</Text>
          {routeLabel ? (
            <View style={styles.routeRow}>
              <Text style={[styles.route, styles.routeName, { color: theme.textMuted }]} numberOfLines={1}>
                {routeLabel}
              </Text>
              {routeDistance ? (
                <Text style={[styles.route, { color: theme.textMuted }]}> · {routeDistance}</Text>
              ) : null}
            </View>
          ) : null}
        </View>

        <PriceStepper
          value={fare}
          onChange={onChangeFare}
          min={trackMin}
          max={trackMax}
          step={0.5}
          decimals={2}
          currency="S/"
        />

        {/* Barra de rango: la zona verde es donde los conductores suelen responder */}
        <View
          style={styles.range}
          accessible
          accessibilityLabel={`Rango sugerido entre S/ ${suggestedMin} y S/ ${suggestedMax}. Tu precio: S/ ${fare.toFixed(2)}`}
        >
          <View style={[styles.track, { backgroundColor: theme.line }]} />
          <View
            style={[
              styles.okZone,
              { backgroundColor: theme.online, left: `${pct(suggestedMin)}%`, right: `${100 - pct(suggestedMax)}%` },
            ]}
          />
          <View
            style={[styles.thumb, { left: `${farePct}%`, backgroundColor: theme.text, borderColor: theme.surface }]}
          />
          <Text style={[styles.rangeLabel, styles.rangeLabelStart, { color: theme.textMuted }]}>S/ {trackMin}</Text>
          <Text
            style={[styles.rangeLabel, styles.rangeLabelThumb, { left: `${farePct}%`, color: theme.textMuted }]}
          >
            S/ {Number.isInteger(fare) ? fare : fare.toFixed(2)}
          </Text>
          <Text style={[styles.rangeLabel, styles.rangeLabelEnd, { color: theme.textMuted }]}>S/ {trackMax}</Text>
        </View>

        <View style={[styles.hint, { backgroundColor: isLow ? theme.warningSoft : theme.background }]}>
          <AppIcon name="info" color={isLow ? theme.warning : theme.textMuted} />
          <Text style={[styles.hintText, { color: theme.text }]}>
            {isLow ? (
              <>
                Con menos de <Text style={styles.bold}>S/ {suggestedMin}</Text> es probable que pocos conductores
                respondan o que te hagan contraofertas más altas.
              </>
            ) : (
              <>
                Los conductores cercanos aceptan tu precio o te hacen una contraoferta. Entre{' '}
                <Text style={styles.bold}>
                  S/ {suggestedMin} y S/ {suggestedMax}
                </Text>{' '}
                sueles recibir respuestas en menos de un minuto.
              </>
            )}
          </Text>
        </View>

        <PaymentRow mode={paymentMode} onPress={onOpenPayment} />

        <AppButton label="Buscar conductores" onPress={() => onConfirm(fare)} />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    zIndex: 30,
  },
  pad: {
    paddingTop: 10,
    paddingHorizontal: 18,
    gap: 16,
  },
  image: {
    width: '100%',
    height: 120,
  },
  titleBlock: {
    gap: 4,
    alignItems: 'center',
  },
  question: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    textAlign: 'center',
  },
  routeRow: {
    flexDirection: 'row',
    maxWidth: '100%',
  },
  routeName: {
    flexShrink: 1,
  },
  route: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
  },
  range: {
    height: 34,
    marginHorizontal: 9,
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 10,
    height: 6,
    borderRadius: 6,
  },
  okZone: {
    position: 'absolute',
    top: 10,
    height: 6,
    borderRadius: 6,
    opacity: 0.35,
  },
  thumb: {
    position: 'absolute',
    top: 4,
    width: 18,
    height: 18,
    marginLeft: -9,
    borderRadius: 9,
    borderWidth: 3,
    shadowColor: Colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  rangeLabel: {
    position: 'absolute',
    top: 22,
    fontFamily: FontFamily.regular,
    fontSize: FontSize['2xs'],
  },
  rangeLabelStart: {
    left: -9,
  },
  rangeLabelEnd: {
    right: -9,
  },
  rangeLabelThumb: {
    width: 60,
    marginLeft: -30,
    textAlign: 'center',
  },
  hint: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
  },
  hintText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.meta,
    lineHeight: 18,
  },
  bold: {
    fontFamily: FontFamily.semibold,
  },
});
