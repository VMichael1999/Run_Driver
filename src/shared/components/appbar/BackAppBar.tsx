import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius } from '@theme/spacing';

interface Props {
  title?: string;
  onBack?: () => void;
}

export function BackAppBar({ title, onBack }: Props) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.xs, backgroundColor: theme.surface, borderBottomColor: theme.line },
      ]}
    >
      <TouchableOpacity
        onPress={handleBack}
        style={[styles.backButton, { borderColor: theme.line, backgroundColor: theme.surface }]}
        activeOpacity={0.75}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Volver a la pantalla anterior"
      >
        <Ionicons name="arrow-back" size={20} color={theme.text} />
      </TouchableOpacity>

      {title ? (
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>
      ) : null}

      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    marginHorizontal: Spacing.sm,
  },
  spacer: {
    width: 40,
  },
});
