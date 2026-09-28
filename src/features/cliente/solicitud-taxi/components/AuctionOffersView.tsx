import React from 'react';
import { Image, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  FadeInDown,
  FadeOut,
  LinearTransition,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { DriverAlert, PaymentMode, TripDiscount } from '@shared/types';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Shadow } from '@theme/spacing';
import { AppButton } from '@shared/components/ui/AppButton';
import { AppIcon } from '@shared/components/ui/AppIcon';
import { PaymentRow } from '@shared/components/ui/PaymentRow';
import { DriverOfferCard } from './DriverOfferCard';
import { CountdownButton } from './CountdownButton';

export interface AuctionOfferItem {
  id: string;
  driver: DriverAlert;
  startTime: Date;
  totalDuration: number;
}

interface AuctionOffersViewProps {
  offers: AuctionOfferItem[];
  /** Precio con el que se está buscando ahora. */
  requestedFare: number;
  /** Date.now() del inicio de la búsqueda actual; cambia al reintentar. */
  searchStartedAt: number;
  searchWindowSeconds: number;
  minFare: number;
  maxFare: number;
  onAcceptOffer: (offerId: string) => void;
  onRejectOffer: (offerId: string) => void;
  onExpireOffer: (offerId: string) => void;
  /** Reinicia la búsqueda con el precio indicado (mismo precio = volver a solicitar). */
  onRestartSearch: (fare: number) => void;
  /** Datos de la solicitud que se muestran en el panel inferior. */
  serviceName: string;
  serviceImage: ReturnType<typeof require>;
  originName: string;
  destinationName: string;
  /** Método con el que se lanzó la búsqueda; no se puede cambiar mientras se busca. */
  paymentMode: PaymentMode;
  /** Descuento del pasajero; las ofertas muestran lo que paga con él. */
  discount?: TripDiscount | null;
  /** Acepta sola la primera oferta que iguale el precio pedido. */
  autoAccept: boolean;
  onToggleAutoAccept: (value: boolean) => void;
  /** Pide confirmación y cancela la solicitud. */
  onCancelRequest: () => void;
}

const SPRING = { damping: 22, stiffness: 220, mass: 0.9 };

const FARE_STEP = 0.5;

/** Una onda lima que se expande y se desvanece; `delay` escalona las tres ondas. */
function PulseRing({ active, delay }: { active: boolean; delay: number }) {
  const theme = useAppTheme();
  const t = useSharedValue(0);

  React.useEffect(() => {
    cancelAnimation(t);
    t.value = 0;
    if (active) {
      t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }), -1, false));
    }
  }, [active, delay, t]);

  const style = useAnimatedStyle(() => ({
    opacity: active ? 0.9 * (1 - t.value) : 0,
    transform: [{ scale: 0.35 + t.value * 0.65 }],
  }));

  return <Animated.View style={[styles.ring, { borderColor: theme.sig }, style]} />;
}

