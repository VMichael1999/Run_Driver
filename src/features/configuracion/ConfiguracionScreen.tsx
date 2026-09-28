import React from 'react';
import { Switch, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { AppCard, AppHeader, AppListRow, AppScreen, AppSectionTitle } from '@shared/components/ui';
import { useThemeStore } from '@store/useThemeStore';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontSize } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';

export function ConfiguracionScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useThemeStore();
  const theme = useAppTheme();

  const handleToggle = () => {
    Haptics.selectionAsync();
    toggleTheme();
  };

  return (
    <AppScreen contentStyle={{ paddingBottom: insets.bottom }}>
      <AppHeader title="Configuración" />
      <AppCard style={styles.section}>
        <AppSectionTitle muted style={styles.sectionTitle}>
          Apariencia
        </AppSectionTitle>
        <AppListRow
          title="Modo oscuro"
          subtitle={isDark ? 'Tema oscuro activo' : 'Tema claro activo'}
          titleStyle={styles.rowLabel}
          right={
            <Switch
              value={isDark}
              onValueChange={handleToggle}
              trackColor={{ false: theme.divider, true: Colors.accentLime }}
              thumbColor={isDark ? Colors.onAccentLime : Colors.white}
              accessibilityRole="switch"
              accessibilityLabel="Alternar modo oscuro"
            />
          }
          style={styles.row}
        />
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    margin: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
  },
  row: {
    paddingVertical: Spacing.xs,
  },
  rowLabel: {
    fontSize: FontSize.md,
  },
});
