import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Reanimated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { DeliveryStackParamList } from '@navigation/types';
import { FontFamily } from '@theme/fonts';
import { DeliveryColors } from '@theme/colors';
import { useDeliveryColors } from '../theme';
import { useStatusBarStyle } from '../hooks/useStatusBarStyle';
import { useOrderSimulation } from '../hooks/useOrderSimulation';
import { useActiveOrderStore } from '../store/useActiveOrderStore';
import { formatClock, formatStopwatch, PHASES, type OrderPhase } from '../utils/orderSimulation';
import { TrackingMap, type TrackingMapHandle } from '../components/seguimiento/TrackingMap';
import {
  FindingCard,
  FromTo,
  RatingCard,
  RiderCard,
  StatusHeader,
  StepBar,
  Timeline,
  YourOrder,
  type TimelineRow,
} from '../components/seguimiento/TrackingBlocks';
import { COURIER, MAP_POINTS, RESTAURANTS } from '../data/mock';

type Props = NativeStackScreenProps<DeliveryStackParamList, 'DeliverySeguimiento'>;

/** Alto visible de la hoja a media altura (del-16: 700 − mapa de 380 + 22 que se monta sobre el mapa). */
const SHEET_PEEK = 342;
/** Ruta de Burger Ruta a Casa (del-18). */
const ROUTE_KM = 1.8;
const ROUTE_MINUTES = 6;
const ARRIVAL_MINUTES = 20;
const EN_CAMINO_MS = PHASES.find((phase) => phase.id === 'en-camino')?.ms ?? 10000;

const TIMELINE_LABELS = ['Pedido confirmado', 'Preparando tu pedido', 'Repartidor lo recogió', 'En camino', 'Entregado'];

function headerTexts(phase: OrderPhase, storeName: string, kmLeft: number) {
  switch (phase) {
    case 'confirmado':
    case 'buscando':
      return { title: 'Pedido confirmado', subtitle: `Enviando tu pedido a ${storeName}` };
    case 'preparando':
      return { title: 'Preparando tu pedido', subtitle: `${storeName} lo está preparando` };
    case 'recogido':
      return { title: 'Pedido recogido', subtitle: `${COURIER.firstName} recogió tu pedido` };
    case 'en-camino':
      return { title: 'En camino', subtitle: `${COURIER.firstName} está a ${kmLeft.toFixed(1)} km` };
    default:
      return { title: 'Entregado. ¡Buen provecho!', subtitle: 'Gracias por pedir con Run Rider' };
  }
}

