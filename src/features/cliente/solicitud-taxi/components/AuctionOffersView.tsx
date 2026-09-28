import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  FadeInDown,
  FadeOut,
  LinearTransition,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { DriverAlert } from '@shared/types';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Shadow } from '@theme/spacing';
import { AppButton } from '@shared/components/ui/AppButton';
import { AppIcon } from '@shared/components/ui/AppIcon';
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
}

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

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View
        style={[
          styles.header,
          { marginTop: insets.top + 6, backgroundColor: theme.surface },
          Shadow.raise,
        ]}
        accessibilityLiveRegion="polite"
      >
        <SearchPulse active={isSearching} />
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
        </View>
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
              onAccept={() => onAcceptOffer(item.id)}
              onReject={() => onRejectOffer(item.id)}
              onExpired={() => onExpireOffer(item.id)}
            />
          </Animated.View>
        )}
      />

      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, paddingBottom: 18 + insets.bottom },
          Shadow.sheet,
        ]}
      >
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  header: {
    marginLeft: 64,
    marginRight: 12,
    borderRadius: BorderRadius.xl,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pulse: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
  },
  bolt: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lead,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
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
    paddingTop: 16,
    paddingHorizontal: 16,
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
});
