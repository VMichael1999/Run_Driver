import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/types';
import { Colors } from '@theme/colors';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export function SplashScreen() {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('Auth'), 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../app-icons/playstore-icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.splash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220,
    height: 220,
  },
});
