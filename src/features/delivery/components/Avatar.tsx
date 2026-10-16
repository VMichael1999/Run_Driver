import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontFamily } from '@theme/fonts';
import { useDeliveryColors } from '../theme';

interface AvatarProps {
  initials: string;
  /** 'header': 40 con borde blanco (.av); 'sm': 38 sin borde con punto en línea (.av.sm); 'md': 46 (.av.md). */
  variant?: 'header' | 'sm' | 'md';
}

/** Avatar con iniciales en círculo (no se usan fotos de personas). */
export function Avatar({ initials, variant = 'header' }: AvatarProps) {
  const colors = useDeliveryColors();
  const size = variant === 'sm' ? 38 : variant === 'md' ? 46 : 40;

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.avatarBg },
        variant === 'header' && { borderWidth: 2, borderColor: colors.onDarkHigh },
      ]}
    >
      <Text style={[styles.text, { color: colors.onDark, fontSize: variant === 'md' ? 14 : 13 }]}>{initials}</Text>
      {variant === 'sm' ? (
        <View style={[styles.online, { backgroundColor: colors.online, borderColor: colors.card }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FontFamily.semibold,
  },
  online: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
});