/** Ondas alrededor del rayo, que vibra cada tanto mientras se busca. Sin movimiento si el sistema lo pide. */
function SearchPulse({ active }: { active: boolean }) {
  const theme = useAppTheme();
  const reduceMotion = useReducedMotion();
  const animate = active && !reduceMotion;
  const wiggle = useSharedValue(0);

  React.useEffect(() => {
    cancelAnimation(wiggle);
    wiggle.value = 0;
    if (!animate) return;
    wiggle.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 60 }),
        withTiming(12, { duration: 90 }),
        withTiming(-8, { duration: 80 }),
        withTiming(8, { duration: 80 }),
        withTiming(0, { duration: 60 }),
        withDelay(1300, withTiming(0, { duration: 0 })),
      ),
      -1,
      false,
    );
  }, [animate, wiggle]);

  const boltStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${wiggle.value}deg` }] }));

  return (
    <View style={styles.pulse} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <PulseRing active={animate} delay={0} />
      <PulseRing active={animate} delay={800} />
      <PulseRing active={animate} delay={1600} />
      <Animated.View style={[styles.bolt, { backgroundColor: theme.sig }, boltStyle]}>
        <AppIcon name="bolt" color={theme.onSig} />
      </Animated.View>
    </View>
  );
}

export function AuctionOffersView({
  offers,
  requestedFare,
  searchStartedAt,
  searchWindowSeconds,
  minFare,
  maxFare,
  onAcceptOffer,
  onRejectOffer,
  onExpireOffer,
  onRestartSearch,
  serviceName,
  serviceImage,
  originName,
  destinationName,
  paymentMode,
  discount,
  autoAccept,
  onToggleAutoAccept,
  onCancelRequest,
}: AuctionOffersViewProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const windowMs = searchWindowSeconds * 1000;

  const [draftFare, setDraftFare] = React.useState(requestedFare);
  const [now, setNow] = React.useState(Date.now());

  // Cada búsqueda nueva parte del precio con el que se lanzó.
  React.useEffect(() => {
    setDraftFare(requestedFare);
    setNow(Date.now());
  }, [requestedFare, searchStartedAt]);

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [searchStartedAt]);

  const secondsLeft = Math.max(0, Math.ceil((windowMs - (now - searchStartedAt)) / 1000));
  const isSearching = secondsLeft > 0;
  const priceChanged = Math.abs(draftFare - requestedFare) > 0.001;

  const changeFare = (delta: number) => {
    const next = Math.min(maxFare, Math.max(minFare, Number((draftFare + delta).toFixed(2))));
    if (next !== draftFare) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setDraftFare(next);
    }
  };

  // --- Panel inferior arrastrable: mínimo = precio, botón y aceptación automática; expandido = detalles.
  const chrome = 10 + 4 + 12 + 18 + insets.bottom; // padding superior, handle, espacio, padding inferior
  const [topHeight, setTopHeight] = React.useState(0);
  const [fullHeight, setFullHeight] = React.useState(0);
  const collapsed = chrome + topHeight;
  const expanded = Math.max(collapsed, chrome + fullHeight);
  const panelHeight = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    if (!topHeight) return;
    panelHeight.value = panelHeight.value === 0
      ? (isExpanded ? expanded : collapsed)
      : withSpring(isExpanded ? expanded : collapsed, SPRING);
  }, [collapsed, expanded, isExpanded, topHeight, panelHeight]);

  const snapTo = React.useCallback((toExpanded: boolean) => setIsExpanded(toExpanded), []);

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      dragStart.value = panelHeight.value;
    })
    .onUpdate((e) => {
      panelHeight.value = Math.max(collapsed - 30, Math.min(expanded, dragStart.value - e.translationY));
    })
    .onEnd((e) => {
      const toExpanded =
        e.velocityY < -500 ? true : e.velocityY > 500 ? false : panelHeight.value > (collapsed + expanded) / 2;
      panelHeight.value = withSpring(toExpanded ? expanded : collapsed, SPRING);
      runOnJS(snapTo)(toExpanded);
    });
  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(snapTo)(!isExpanded);
  });

  const panelStyle = useAnimatedStyle(() => (panelHeight.value > 0 ? { height: panelHeight.value } : {}));
  // Los detalles aparecen a medida que se sube el panel.
  const detailsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(panelHeight.value, [collapsed, collapsed + 60], [0, 1], 'clamp'),
  }));

  const count = offers.length;
  const title =
    count > 0
      ? `${count} ${count === 1 ? 'conductor respondió' : 'conductores respondieron'}`
      : isSearching
      ? 'Buscando conductores'
      : 'Nadie respondió todavía';
  const subtitle = `Tu precio: S/ ${requestedFare.toFixed(2)} · ${
    isSearching ? `sigues buscando 0:${String(secondsLeft).padStart(2, '0')}` : 'búsqueda en pausa'
  }`;
  // Halo del color de la superficie para que el texto se lea sobre el mapa sin poner una tarjeta.
  const halo = { textShadowColor: theme.surface, textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Degradado sin bordes detrás del encabezado: el texto se lee sobre el mapa sin usar una tarjeta. */}
      <Svg style={styles.topFade} width="100%" height={insets.top + 230} pointerEvents="none">
        <Defs>
          <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.background} stopOpacity={0.96} />
            <Stop offset="0.7" stopColor={theme.background} stopOpacity={0.85} />
            <Stop offset="1" stopColor={theme.background} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#fade)" />
      </Svg>
      <View style={[styles.searchTop, { marginTop: insets.top + 6 }]} pointerEvents="none" accessibilityLiveRegion="polite">
        <SearchPulse active={isSearching} />
        <Text style={[styles.title, halo, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.subtitle, halo, { color: theme.text }]}>{subtitle}</Text>
      </View>

      <Animated.FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        itemLayoutAnimation={LinearTransition.duration(220)}
        renderItem={({ item }) => (
          <Animated.View entering={FadeInDown.duration(260)} exiting={FadeOut.duration(180)}>
            <DriverOfferCard
              driver={item.driver}
              startTime={item.startTime}
              totalDurationSeconds={item.totalDuration}
              offeredFare={requestedFare}
              discount={discount}
              onAccept={() => onAcceptOffer(item.id)}
              onReject={() => onRejectOffer(item.id)}
              onExpired={() => onExpireOffer(item.id)}
            />
          </Animated.View>
        )}
      />

      <Animated.View style={[styles.panel, { backgroundColor: theme.surface }, Shadow.sheet, panelStyle]}>
        <GestureDetector gesture={Gesture.Exclusive(dragGesture, tapGesture)}>
          <View
            style={styles.dragArea}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel={isExpanded ? 'Ocultar detalles de la solicitud' : 'Ver detalles de la solicitud'}
            accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
            onAccessibilityAction={(e) => snapTo(e.nativeEvent.actionName === 'increment')}
          >
            <View style={[styles.handle, { backgroundColor: theme.line }]} />
          </View>
        </GestureDetector>

        <View onLayout={(e) => setFullHeight(e.nativeEvent.layout.height)}>
          <View style={styles.topSection} onLayout={(e) => setTopHeight(e.nativeEvent.layout.height)}>
            <View style={styles.fareRow}>
              <TouchableOpacity
                style={[styles.stepButton, { borderColor: theme.line }, draftFare <= minFare && styles.stepDisabled]}
                onPress={() => changeFare(-FARE_STEP)}
                disabled={draftFare <= minFare}
                accessibilityRole="button"
                accessibilityLabel={`Bajar a S/ ${Math.max(minFare, draftFare - FARE_STEP).toFixed(2)}`}
              >
                <Text style={[styles.stepGlyph, { color: theme.text }]}>−</Text>
              </TouchableOpacity>
              <View style={styles.fareCenter} accessibilityLiveRegion="polite">
                <Text style={[styles.fareLabel, { color: theme.textMuted }]}>
                  {priceChanged ? 'Nuevo precio' : 'Tu precio'}
                </Text>
                <View style={styles.fareValueRow}>
                  <Text style={[styles.fareCurrency, { color: theme.text }]}>S/</Text>
                  <Text style={[styles.fareValue, { color: theme.text }]}>{draftFare.toFixed(2)}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.stepButton, { borderColor: theme.line }, draftFare >= maxFare && styles.stepDisabled]}
                onPress={() => changeFare(FARE_STEP)}
                disabled={draftFare >= maxFare}
                accessibilityRole="button"
                accessibilityLabel={`Subir a S/ ${Math.min(maxFare, draftFare + FARE_STEP).toFixed(2)}`}
              >
                <Text style={[styles.stepGlyph, { color: theme.text }]}>+</Text>
              </TouchableOpacity>
            </View>

            {priceChanged ? (
              <AppButton label="Cambiar precio" onPress={() => onRestartSearch(draftFare)} />
            ) : isSearching ? (
              // Mientras dura la búsqueda, el botón muestra el tiempo que queda; se activa al cambiar el precio.
              <CountdownButton
                tone="neutral"
                height={56}
                label="Cambiar precio"
                accessibilityLabel={`Cambiar precio. Ajusta el monto para activarlo. Quedan ${secondsLeft} segundos de búsqueda`}
                onPress={() => {}}
                disabled
                startedAt={searchStartedAt}
                durationMs={windowMs}
              />
            ) : (
              <AppButton label="Volver a solicitar" onPress={() => onRestartSearch(draftFare)} />
            )}

            <TouchableOpacity
              style={styles.switchRow}
              onPress={() => onToggleAutoAccept(!autoAccept)}
              activeOpacity={0.8}
              accessibilityRole="switch"
              accessibilityState={{ checked: autoAccept }}
              accessibilityLabel="Aceptar automáticamente una oferta igual a tu precio"
            >
              <View style={styles.switchText}>
                <Text style={[styles.switchTitle, { color: theme.text }]}>Aceptar automáticamente</Text>
                <Text style={[styles.switchSubtitle, { color: theme.textMuted }]}>
                  Si un conductor ofrece S/ {requestedFare.toFixed(2)}, se acepta solo
                </Text>
              </View>
              <Switch
                value={autoAccept}
                onValueChange={onToggleAutoAccept}
                trackColor={{ false: theme.line, true: theme.sig }}
                thumbColor={Colors.white}
                ios_backgroundColor={theme.line}
                importantForAccessibility="no"
                accessibilityElementsHidden
              />
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.details, { borderTopColor: theme.line }, detailsStyle]}>
            <View style={styles.serviceRow}>
              <Image source={serviceImage} style={styles.serviceImage} resizeMode="contain" />
              <View style={styles.flex}>
                <Text style={[styles.serviceName, { color: theme.text }]}>{serviceName}</Text>
                <Text style={[styles.serviceMeta, { color: theme.textMuted }]}>
                  Tú propones · S/ {requestedFare.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.route}>
              <View style={styles.rail}>
                <View style={styles.railRing}>
                  <View style={[styles.railDot, { backgroundColor: Colors.pinOrigin }]} />
                </View>
                <View style={[styles.railLine, { backgroundColor: theme.line }]} />
                <View style={styles.railRing}>
                  <View style={[styles.railDot, { backgroundColor: Colors.pinDestination }]} />
                </View>
              </View>
              <View style={styles.routeText}>
                <View>
                  <Text style={[styles.routeLabel, { color: theme.textMuted }]}>Desde</Text>
                  <Text style={[styles.routeValue, { color: theme.text }]} numberOfLines={1}>
                    {originName}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.routeLabel, { color: theme.textMuted }]}>Hacia</Text>
                  <Text style={[styles.routeValue, { color: theme.text }]} numberOfLines={1}>
                    {destinationName}
                  </Text>
                </View>
              </View>
            </View>

            <PaymentRow mode={paymentMode} label={`Pagas con ${paymentMode}`} />

            <TouchableOpacity
              style={[styles.cancel, { borderColor: theme.line }]}
              onPress={onCancelRequest}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Cancelar solicitud"
            >
              <Text style={[styles.cancelText, { color: theme.danger }]}>Cancelar solicitud</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        <View style={{ height: 18 + insets.bottom }} />
      </Animated.View>
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
  // Como .search-top del diseño: ondas centradas y el texto debajo, sin tarjeta.
  searchTop: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 64,
  },
  pulse: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
  },
  bolt: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  list: {
    flex: 1,
  },
  listContent: {
    padding: 12,
    gap: 12,
  },
  panel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  dragArea: {
    paddingTop: 10,
    paddingBottom: 12,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 4,
  },
  topSection: {
    gap: 14,
  },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  stepButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDisabled: {
    opacity: 0.35,
  },
  stepGlyph: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.glyph,
    lineHeight: 30,
  },
  fareCenter: {
    flex: 1,
    minWidth: 140,
    alignItems: 'center',
  },
  fareLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.caption,
  },
  fareValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  fareCurrency: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
  },
  fareValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['3xl'],
    letterSpacing: -0.9,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchText: {
    flex: 1,
  },
  switchTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  switchSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
  },
  details: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 14,
  },
  flex: {
    flex: 1,
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
  route: {
    flexDirection: 'row',
    gap: 10,
  },
  rail: {
    width: 16,
    alignItems: 'center',
    paddingVertical: 6,
  },
  railRing: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.pinRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  railLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  routeText: {
    flex: 1,
    gap: 10,
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
