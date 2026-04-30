import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SearchingDriversUIProps {
  isSearching: boolean;
  onCancel?: () => void;
}

export function SearchingDriversUI({ isSearching, onCancel }: SearchingDriversUIProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSearching) {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
      rippleAnim.setValue(0);

      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnimation.start();

      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      rotateAnimation.start();

      const rippleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(rippleAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rippleAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
      rippleAnimation.start();
    }
  }, [isSearching, pulseAnim, rotateAnim, rippleAnim]);

  if (!isSearching) return null;

  const scale = pulseAnim.interpolate({
    inputRange: [1, 1.2],
    outputRange: [1, 1.1],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 2],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.2, 0],
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchingCard}>
        <Animated.View
          style={[
            styles.rippleCircle,
            { transform: [{ scale: rippleScale }], opacity: rippleOpacity },
          ]}
        />

        <Animated.View
          style={[styles.searchingCircle, { transform: [{ scale }, { rotate }] }]}
        >
          <Ionicons name="search" size={28} color={Colors.white} />
        </Animated.View>

        <Text style={styles.title}>Buscando conductores</Text>
        <Text style={styles.subtitle}>
          Espera un momento mientras encontramos un conductor
        </Text>
      </View>

      <View style={styles.driverAvatarsRow}>
        {[1, 2, 3].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.driverAvatarPlaceholder,
              { opacity: 0.3 + i * 0.15 },
            ]}
          >
            <Ionicons name="person" size={20} color={Colors.white} />
          </Animated.View>
        ))}
      </View>

      {onCancel && (
        <View style={styles.cancelSection}>
          <Text style={styles.cancelText}>o cancela para buscar más tarde</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  searchingCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
  rippleCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1d5fa8',
  },
  searchingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1d5fa8',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: '#1f2937',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#64748b',
    textAlign: 'center',
  },
  driverAvatarsRow: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  driverAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelSection: {
    marginTop: Spacing.lg,
  },
  cancelText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#94a3b8',
  },
});