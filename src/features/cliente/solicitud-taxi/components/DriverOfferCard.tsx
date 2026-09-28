import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DriverAlert } from '@shared/types';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';
import { PlacaVehiculo } from '@shared/components/ui/PlacaVehiculo';

interface DriverOfferCardProps {
  driver: DriverAlert;
  startTime: Date;
  totalDurationSeconds?: number;
  offeredFare: number;
  onAccept: () => void;
  onReject: () => void;
  onTimeUpdate?: (remainingSeconds: number) => void;
  onExpired?: () => void;
}

export function DriverOfferCard({
  driver,
  totalDurationSeconds = 12,
  offeredFare,
  onAccept,
  onReject,
  onTimeUpdate,
  onExpired,
}: DriverOfferCardProps) {
  const theme = useAppTheme();
  const [isAcceptLoading, setIsAcceptLoading] = useState(false);
  const [isRejectLoading, setIsRejectLoading] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(totalDurationSeconds);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didExpireRef = useRef(false);

  const priceDiff = driver.price - offeredFare;
  const isLower = priceDiff < -0.01;
  const isHigher = priceDiff > 0.01;
  const isSame = Math.abs(priceDiff) < 0.01;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemainingSeconds((current) => {
        const next = Math.max(0, current - 1);
        onTimeUpdate?.(next);
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onTimeUpdate]);

  useEffect(() => {
    if (remainingSeconds > 0 || didExpireRef.current) return;
    didExpireRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    onExpired?.();
  }, [onExpired, remainingSeconds]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: Math.max(0, remainingSeconds / totalDurationSeconds),
      duration: 950,
      useNativeDriver: false,
    }).start();
  }, [progressAnim, remainingSeconds, totalDurationSeconds]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const handleAccept = useCallback(async () => {
    if (isAcceptLoading || isRejectLoading) return;
    setIsAcceptLoading(true);
    try {
      await onAccept();
    } finally {
      setIsAcceptLoading(false);
    }
  }, [onAccept, isAcceptLoading, isRejectLoading]);

  const handleReject = useCallback(async () => {
    if (isAcceptLoading || isRejectLoading) return;
    setIsRejectLoading(true);
    try {
      await onReject();
    } finally {
      setIsRejectLoading(false);
    }
  }, [onReject, isAcceptLoading, isRejectLoading]);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.line }, Shadow.raise]}>
      {/* Cabecera: Conductor, vehículo y precio */}
      <View style={styles.topRow}>
        <Image source={{ uri: driver.imageUrl }} style={styles.avatar} />

        <View style={styles.driverInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.driverName, { color: theme.text }]} numberOfLines={1}>
              {driver.driverName}
            </Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={13} color={Colors.star} />
              <Text style={[styles.ratingText, { color: theme.text }]}>
                {driver.rating.toFixed(1)}
              </Text>
            </View>
          </View>

          <View style={styles.vehicleRow}>
            <Text style={[styles.vehicleModel, { color: theme.textMuted }]} numberOfLines={1}>
              {driver.vehicleModel}
            </Text>
            <PlacaVehiculo plate={driver.vehiclePlate} size="sm" />
          </View>
        </View>

        <View style={styles.priceColumn}>
          <Text style={[styles.priceValue, { color: theme.text }]}>
            {driver.currency} {driver.price.toFixed(2)}
          </Text>
          {isSame ? (
            <View style={[styles.diffBadge, { backgroundColor: theme.surfaceMuted }]}>
              <Text style={[styles.diffText, { color: theme.textMuted }]}>Tu oferta</Text>
            </View>
          ) : isLower ? (
            <View style={[styles.diffBadge, { backgroundColor: theme.onlineSoft }]}>
              <Text style={[styles.diffText, { color: theme.online }]}>
                −{driver.currency} {Math.abs(priceDiff).toFixed(0)}
              </Text>
            </View>
          ) : isHigher ? (
            <View style={[styles.diffBadge, { backgroundColor: theme.surfaceMuted }]}>
              <Text style={[styles.diffText, { color: theme.textMuted }]}>
                +{driver.currency} {priceDiff.toFixed(0)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* ETA y distancia */}
      <View style={styles.metaRow}>
        <Ionicons name="time-outline" size={14} color={theme.textMuted} />
        <Text style={[styles.metaText, { color: theme.textMuted }]}>
          Llega en {driver.etaMinutes} min ({driver.distanceKm.toFixed(1)} km)
        </Text>
      </View>

      {/* Barra regresiva de tiempo en Lima (#D4E838) */}
      <View style={[styles.timerTrack, { backgroundColor: theme.line }]}>
        <Animated.View style={[styles.timerBar, { width: progressWidth, backgroundColor: theme.sig }]} />
      </View>

      {/* Botones de acción */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.rejectBtn, { borderColor: theme.line, backgroundColor: theme.surface }]}
          onPress={handleReject}
          disabled={isAcceptLoading || isRejectLoading}
          activeOpacity={0.8}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Rechazar oferta de ${driver.driverName}`}
        >
          {isRejectLoading ? (
            <ActivityIndicator size="small" color={theme.textMuted} />
          ) : (
            <Text style={[styles.rejectText, { color: theme.textMuted }]}>Rechazar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.acceptBtn, { backgroundColor: theme.sig }]}
          onPress={handleAccept}
          disabled={isAcceptLoading || isRejectLoading}
          activeOpacity={0.85}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Aceptar oferta de ${driver.driverName} por ${driver.currency} ${driver.price.toFixed(2)}`}
        >
          {isAcceptLoading ? (
            <ActivityIndicator size="small" color={theme.onSig} />
          ) : (
            <Text style={[styles.acceptText, { color: theme.onSig }]}>
              Aceptar por {driver.currency} {driver.price.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  driverInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md - 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vehicleModel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    maxWidth: 90,
  },
  priceColumn: {
    alignItems: 'flex-end',
    gap: 2,
  },
  priceValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    fontVariant: ['tabular-nums'],
  },
  diffBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.full,
  },
  diffText: {
    fontFamily: FontFamily.semibold,
    fontSize: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  timerTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 2,
  },
  timerBar: {
    height: '100%',
    borderRadius: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  rejectBtn: {
    flex: 1,
    height: 42,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  acceptBtn: {
    flex: 1.6,
    height: 42,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
});
