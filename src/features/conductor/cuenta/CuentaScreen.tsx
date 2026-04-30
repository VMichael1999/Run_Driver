import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { useAuthStore } from '@store/useAuthStore';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Nav = NativeStackNavigationProp<ConductorStackParamList, 'ConductorHome'>;

export function CuentaScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { phone, logout } = useAuthStore();

  const menuItems = [
    { label: 'Verificación', icon: '🛡️', onPress: () => navigation.navigate('Verificacion') },
    { label: 'Historial de viajes', icon: '🕐', onPress: () => navigation.navigate('HistorialViaje') },
    { label: 'Configuración', icon: '⚙️', onPress: () => navigation.navigate('Configuracion') },
    { label: 'Cerrar sesión', icon: '🚪', onPress: logout },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>C</Text>
        </View>
        <Text style={styles.phone}>{phone}</Text>
        <Text style={styles.role}>Conductor</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.8}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  profileCard: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { fontSize: FontSize['2xl'], fontFamily: FontFamily.bold, color: Colors.primary },
  phone: { fontSize: FontSize.lg, fontFamily: FontFamily.bold, color: Colors.white },
  role: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: Colors.white, opacity: 0.8, marginTop: 4 },
  menu: { padding: Spacing.lg, gap: Spacing.sm },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  menuIcon: { fontSize: 20, marginRight: Spacing.md },
  menuLabel: { flex: 1, fontSize: FontSize.md, fontFamily: FontFamily.regular, color: Colors.textPrimary },
  menuChevron: { fontSize: FontSize.xl, color: Colors.textSecondary, fontFamily: FontFamily.bold },
});
