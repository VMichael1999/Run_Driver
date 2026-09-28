import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';

interface Props {
  onTerminos?: () => void;
  onPoliticas?: () => void;
}

export function TermsPoliciesCard({ onTerminos, onPoliticas }: Props) {
  const theme = useAppTheme();

  return (
    <Text style={[styles.text, { color: theme.textMuted }]}>
      Al unirte a nuestra aplicación, estás aceptando nuestros{' '}
      <Text style={[styles.link, { color: theme.text }]} onPress={onTerminos}>
        Términos de uso
      </Text>{' '}
      y{' '}
      <Text style={[styles.link, { color: theme.text }]} onPress={onPoliticas}>
        Política de privacidad
      </Text>
      .
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  link: {
    textDecorationLine: 'underline',
    fontFamily: FontFamily.semibold,
  },
});
