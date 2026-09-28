import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DriverAlert } from '@shared/types';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';
import { DriverOfferCard } from './DriverOfferCard';
import { SearchingDriversUI } from './SearchingDriversUI';

export interface AuctionOfferItem {
  id: string;
  driver: DriverAlert;
  startTime: Date;
  totalDuration: number;
}

interface AuctionOffersViewProps {
  status: 'searching' | 'drivers_arriving' | 'completed';
  offers: AuctionOfferItem[];
  currentFare: number;
  onAcceptOffer: (offerId: string) => void;
  onRejectOffer: (offerId: string) => void;
  onCancelAuction: () => void;
  onRaiseFare: () => void;
  onExpiredOffer?: (offerId: string) => void;
}

export function AuctionOffersView({
  status,
  offers,
  currentFare,
  onAcceptOffer,
  onRejectOffer,
  onCancelAuction,
  onRaiseFare,
  onExpiredOffer,
}: AuctionOffersViewProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const hasOffers = offers.length > 0;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Indicador de búsqueda superior */}
      <View
        style={[
          styles.topSearchingPill,
          {
            backgroundColor: theme.surface,
            borderColor: theme.line,
            top: insets.top + Spacing.sm,
          },
          Shadow.raise,
        ]}
      >
        <SearchingDriversUI
          isSearching={status === 'searching'}
          subtitle={
            hasOffers
              ? `${offers.length} oferta${offers.length > 1 ? 's' : ''} disponible${offers.length > 1 ? 's' : ''}`
              : 'Esperando respuesta de conductores...'
          }
        />
      </View>

      {/* Lista flotante de ofertas entrantes */}
      <View style={styles.offersContainer} pointerEvents="box-none">
        <FlatList
          data={offers}
          keyExtractor={(item) => item.id}
          style={styles.offersList}
          contentContainerStyle={[styles.offersContent, { paddingBottom: 180 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <DriverOfferCard
              driver={item.driver}
              startTime={item.startTime}
              totalDurationSeconds={item.totalDuration}
              offeredFare={currentFare}
              onAccept={() => onAcceptOffer(item.id)}
              onReject={() => onRejectOffer(item.id)}
              onExpired={() => onExpiredOffer?.(item.id)}
            />
          )}
        />
      </View>

      {/* Panel inferior fijo de subasta */}
      <View
        style={[
          styles.bottomControlPanel,
          {
            backgroundColor: theme.surface,
            paddingBottom: Math.max(insets.bottom, Spacing.md),
          },
          Shadow.sheet,
        ]}
      >
        <View style={styles.fareSummaryRow}>
          <View>
            <Text style={[styles.fareLabel, { color: theme.textMuted }]}>Tu tarifa ofrecida</Text>
            <Text style={[styles.fareAmount, { color: theme.text }]}>
              S/ {currentFare.toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.raiseFareBtn, { backgroundColor: theme.sig }]}
            onPress={onRaiseFare}
            activeOpacity={0.82}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Subir tarifa ofrecida en 1 Sol"
          >
            <Ionicons name="arrow-up" size={16} color={theme.onSig} />
            <Text style={[styles.raiseFareText, { color: theme.onSig }]}>+ S/ 1.00</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.cancelBtn, { borderColor: theme.line }]}
          onPress={onCancelAuction}
          activeOpacity={0.8}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Cancelar búsqueda de subasta"
        >
          <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Cancelar búsqueda</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    justifyContent: 'space-between',
  },
  topSearchingPill: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    zIndex: 25,
  },
  offersContainer: {
    flex: 1,
    marginTop: 110,
  },
  offersList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  offersContent: {
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  bottomControlPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
    zIndex: 30,
  },
  fareSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fareLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fareAmount: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    fontVariant: ['tabular-nums'],
  },
  raiseFareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
  },
  raiseFareText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  cancelBtn: {
    height: 44,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
});
