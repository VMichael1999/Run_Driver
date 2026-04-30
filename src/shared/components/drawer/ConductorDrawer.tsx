import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserNetworkAvatar } from '../avatar/UserNetworkAvatar';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing } from '@theme/spacing';

const OPCIONES = [
  { id: 1, icon: 'car-outline' as const, label: 'Mapa' },
  { id: 2, icon: 'map-outline' as const, label: 'Mis viajes' },
  { id: 3, icon: 'shield-checkmark-outline' as const, label: 'Seguridad e integridad' },
  { id: 4, icon: 'settings-outline' as const, label: 'Configuración' },
  { id: 5, icon: 'help-circle-outline' as const, label: 'Ayuda' },
  { id: 6, icon: 'chatbubble-outline' as const, label: 'Soporte' },
];

interface Props {
  currentIndex?: number;
  estadoIndex?: number;
  onProfile?: () => void;
  onSelectOpcion?: (index: number, id: number, label: string) => void;
  onEstadoConductor?: (index: number) => void;
  onChangeToPasajero?: () => void;
}

export function ConductorDrawer({
  currentIndex = -1,
  estadoIndex = 0,
  onProfile,
  onSelectOpcion,
  onEstadoConductor,
  onChangeToPasajero,
}: Props) {
  const [selected, setSelected] = useState(currentIndex);
  const [estado, setEstado] = useState(estadoIndex);

  const handleSelect = (index: number, id: number, label: string) => {
    setSelected(index);
    onSelectOpcion?.(index, id, label);
  };

  const handleEstado = (idx: number) => {
    setEstado(idx);
    onEstadoConductor?.(idx);
  };

  return (
    <View style={styles.container}>
      {/* Header / perfil */}
      <TouchableOpacity style={styles.header} onPress={onProfile} activeOpacity={0.85}>
        <UserNetworkAvatar imageUrl="https://randomuser.me/api/portraits/men/1.jpg" radius={30} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>Jose Phillips</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>4.8</Text>
            <Text style={styles.ratingCount}>(1252)</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.white} />
      </TouchableOpacity>

      {/* Estado ocupado/libre */}
      <View style={[styles.estadoRow, { backgroundColor: Colors.primary }]}>
        {['Ocupado', 'Libre'].map((label, idx) => (
          <TouchableOpacity
            key={label}
            style={[
              styles.estadoBtn,
              estado === idx && { backgroundColor: idx === 0 ? '#f44336' : '#4caf50' },
            ]}
            onPress={() => handleEstado(idx)}
            activeOpacity={0.8}
          >
            <Text style={[styles.estadoLabel, estado === idx && styles.estadoLabelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.divider} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {OPCIONES.map((opcion, index) => (
          <TouchableOpacity
            key={opcion.id}
            style={[styles.item, selected === index && styles.itemSelected]}
            onPress={() => handleSelect(index, opcion.id, opcion.label)}
            activeOpacity={0.7}
          >
            <Ionicons name={opcion.icon} size={20} color={Colors.textPrimary} style={styles.itemIcon} />
            <Text style={[styles.itemLabel, selected === index && styles.itemLabelBold]}>
              {opcion.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.divider} />
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerBtn} onPress={onChangeToPasajero} activeOpacity={0.85}>
          <Text style={styles.footerBtnText}>Modo pasajero</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eeeeee' },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  headerInfo: { flex: 1 },
  headerName: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.white },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)' },
  ratingCount: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)' },
  estadoRow: {
    flexDirection: 'row',
    padding: 6,
    gap: 6,
  },
  estadoBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  estadoLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textPrimary },
  estadoLabelActive: { fontFamily: FontFamily.bold, color: Colors.white },
  divider: { height: 0.5, backgroundColor: 'rgba(0,0,0,0.2)' },
  scroll: { flex: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fefefe',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    marginBottom: 2,
  },
  itemSelected: { backgroundColor: '#eeeeee' },
  itemIcon: { marginRight: Spacing.sm },
  itemLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.textPrimary },
  itemLabelBold: { fontFamily: FontFamily.bold },
  footer: { backgroundColor: '#fefefe', padding: Spacing.sm },
  footerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  footerBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.white },
});
