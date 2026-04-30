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
import { Spacing, Shadow } from '@theme/spacing';

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
  onProfile?: () => void;
  onSelectOpcion?: (index: number, id: number, label: string) => void;
}

export function ClienteDrawer({ currentIndex = -1, onProfile, onSelectOpcion }: Props) {
  const [selected, setSelected] = useState(currentIndex);

  const handleSelect = (index: number, id: number, label: string) => {
    setSelected(index);
    onSelectOpcion?.(index, id, label);
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
            <Text style={styles.ratingText}>4.9</Text>
            <Text style={styles.ratingCount}>(200)</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.white} />
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Opciones */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.white,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  ratingCount: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  scroll: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundItemLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    marginBottom: 2,
  },
  itemSelected: {
    backgroundColor: Colors.backgroundLight,
  },
  itemIcon: {
    marginRight: Spacing.sm,
  },
  itemLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  itemLabelBold: {
    fontFamily: FontFamily.bold,
  },
});
