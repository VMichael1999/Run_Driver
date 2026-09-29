import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { Marker, type LatLng } from 'react-native-maps';
import { LegacyImages } from '@shared/assets/legacyAssets';
import { useCarRouteAnimation } from '../hooks/useCarRouteAnimation';

export interface MovingCarMarkerProps {
  route: LatLng[];
  isActive: boolean;
  durationMs?: number;
  rotationSmoothing?: number;
  loop?: boolean;
  zIndex?: number;
  onProgress?: (progress: number) => void;
}

const CarIcon = React.memo(function CarIcon() {
  return (
    <Image
      source={LegacyImages.carNorth}
      style={styles.carMarkerImage}
      resizeMode="contain"
    />
  );
});

export const MovingCarMarker = React.memo(function MovingCarMarker({
  route,
  isActive,
  durationMs = 80000,
  rotationSmoothing = 0.45,
  loop = false,
  zIndex = 999,
  onProgress,
}: MovingCarMarkerProps) {
  const { currentPosition, currentBearing, opacity } = useCarRouteAnimation({
    route,
    isActive,
    durationMs,
    rotationSmoothing,
    loop,
    onProgress,
  });

  if (!currentPosition) return null;

  return (
    <Marker
      coordinate={currentPosition}
      anchor={{ x: 0.5, y: 0.5 }}
      rotation={currentBearing}
      flat
      opacity={opacity}
      tracksViewChanges={true}
      zIndex={zIndex}
    >
      <CarIcon />
    </Marker>
  );
});

const styles = StyleSheet.create({
  carMarkerImage: {
    width: 38,
    height: 38,
  },
});
