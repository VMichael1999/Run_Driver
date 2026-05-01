import React from 'react';
import { Switch, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppCard, AppHeader, AppListRow, AppScreen, AppSectionTitle } from '@shared/components/ui';
import { useThemeStore } from '@store/useThemeStore';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontSize } from '@theme/fonts';
import { Spacing } from '@theme/spacing';

export function ConfiguracionScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useThemeStore();
  const theme = useAppTheme();

  return (
    <AppScreen contentStyle={{ paddingBottom: insets.bottom }}>
      <AppHeader title="Configuracion" />
      <AppCard style={styles.section}>
        <AppSectionTitle muted style={styles.sectionTitle}>Apariencia</AppSectionTitle>
        <AppListRow
          title="Modo oscuro"
          titleStyle={styles.rowLabel}
          right={(
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.divider, true: theme.primary }}
              thumbColor={Colors.white}
            />
          )}
          style={styles.row}
        />
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    margin: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    paddingVertical: 0,
  },
  rowLabel: {
    fontSize: FontSize.md,
  },
});
