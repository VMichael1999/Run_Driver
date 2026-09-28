import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { PaymentMethod } from '@shared/types';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Shadow } from '@theme/spacing';
import { AppButton } from '@shared/components/ui/AppButton';
import { AppIcon } from '@shared/components/ui/AppIcon';

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

// Alto de cada fila de servicio (imagen 48 + padding 6*2) más el espacio entre filas.
const ROW_HEIGHT = 62;
// Handle, encabezado, fila de pago, botón y espacios entre ellos.
const SHEET_CHROME = 10 + 4 + 12 + 24 + 12 + 12 + 52 + 12 + 56 + 18;
const SPRING = { damping: 22, stiffness: 220, mass: 0.9 };

/** Alturas de la hoja: mínima al elegir destino y expandida al arrastrarla. */
export function useServiceSheetHeights() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const collapsed = Math.round(SHEET_CHROME + insets.bottom + ROW_HEIGHT * 2.6);
  const expanded = Math.round(height - insets.top - 72);
  return { collapsed: Math.min(collapsed, expanded), expanded };
}

const PAYMENT_LOGOS = {
  Yape: require('../../../../../assets/payment/Yape.png'),
  Plin: require('../../../../../assets/payment/Plin.png'),
  Efectivo: require('../../../../../assets/payment/Efectivo.png'),
} as const;

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
  const { collapsed, expanded } = useServiceSheetHeights();

  const sheetHeight = useSharedValue(collapsed);
  const dragStart = useSharedValue(collapsed);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const snapTo = React.useCallback(
    (toExpanded: boolean) => {
      sheetHeight.value = withSpring(toExpanded ? expanded : collapsed, SPRING);
      setIsExpanded(toExpanded);
    },
    [collapsed, expanded, sheetHeight],
  );

  // Solo la cabecera (handle + título) arrastra la hoja; la lista hace scroll por su cuenta.
  const dragGesture = Gesture.Pan()
    .onStart(() => {
      dragStart.value = sheetHeight.value;
    })
    .onUpdate((e) => {
      const next = dragStart.value - e.translationY;
      sheetHeight.value = Math.max(collapsed - 40, Math.min(expanded, next));
    })
    .onEnd((e) => {
      const middle = (collapsed + expanded) / 2;
      const toExpanded = e.velocityY < -500 ? true : e.velocityY > 500 ? false : sheetHeight.value > middle;
      runOnJS(snapTo)(toExpanded);
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(snapTo)(!isExpanded);
  });

  const sheetStyle = useAnimatedStyle(() => ({ height: sheetHeight.value }));

  const selectedService = services.find((s) => s.id === selectedId) ?? services[0];
  const isAuction = selectedService?.isAuction === true;
  const paymentLogo = PAYMENT_LOGOS[paymentMethod.mode] ?? PAYMENT_LOGOS.Efectivo;

  const submitLabel = isAuction
    ? 'Proponer mi precio'
    : `Pedir ${selectedService?.name ?? 'viaje'} · S/ ${(selectedService?.price ?? 0).toFixed(2)}`;

  return (
    <Animated.View
      style={[
        styles.sheet,
        { backgroundColor: theme.surface, paddingBottom: 18 + insets.bottom },
        Shadow.sheet,
        sheetStyle,
      ]}
    >
      <GestureDetector gesture={Gesture.Exclusive(dragGesture, tapGesture)}>
        <View
          style={styles.dragArea}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={isExpanded ? 'Contraer lista de servicios' : 'Expandir lista de servicios'}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => snapTo(e.nativeEvent.actionName === 'increment')}
        >
          <View style={[styles.handle, { backgroundColor: theme.line }]} />
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.text }]}>Elige cómo viajar</Text>
            {distanceKm && durationMin ? (
              <Text style={[styles.meta, { color: theme.textMuted }]}>
                {distanceKm.toFixed(1)} km · {durationMin} min
              </Text>
            ) : null}
          </View>
        </View>
      </GestureDetector>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {services.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.svc,
                isSelected && { borderColor: theme.text, backgroundColor: theme.background },
              ]}
              onPress={() => onSelectService(item.id)}
              activeOpacity={0.82}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${item.name}, ${
                item.isAuction ? 'tú propones el precio' : `${item.currency} ${item.price.toFixed(2)}, llega en ${item.etaMinutes} minutos`
              }`}
            >
              <Image source={item.image} style={styles.svcImage} resizeMode="contain" />
              <View style={styles.svcInfo}>
                <Text style={[styles.svcName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.svcMeta, { color: theme.textMuted }]}>
                  {item.isAuction ? 'Propón tu precio' : `${item.seats} asientos · ${item.etaMinutes} min`}
                </Text>
              </View>
              {item.isAuction ? (
                <View style={[styles.youPill, { backgroundColor: theme.sig }]}>
                  <Text style={[styles.youText, { color: theme.onSig }]}>Tú propones</Text>
                </View>
              ) : (
                <Text style={[styles.price, { color: theme.text }]}>
                  {item.currency} {item.price.toFixed(2)}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footerRow}>
        <TouchableOpacity
          style={[styles.payRow, { borderColor: theme.line }]}
          onPress={onOpenPayment}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Método de pago: ${paymentMethod.mode}. Cambiar`}
        >
          <Image source={paymentLogo} style={styles.payLogo} resizeMode="contain" />
          <Text style={[styles.payName, { color: theme.text }]}>{paymentMethod.mode}</Text>
          <View style={styles.change}>
            <Text style={[styles.changeText, { color: theme.textMuted }]}>Cambiar</Text>
            <AppIcon name="chev" size="s" color={theme.textMuted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, { borderColor: tripNotes ? theme.text : theme.line }]}
          onPress={onOpenNotes}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={tripNotes ? 'Ver nota para el conductor' : 'Agregar nota para el conductor'}
        >
          <AppIcon name="msg" color={theme.text} />
        </TouchableOpacity>

        {onSchedulePress ? (
          <TouchableOpacity
            style={[styles.iconButton, { borderColor: theme.line }]}
            onPress={onSchedulePress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Programar para más tarde"
          >
            <AppIcon name="cal" color={theme.text} />
          </TouchableOpacity>
        ) : null}
      </View>

      <AppButton label={submitLabel} variant={isAuction ? 'sig' : 'primary'} onPress={onSubmit} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 14,
    gap: 12,
  },
  dragArea: {
    paddingTop: 10,
    gap: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lead,
  },
  meta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 2,
  },
  svc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 6,
    paddingRight: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  svcImage: {
    width: 74,
    height: 48,
  },
  svcInfo: {
    flex: 1,
  },
  svcName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.bodyLg,
  },
  svcMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  price: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    textAlign: 'right',
  },
  youPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  youText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  payRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  payLogo: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
  },
  payName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  change: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  iconButton: {
    width: 52,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
