import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing } from '@theme/spacing';

interface Props {
  onPress?: () => void;
}

export function VerificationHelpCard({ onPress }: Props) {
  return (
    <Text style={styles.text}>
      Si tiene dudas, por favor, contacte con{' '}
      <Text style={styles.link} onPress={onPress}>
        Servicio de asistencia al conductor
      </Text>
      .
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    marginTop: Spacing.md,
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
