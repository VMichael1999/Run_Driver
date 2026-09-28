import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius } from '@theme/spacing';
import {
  AppButton,
  PlacaVehiculo,
  StatusPill,
  PriceStepper,
  AuctionProgressBar,
} from '@shared/components/ui';

export function ComponentCatalogScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [price, setPrice] = useState(16);
  const [loading, setLoading] = useState(false);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing['2xl'] },
      ]}
    >
      <Text style={[styles.heading, { color: theme.text }]}>Catálogo de Componentes</Text>
      <Text style={[styles.subheading, { color: theme.textMuted }]}>
        Tokens y componentes base — RunSubasta
      </Text>

      {/* 1. Placa Vehicular */}
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.line }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Placa Vehicular Oficial (ABC-123)</Text>
        <Text style={[styles.caption, { color: theme.textMuted }]}>
          Formato físico peruano con cabecera azul PERÚ y tipografía tabular
        </Text>
        <View style={styles.row}>
          <PlacaVehiculo plate="ABC-123" size="sm" />
          <PlacaVehiculo plate="B7X-492" size="md" />
        </View>
        <View style={{ marginTop: Spacing.md }}>
          <PlacaVehiculo plate="ABC-123" size="lg" />
        </View>
      </View>

      {/* 2. Botones */}
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.line }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>2. Botones (Sentence Case)</Text>
        <Text style={[styles.caption, { color: theme.textMuted }]}>
          Alturas de 56 dp (principal) y 44 dp (secundario), sin mayúsculas sostenidas
        </Text>
        <View style={styles.buttonStack}>
          <AppButton
            label="Pedir viaje por S/ 16.00"
            variant="primary"
            onPress={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1500);
            }}
            loading={loading}
          />
          <AppButton
            label="Aceptar oferta · S/ 15.00"
            variant="sig"
            onPress={() => {}}
          />
          <AppButton
            label="Proponer otro precio"
            variant="ghost"
            size="sm"
            onPress={() => {}}
          />
          <AppButton
            label="Cancelar viaje"
            variant="danger"
            size="sm"
            onPress={() => {}}
          />
        </View>
      </View>

      {/* 3. Status Pills */}
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.line }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>3. Píldoras de Estado (StatusPill)</Text>
        <View style={styles.pillRow}>
          <StatusPill label="Conectado" status="online" />
          <StatusPill label="Recogida en 3 min" status="pickup" />
          <StatusPill label="Desconectado" status="offline" />
          <StatusPill label="Alerta SOS" status="danger" />
        </View>
      </View>

      {/* 4. Price Stepper */}
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.line }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>4. Selector de Precio Subasta (56 dp)</Text>
        <Text style={[styles.caption, { color: theme.textMuted }]}>
          Táctil para la calle con respuesta háptica y cifras legibles
        </Text>
        <PriceStepper value={price} onChange={setPrice} min={8} max={50} />
      </View>

      {/* 5. Auction Progress Bar */}
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.line }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>5. Barra de Tiempo de Oferta (Lima #D4E838)</Text>
        <Text style={[styles.caption, { color: theme.textMuted }]}>
          Cuenta regresiva animada con Reanimated
        </Text>
        <AuctionProgressBar durationMs={10000} height={6} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  heading: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    letterSpacing: -0.5,
  },
  subheading: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    marginTop: -8,
    marginBottom: Spacing.xs,
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    marginTop: -Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  buttonStack: {
    gap: Spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
