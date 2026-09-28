import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';
import { AppButton } from '@shared/components/ui/AppButton';

interface AuctionPickupSheetProps {
  address: string;
  isResolving: boolean;
  isConfirming: boolean;
  onConfirmPickup: () => void;
  onCancel: () => void;
}

export function AuctionPickupSheet({
  address,
  isResolving,
  isConfirming,
  onConfirmPickup,
  onCancel,
}: AuctionPickupSheetProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          paddingBottom: Math.max(insets.bottom, Spacing.lg),
        },
        Shadow.sheet,
      ]}
    >
      <View style={[styles.handle, { backgroundColor: theme.line }]} />

      <Text style={[styles.title, { color: theme.text }]}>Punto de partida</Text>
      <Text style={[styles.subtitle, { color: theme.textMuted }]}>
        Mueve el mapa para ajustar la ubicación exacta donde te esperará el conductor
      </Text>

      <View style={[styles.addressCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.line }]}>
        <View style={[styles.iconWrap, { backgroundColor: theme.surface }]}>
          <Ionicons name="location" size={18} color={theme.origin} />
        </View>
        <View style={styles.addressTextWrap}>
          <Text style={[styles.addressLabel, { color: theme.textMuted }]}>Dirección de recogida</Text>
          <Text style={[styles.addressValue, { color: theme.text }]} numberOfLines={2}>
            {address}
          </Text>
        </View>
        {isResolving ? <ActivityIndicator size="small" color={theme.primary} /> : null}
      </View>

      <View style={styles.actions}>
        <AppButton
          label={isConfirming ? 'Fijando...' : 'Fijar punto de partida'}
          variant="primary"
          onPress={onConfirmPickup}
          disabled={isConfirming || isResolving}
          loading={isConfirming}
        />
        <AppButton
          label="Cancelar"
          variant="ghost"
          size="sm"
          onPress={onCancel}
          disabled={isConfirming}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
    zIndex: 10,
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
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressTextWrap: {
    flex: 1,
    gap: 2,
  },
  addressLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize['2xs'],
  },
  addressValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md - 1,
    lineHeight: 20,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
});
