import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image } from 'react-native';
import { Colors } from '@theme/colors';

export function PinRipple() {
  const scale1 = useRef(new Animated.Value(0.5)).current;
  const scale2 = useRef(new Animated.Value(0.5)).current;
  const opacity1 = useRef(new Animated.Value(0.8)).current;
  const opacity2 = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const createLoop = (scale: Animated.Value, opacity: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1.8, duration: 1500, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 0.5, duration: 0, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.8, duration: 0, useNativeDriver: true }),
          ]),
        ]),
      );

    const a1 = createLoop(scale1, opacity1, 0);
    const a2 = createLoop(scale2, opacity2, 750);
    a1.start();
    a2.start();
    return () => { a1.stop(); a2.stop(); };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.ripple, { transform: [{ scale: scale1 }], opacity: opacity1 }]} />
      <Animated.View style={[styles.ripple, { transform: [{ scale: scale2 }], opacity: opacity2 }]} />
      <View style={styles.pin}>
        <View style={styles.pinDot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    opacity: 0.3,
  },
  pin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
});
