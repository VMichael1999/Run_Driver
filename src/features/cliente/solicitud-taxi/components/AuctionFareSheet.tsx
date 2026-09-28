import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';
import { PriceStepper } from '@shared/components/ui/PriceStepper';
import { AppButton } from '@shared/components/ui/AppButton';

interface AuctionFareSheetProps {
  visible: boolean;
  fare: number;
  baseFare?: number;
  onChangeFare: (newFare: number) => void;
  onConfirm: (fare: number) => void;
  onClose: () => void;
}

export function AuctionFareSheet({
  visible,
  fare,
  baseFare = 15,
  onChangeFare,
  onConfirm,
  onClose,
}: AuctionFareSheetProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const minSuggested = Math.max(8, Math.round(baseFare * 0.8));
  const maxSuggested = Math.round(baseFare * 1.35);

  const isUnderSuggested = fare < minSuggested;
  const isOptimal = fare >= minSuggested && fare <= maxSuggested;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar">
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, paddingBottom: Math.max(insets.bottom, Spacing.lg) },
            Shadow.sheet,
          ]}
          accessible={false}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.line }]} />
          <Text style={[styles.title, { color: theme.text }]}>Subasta · Propón tu precio</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Ajusta el monto que deseas ofrecer a los conductores cercanos
          </Text>

          {/* Selector de precio con botones de 56 dp */}
          <PriceStepper
            value={fare}
            onChange={onChangeFare}
            min={5}
            max={120}
            step={1}
            currency="S/"
          />

          {/* Barra de recomendación de rango de aceptación */}
          <View style={styles.recommendationWrap}>
            <View style={[styles.rangeTrack, { backgroundColor: theme.line }]}>
              <View
                style={[
                  styles.optimalRange,
                  {
                    backgroundColor: theme.online,
                    left: '25%',
                    right: '25%',
                  },
                ]}
              />
            </View>
            <View style={styles.rangeLabelsRow}>
              <Text style={[styles.rangeLabel, { color: theme.textMuted }]}>
                Mínimo S/ {minSuggested}
              </Text>
              <Text
                style={[
                  styles.rangeStatus,
                  { color: isOptimal ? theme.online : isUnderSuggested ? theme.warning : theme.text },
                ]}
              >
                {isOptimal
                  ? 'Tarifa recomendada'
                  : isUnderSuggested
                  ? 'Podría tardar más en responder'
                  : 'Respuesta muy rápida'}
              </Text>
              <Text style={[styles.rangeLabel, { color: theme.textMuted }]}>
                S/ {maxSuggested}
              </Text>
            </View>
          </View>

          {/* Frase explicativa clara (Reemplaza "Prueba ofrecer un mejor precio") */}
          <View style={[styles.hintBox, { backgroundColor: theme.surfaceMuted }]}>
            <Ionicons name="information-circle-outline" size={18} color={theme.textMuted} />
            <Text style={[styles.hintText, { color: theme.textMuted }]}>
              Los conductores cercanos verán tu oferta y podrán aceptarla o contraofertar.
            </Text>
          </View>

          <View style={styles.actions}>
            <AppButton
              label={`Buscar conductores por S/ ${fare.toFixed(2)}`}
              variant="sig"
              onPress={() => onConfirm(fare)}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.scrim,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: -8,
  },
  recommendationWrap: {
    gap: 6,
    paddingVertical: 4,
  },
  rangeTrack: {
    height: 6,
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  optimalRange: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 3,
    opacity: 0.45,
  },
  rangeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize['2xs'],
  },
  rangeStatus: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize['2xs'],
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  hintText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  actions: {
    marginTop: Spacing.xs,
  },
});
