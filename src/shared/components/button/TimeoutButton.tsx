import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet, View, type ViewStyle } from 'react-native';
import { Colors } from '@theme/colors';

interface Props {
  durationMs?: number;
  onFinish?: () => void;
  onPress?: () => void;
  backgroundColor?: string;
  fillColor?: string;
  height?: number;
  width?: number;
  style?: ViewStyle;
  children: React.ReactNode;
}

export function TimeoutButton({
  durationMs = 10000,
  onFinish,
  onPress,
  backgroundColor = Colors.white,
  fillColor = 'rgba(128,128,128,0.4)',
  height = 64,
  width,
  style,
  children,
}: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const widthRef = useRef<number>(0);

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: durationMs,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished) onFinish?.();
    });
    return () => anim.stop();
  }, []);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.outer, { height, width, backgroundColor }, style]}
      onLayout={(e) => { widthRef.current = e.nativeEvent.layout.width; }}
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, { width: fillWidth, backgroundColor: fillColor }]} />
      </View>
      <View style={styles.content}>{children}</View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
