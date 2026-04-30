import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';

interface Props {
  onTerminos?: () => void;
  onPoliticas?: () => void;
}

export function TermsPoliciesCard({ onTerminos, onPoliticas }: Props) {
  return (
    <Text style={styles.text}>
      Al unirte a nuestra aplicacion, estas aceptando nuestros{' '}
      <Text style={styles.link} onPress={onTerminos}>
        Terminos de Uso
      </Text>{' '}
      y{' '}
      <Text style={styles.link} onPress={onPoliticas}>
        Politica de Privacidad
      </Text>
      .
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  link: {
    color: '#2563eb',
    textDecorationLine: 'underline',
    fontFamily: FontFamily.bold,
  },
});
