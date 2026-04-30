import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackAppBar } from '@shared/components/appbar/BackAppBar';
import { useThemeStore } from '@store/useThemeStore';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

export function ConfiguracionScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <BackAppBar title="Configuración" />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apariencia</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Modo oscuro</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: Colors.divider, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  section: { margin: Spacing.lg },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  rowLabel: { flex: 1, fontSize: FontSize.md, fontFamily: FontFamily.regular, color: Colors.textPrimary },
});
