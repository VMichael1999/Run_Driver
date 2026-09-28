import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { PaymentMethod, TripDiscount } from '@shared/types';
import { applyDiscount } from '@features/cliente/promociones/utils/descuentos';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Shadow } from '@theme/spacing';
import { AppButton } from '@shared/components/ui/AppButton';
import { AppIcon } from '@shared/components/ui/AppIcon';
import { PaymentRow } from '@shared/components/ui/PaymentRow';

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
  /** Descuento vigente: rebaja lo que paga el pasajero en todos los servicios. */
  discount?: TripDiscount | null;
  /**
   * Se llama mientras se arrastra la hoja (`settled` = false) y una vez cuando termina de
   * acomodarse (`settled` = true), para reencuadrar la ruta en el mapa.
   */
  onHeightChange?: (height: number, settled: boolean) => void;
  /** Título de la hoja; por defecto "Elige cómo viajar". */
  title?: string;
  /** Texto del botón principal; por defecto "Pedir …" o "Proponer mi precio". */
  submitLabel?: string;
  /** Con un solo servicio fijo: muestra "Otros servicios" para volver a la lista completa. */
  onShowAllServices?: () => void;
}

// Alto de cada fila de servicio (imagen 48 + padding 6*2) más el espacio entre filas.
const ROW_HEIGHT = 62;
// Handle, encabezado, fila de pago, botón y espacios entre ellos.
const SHEET_CHROME = 10 + 4 + 12 + 24 + 12 + 12 + 52 + 12 + 56 + 18;
// Línea "RUN10: 10 % menos en este viaje" y su espacio.
const DISCOUNT_NOTE_HEIGHT = 18 + 12;
const SPRING = { damping: 22, stiffness: 220, mass: 0.9 };

/**
 * Alturas de la hoja. La mínima muestra ~2.5 servicios; la expandida crece solo hasta
 * mostrar toda la lista (`listHeight`), con tope en el alto de pantalla disponible.
 */
export function useServiceSheetHeights(listHeight?: number, hasDiscount = false) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const chrome = SHEET_CHROME + (hasDiscount ? DISCOUNT_NOTE_HEIGHT : 0) + insets.bottom;
  const maxExpanded = Math.round(height - insets.top - 72);
  // +4 absorbe el redondeo de alturas de texto para que la lista completa no quede con scroll.
  const fitsAll = listHeight ? Math.round(chrome + listHeight + 4) : maxExpanded;
  const expanded = Math.min(maxExpanded, fitsAll);
  const collapsed = Math.min(Math.round(chrome + ROW_HEIGHT * 2.6), expanded);
  return { collapsed, expanded };
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
  discount,
  onHeightChange,
  title = 'Elige cómo viajar',
  submitLabel: submitLabelOverride,
  onShowAllServices,
}: ServiceSelectionSheetProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [listHeight, setListHeight] = React.useState<number | undefined>(undefined);
  const { collapsed, expanded } = useServiceSheetHeights(listHeight, Boolean(discount));

  const sheetHeight = useSharedValue(collapsed);
  const dragStart = useSharedValue(collapsed);
  const isDragging = useSharedValue(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Lleva la hoja a su altura y, cuando termina el resorte, avisa una sola vez el alto final.
  const settleTo = React.useCallback(
    (target: number) => {
      sheetHeight.value = withSpring(target, SPRING, (finished) => {
        if (finished && onHeightChange) runOnJS(onHeightChange)(target, true);
      });
    },
    [onHeightChange, sheetHeight],
  );

  // Si cambia la lista (o se mide por primera vez), la hoja se ajusta a la nueva altura.
  React.useEffect(() => {
    settleTo(isExpanded ? expanded : collapsed);
  }, [collapsed, expanded, isExpanded, settleTo]);

  // Mientras el dedo arrastra, avisa el alto cada ~32 px para que el mapa acompañe.
  useAnimatedReaction(
    () => (isDragging.value ? Math.round(sheetHeight.value / 32) * 32 : -1),
    (current, previous) => {
      if (onHeightChange && current > 0 && current !== previous) runOnJS(onHeightChange)(current, false);
    },
    [onHeightChange],
  );

  const snapTo = React.useCallback(
    (toExpanded: boolean) => {
      settleTo(toExpanded ? expanded : collapsed);
      setIsExpanded(toExpanded);
    },
    [collapsed, expanded, settleTo],
  );

  // Solo la cabecera (handle + título) arrastra la hoja; la lista hace scroll por su cuenta.
  const dragGesture = Gesture.Pan()
    .onStart(() => {
      dragStart.value = sheetHeight.value;
      isDragging.value = true;
    })
    .onUpdate((e) => {
      const next = dragStart.value - e.translationY;
      sheetHeight.value = Math.max(collapsed - 40, Math.min(expanded, next));
    })
    .onEnd((e) => {
      isDragging.value = false;
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

  const submitLabel = submitLabelOverride ?? (isAuction
    ? 'Proponer mi precio'
    : `Pedir ${selectedService?.name ?? 'viaje'} · S/ ${applyDiscount(selectedService?.price ?? 0, discount).toFixed(2)}`);

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
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            {onShowAllServices ? (
              <TouchableOpacity
                onPress={onShowAllServices}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Ver otros servicios"
              >
                <Text style={[styles.link, { color: theme.text }]}>Otros servicios</Text>
              </TouchableOpacity>
            ) : distanceKm && durationMin ? (
              <Text style={[styles.meta, { color: theme.textMuted }]}>
                {distanceKm.toFixed(1)} km · {durationMin} min
              </Text>
            ) : null}
          </View>
          {discount ? (
            <View style={styles.discountNote}>
              <AppIcon name="tag" size="s" color={theme.online} />
              <Text style={[styles.discountText, { color: theme.text }]} numberOfLines={1}>
                {discount.source === 'coupon' ? `${discount.label}: ` : ''}
                {discount.percent} % menos en este viaje
              </Text>
            </View>
          ) : null}
        </View>
      </GestureDetector>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        onContentSizeChange={(_w, h) => setListHeight(h)}
      >
        {services.map((item) => {
          const isSelected = item.id === selectedId;
          const finalPrice = applyDiscount(item.price, discount);
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
                item.isAuction
                  ? `tú propones el precio${discount ? `, pagas ${discount.percent} % menos` : ''}`
                  : `${item.currency} ${finalPrice.toFixed(2)}${
                      discount ? `, antes ${item.currency} ${item.price.toFixed(2)}` : ''
                    }, llega en ${item.etaMinutes} minutos`
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
                <View style={styles.priceBlock}>
                  {discount ? (
                    <Text style={[styles.priceBefore, { color: theme.textMuted }]}>
                      {item.currency} {item.price.toFixed(2)}
                    </Text>
                  ) : null}
                  <Text style={[styles.price, { color: theme.text }]}>
                    {item.currency} {finalPrice.toFixed(2)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footerRow}>
        <PaymentRow mode={paymentMethod.mode} onPress={onOpenPayment} style={styles.payRow} />

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
  link: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.caption,
    textDecorationLine: 'underline',
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
  priceBlock: {
    alignItems: 'flex-end',
  },
  price: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    textAlign: 'right',
  },
  priceBefore: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    textDecorationLine: 'line-through',
  },
  discountNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 18,
  },
  discountText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.caption,
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
  },
  iconButton: {
    width: 52,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
