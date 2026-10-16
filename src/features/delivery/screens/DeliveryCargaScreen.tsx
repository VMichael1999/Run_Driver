import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Reanimated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DeliveryStackParamList } from '@navigation/types';
import { FontFamily } from '@theme/fonts';
import { useDeliveryColors } from '../theme';
import { preloadDeliveryHome } from '../data/preload';

type Props = NativeStackScreenProps<DeliveryStackParamList, 'DeliveryCarga'>;

/** La carga dura lo que tarde la precarga, pero nunca menos que esto. */
export const MIN_LOADING_MS = 600;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function DeliveryCargaScreen({ navigation }: Props) {
  const colors = useDeliveryColors();
  const progress = useSharedValue(0);

  React.useEffect(() => {
    let active = true;
    // La línea avanza mientras carga y se completa al terminar.
    progress.value = withTiming(0.85, { duration: MIN_LOADING_MS, easing: Easing.out(Easing.cubic) });

    void Promise.all([preloadDeliveryHome(), wait(MIN_LOADING_MS)]).then(() => {
      if (!active) return;
      progress.value = withTiming(1, { duration: 160 });
      setTimeout(() => {
        if (active) navigation.replace('DeliveryTabs');
      }, 160);
    });

    return () => {
      active = false;
    };
  }, [navigation, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View style={[styles.container, { backgroundColor: colors.loadingBg }]}>
      <StatusBar style="light" />
      <Image source={require('../../../../assets/icon.png')} style={styles.logo} />
      <Text style={[styles.word, { color: colors.lime }]}>Delivery</Text>
      <View style={[styles.track, { backgroundColor: colors.loadingTrack }]}>
        <Reanimated.View style={[styles.fill, { backgroundColor: colors.lime }, fillStyle]} />
      </View>
      <Text style={[styles.caption, { color: colors.loadingText }]}>
        Buscando locales cerca de Av. Arequipa 2450…
      </Text>
    </View>
  );
}

// Medidas de .trans en docs/delivery/run-delivery-replica.html
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  logo: {
    width: 112,
    height: 112,
    borderRadius: 26,
  },
  word: {
    fontFamily: FontFamily.semibold,
    fontSize: 30,
    lineHeight: 40.5,
  },
  track: {
    width: 150,
    height: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    lineHeight: 16.875,
    maxWidth: 220,
    textAlign: 'center',
  },
});