/** Seguimiento del pedido (del-16 a del-20). */
export function DeliverySeguimientoScreen({ navigation }: Props) {
  const colors = useDeliveryColors();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  useStatusBarStyle('dark');

  const order = useActiveOrderStore((s) => s.order);
  const rating = useActiveOrderStore((s) => s.rating);
  const rate = useActiveOrderStore((s) => s.rate);
  const clearOrder = useActiveOrderStore((s) => s.clear);
  const sim = useOrderSimulation(order?.startedAt ?? null);
  const mapRef = React.useRef<TrackingMapHandle>(null);

  // Hoja con dos posiciones: media (deja ver el mapa) y expandida (debajo de la barra superior).
  const expandedTop = insets.top + 46;
  const collapsedTop = Math.max(expandedTop + 120, windowHeight - SHEET_PEEK);
  const range = collapsedTop - expandedTop;
  const offset = useSharedValue(range);
  const dragStart = useSharedValue(range);
  const [expanded, setExpanded] = React.useState(false);

  const snap = (toExpanded: boolean) => {
    'worklet';
    offset.value = withSpring(toExpanded ? 0 : range, { damping: 22, stiffness: 220 });
    runOnJS(setExpanded)(toExpanded);
  };

  const makePan = () =>
    Gesture.Pan()
      .activeOffsetY([-8, 8])
      .onStart(() => {
        dragStart.value = offset.value;
      })
      .onUpdate((event) => {
        offset.value = Math.min(range, Math.max(0, dragStart.value + event.translationY));
      })
      .onEnd((event) => {
        const toExpanded = event.velocityY < -500 || (event.velocityY < 500 && offset.value < range / 2);
        snap(toExpanded);
      });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));

  if (!order || !sim) {
    return (
      <View style={[styles.screen, styles.empty, { backgroundColor: colors.bg }]}>
        <Text style={[styles.emptyText, { color: colors.muted }]}>No tienes un pedido en curso.</Text>
      </View>
    );
  }

  const store = RESTAURANTS[order.restaurantId];
  const storeName = store.name.split(' – ')[0];
  const delivered = sim.phase === 'entregado';
  const enCamino = sim.phase === 'en-camino';
  const kmLeft = enCamino ? ROUTE_KM * (1 - sim.phaseProgress) : ROUTE_KM;
  const texts = headerTexts(sim.phase, storeName, kmLeft);
  const arrivesAt = formatClock(new Date(order.startedAt + ARRIVAL_MINUTES * 60000));
  const finding = sim.phase === 'confirmado' || sim.phase === 'buscando';

  const timeline: TimelineRow[] = TIMELINE_LABELS.map((label, index) => {
    const startedAt = sim.stepStartedAtMs[index];
    if (index < sim.step || (delivered && index === 4)) {
      return { label, state: 'done', value: startedAt === null ? undefined : formatClock(new Date(order.startedAt + startedAt)) };
    }
    if (index === sim.step) return { label, state: 'current', value: formatStopwatch(sim.stepElapsedMs) };
    return { label, state: 'pending' };
  });

  const goHome = () => navigation.navigate('DeliveryTabs', { screen: 'DeliveryInicio' });

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.map, { height: collapsedTop + 22 }]}>
        <TrackingMap
          ref={mapRef}
          store={store}
          storeCoordinate={MAP_POINTS.burgerRuta}
          destination={order.address.coordinate}
          carActive={enCamino}
          carDurationMs={EN_CAMINO_MS}
          topPadding={insets.top + 46}
          bottomPadding={22}
        />
      </View>

      <View style={[styles.topBar, { top: insets.top + 2 }]} pointerEvents="box-none">
        <Pressable onPress={goHome} style={[styles.roundButton, { backgroundColor: colors.card }]} accessibilityRole="button" accessibilityLabel="Volver al inicio">
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </Pressable>
        <View style={[styles.orderChip, { backgroundColor: colors.card }]}>
          <Text style={[styles.orderChipText, { color: colors.ink }]}>Pedido #{order.id}</Text>
        </View>
        <Pressable
          onPress={() => mapRef.current?.center()}
          style={[styles.roundButton, { backgroundColor: colors.card }]}
          accessibilityRole="button"
          accessibilityLabel="Centrar la ruta en el mapa"
        >
          <Ionicons name="locate-outline" size={20} color={colors.ink} />
        </Pressable>
      </View>

      <Reanimated.View
        style={[styles.sheet, { top: expandedTop, backgroundColor: colors.bg }, sheetStyle]}
        accessibilityHint="Desliza hacia arriba para ver el detalle del pedido"
      >
        <GestureDetector gesture={makePan()}>
          <View style={styles.grabArea}>
            <Pressable onPress={() => snap(!expanded)} hitSlop={10} accessibilityRole="button" accessibilityLabel={expanded ? 'Bajar la hoja' : 'Subir la hoja'}>
              <View style={[styles.grab, { backgroundColor: colors.line }]} />
            </Pressable>
          </View>
        </GestureDetector>
        <GestureDetector gesture={expanded ? Gesture.Native() : makePan()}>
          <ScrollView
            scrollEnabled={expanded}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.sheetContent, { paddingBottom: insets.bottom + 14 + (expanded ? 0 : range) }]}
          >
            <StatusHeader
              chip={delivered ? 'Completado' : `En vivo · ${formatStopwatch(sim.stepElapsedMs)}`}
              done={delivered}
              title={texts.title}
              subtitle={texts.subtitle}
              minutes={delivered ? undefined : sim.minutesLeft}
              arrivesAt={delivered ? undefined : arrivesAt}
            />
            <StepBar step={sim.step} stepProgress={sim.stepProgress} />
            {delivered ? (
              <RatingCard
                rating={rating}
                onRate={rate}
                onHome={() => {
                  goHome();
                  clearOrder();
                }}
              />
            ) : null}
            {finding ? <FindingCard /> : <RiderCard showVehicle={!delivered} />}
            {delivered ? null : <Timeline rows={timeline} />}
            {delivered ? null : (
              <FromTo
                store={store}
                addressLabel={order.address.label}
                addressDetail={order.address.detail}
                distanceKm={ROUTE_KM}
                tripMinutes={ROUTE_MINUTES}
              />
            )}
            {delivered ? null : <YourOrder items={order.items} total={order.charges.total} paymentLabel={order.paymentLabel} />}
          </ScrollView>
        </GestureDetector>
      </Reanimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  // .tbar: top 46, volver · "Pedido #2318" · centrar
  topBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DeliveryColors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  orderChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: DeliveryColors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  orderChipText: {
    fontFamily: FontFamily.semibold,
    fontSize: 13.5,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 6,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  grabArea: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 6,
  },
  grab: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  // .tsheet: padding 8 14 14, gap 10
  sheetContent: {
    paddingHorizontal: 14,
    gap: 10,
  },
});
