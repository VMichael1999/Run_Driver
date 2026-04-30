import React from 'react';
import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';

interface Props extends TextInputProps {
  labelText: string;
}

export function TextFormFieldCustom({ labelText, style, ...props }: Props) {
  return (
    <View>
      <Text style={styles.label}>{labelText}</Text>
      <TextInput {...props} style={[styles.input, style]} placeholderTextColor={Colors.textDisabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: Spacing.xs,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
  },
});
