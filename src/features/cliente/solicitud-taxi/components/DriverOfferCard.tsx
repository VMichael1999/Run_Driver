import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DriverAlert } from '@shared/types';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

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
  totalDurationSeconds = 10,
  offeredFare,
  onAccept,
  onReject,
  onTimeUpdate,
  onExpired,
}: DriverOfferCardProps) {
  const [isAcceptLoading, setIsAcceptLoading] = useState(false);
  const [isRejectLoading, setIsRejectLoading] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(totalDurationSeconds);
  const acceptProgress = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didExpireRef = useRef(false);
  const showYourFare = Math.abs(driver.price - offeredFare) < 0.01;

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
    Animated.timing(acceptProgress, {
      toValue: remainingSeconds / totalDurationSeconds,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [acceptProgress, remainingSeconds, totalDurationSeconds]);

  const acceptProgressWidth = acceptProgress.interpolate({
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
    <View style={styles.container}>
      <View style={styles.driverRow}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: driver.imageUrl }} style={styles.avatar} />
        </View>

        <View style={styles.driverInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.driverName}>{driver.driverName}</Text>
            <View style={styles.ratingWrap}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.ratingText}>{driver.rating.toFixed(1)}</Text>
            </View>
          </View>

          <View style={styles.vehicleRow}>
            <Ionicons name="car" size={14} color="#64748b" />
            <Text style={styles.vehicleText}>
              {driver.vehicleModel} - {driver.vehiclePlate}
            </Text>
          </View>
        </View>

        <View style={styles.etaColumn}>
          <Text style={styles.etaLabel}>LLega en</Text>
          <Text style={styles.etaValue}>{driver.etaMinutes} min</Text>
        </View>
      </View>

      <View style={styles.priceSection}>
        <Text style={styles.priceValue}>
          {driver.currency} 
          {driver.price.toFixed(2)}
        </Text>
        {showYourFare ? (
          <View style={styles.yourFarePill}>
            <Text style={styles.yourFareText}>Tu tarifa</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.rejectButton, (isAcceptLoading || isRejectLoading) && styles.buttonDisabled]}
          onPress={handleReject}
          disabled={isAcceptLoading || isRejectLoading}
          activeOpacity={0.8}
        >
          {isRejectLoading ? (
            <Ionicons name="hourglass" size={20} color="#94a3b8" />
          ) : (
            <Text style={styles.rejectButtonText}>Rechazar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.acceptButton,
            (isAcceptLoading || isRejectLoading) && styles.acceptButtonDisabled,
          ]}
          onPress={handleAccept}
          disabled={isAcceptLoading || isRejectLoading}
          activeOpacity={0.88}
        >
          <Animated.View style={[styles.acceptProgressFill, { width: acceptProgressWidth }]} />
          {isAcceptLoading ? (
            <Ionicons name="hourglass" size={20} color={Colors.white} />
          ) : (
            <Text style={styles.acceptButtonText}>Aceptar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 6,
    padding: Spacing.md,
    ...Shadow.md,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarWrap: {
    marginRight: Spacing.md,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  driverInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  driverName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: '#1f2937',
    marginRight: Spacing.xs,
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#64748b',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicleText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: '#1f2937',
  },
  etaColumn: {
    alignItems: 'flex-end',
  },
  etaLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#94a3b8',
    marginBottom: 2,
  },
  etaValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: '#1f2937',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: Spacing.sm,
  },
  priceValue: {
    fontFamily: FontFamily.bold,
    fontSize: 30,
    color: '#111827',
  },
  yourFarePill: {
    backgroundColor: '#111111',
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  yourFareText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  buttonsRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  rejectButton: {
    flex: 1,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  rejectButtonText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.lg,
    color: '#111827',
  },
  acceptButton: {
    flex: 1,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: '#1d5fa8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  acceptProgressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#60a5fa',
  },
  acceptButtonDisabled: {
    opacity: 0.6,
  },
  acceptButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.white,
  },
});
