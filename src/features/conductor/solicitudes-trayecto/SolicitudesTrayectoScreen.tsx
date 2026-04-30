import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

const LIMA_REGION = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export function SolicitudesTrayectoScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={LIMA_REGION}
        showsUserLocation
      >
        <Marker coordinate={{ latitude: -12.0464, longitude: -77.0428 }} pinColor={Colors.secondary} />
      </MapView>

      <View style={[styles.panel, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <View style={styles.passengerRow}>
          <Text style={styles.passengerLabel}>Pasajero en camino</Text>
          <View style={styles.etaBadge}>
            <Text style={styles.etaText}>2 min</Text>
          </View>
        </View>

        <Text style={styles.passengerName}>Ana Torres</Text>
        <Text style={styles.destination}>🏁 Destino: San Borja, Lima</Text>

        <TouchableOpacity style={styles.arrivedButton} activeOpacity={0.85}>
          <Text style={styles.arrivedButtonText}>Llegué al punto de recogida</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    ...Shadow.lg,
  },
  passengerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  passengerLabel: { flex: 1, fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: Colors.textSecondary },
  etaBadge: {
    backgroundColor: Colors.tertiary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  etaText: { fontSize: FontSize.sm, fontFamily: FontFamily.bold, color: Colors.white },
  passengerName: { fontSize: FontSize.xl, fontFamily: FontFamily.bold, color: Colors.textPrimary, marginBottom: 4 },
  destination: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: Colors.textSecondary, marginBottom: Spacing.lg },
  arrivedButton: {
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  arrivedButtonText: { fontSize: FontSize.md, fontFamily: FontFamily.bold, color: Colors.white },
});
