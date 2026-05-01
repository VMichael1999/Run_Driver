import React from 'react';
import { Animated, StyleSheet, type ViewStyle } from 'react-native';
import { useDrawerStatus } from '@react-navigation/drawer';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function DrawerSceneWrapper({ children, style }: Props) {
  const drawerStatus = useDrawerStatus();
  const progress = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(progress, {
      toValue: drawerStatus === 'open' ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [drawerStatus, progress]);

  const animatedStyle = {
    transform: [
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.82],
          extrapolate: 'clamp',
        }),
      },
      {
        translateX: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 160],
          extrapolate: 'clamp',
        }),
      },
    ],
    borderRadius: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 22],
      extrapolate: 'clamp',
    }),
    overflow: 'hidden' as const,
  };

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
});
