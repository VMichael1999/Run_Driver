import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontFamily, FontSize } from '@theme/fonts';

interface Props {
  text: string;
}

export function PlacaTaxi({ text }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.countryCode}>PE</Text>
        <Text style={styles.headerText}>PERU</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.plate}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#000',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#FFD700',
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countryCode: {
    position: 'absolute',
    left: 6,
    fontFamily: FontFamily.bold,
    fontSize: 8,
    color: '#000',
  },
  headerText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#000',
  },
  body: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: 'center',
  },
  plate: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: '#000',
    letterSpacing: 2,
  },
});
