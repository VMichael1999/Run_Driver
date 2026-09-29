import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { create } from 'zustand';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';

interface TripProgressState {
  progress: number;
  setProgress: (p: number) => void;
  resetProgress: () => void;
}

export const useTripProgressStore = create<TripProgressState>((set) => ({
  progress: 0,
  setProgress: (progress: number) => set({ progress }),
  resetProgress: () => set({ progress: 0 }),
}));

export interface DestinationBannerProps {
  top: number;
  destinationName: string;
  etaMinutes?: number;
  distanceKm?: number;
}

export const DestinationBanner = React.memo(function DestinationBanner({
  top,
  destinationName,
  etaMinutes = 5,
  distanceKm = 1.2,
}: DestinationBannerProps) {
  const theme = useAppTheme();
  const progress = useTripProgressStore((s) => s.progress);

  const remainingMin = Math.max(1, Math.round(etaMinutes * (1 - progress)));
  const remainingKm = Math.max(0.1, distanceKm * (1 - progress)).toFixed(1);

  return (
    <View
      style={[
        styles.destinationBanner,
        {
          top,
          backgroundColor: theme.surface,
          borderColor: theme.divider,
          ...Shadow.sheet,
        },
      ]}
    >
      <View style={styles.bannerRow}>
        <View style={styles.bannerEtaWrap}>
          <Text style={[styles.bannerEtaTime, { color: theme.text }]}>
            Llegas en ~{remainingMin} min
          </Text>
          <Text style={[styles.bannerEtaDist, { color: theme.textMuted }]}>
            {`${remainingKm} km`}
          </Text>
        </View>
        <View style={styles.bannerBadge}>
          <View style={styles.bannerBadgeDot} />
          <Text style={styles.bannerBadgeText}>En viaje</Text>
        </View>
      </View>
      <Text style={[styles.bannerAddress, { color: theme.text }]} numberOfLines={1}>
        {destinationName}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  destinationBanner: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 99,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bannerEtaWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  bannerEtaTime: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    letterSpacing: -0.3,
  },
  bannerEtaDist: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.onlineSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  bannerBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.online,
  },
  bannerBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.caption,
    color: Colors.online,
  },
  bannerAddress: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
});
