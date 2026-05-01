import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@store/useAuthStore';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing } from '@theme/spacing';
import { Colors } from '@theme/colors';

const menuItems = [
  { label: 'Inicio', icon: 'home-outline' as const, screen: 'ClienteHome' },
  { label: 'Mis viajes', icon: 'time-outline' as const, screen: 'HistorialViaje' },
  { label: 'Configuracion', icon: 'settings-outline' as const, screen: 'Configuracion' },
];

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { logout, phone } = useAuthStore();
  const { navigation } = props;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Profile */}
      <View style={styles.profileSection}>
        <View style={styles.avatarWrap}>
          <Ionicons name="person" size={34} color={Colors.white} />
        </View>
        <View style={styles.profileTextWrap}>
          <Text style={styles.profileName}>Mi perfil</Text>
          <Text style={styles.profilePhone}>{phone || '+51 000 000 000'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Menu items */}
      <DrawerContentScrollView
        {...props}
        scrollEnabled={false}
        contentContainerStyle={styles.scrollContent}
      >
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen as never)}
            activeOpacity={0.75}
          >
            <Ionicons name={item.icon} size={22} color={Colors.white} />
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </DrawerContentScrollView>

      {/* Logout */}
      <View style={styles.divider} />
      <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={22} color="#ff6b6b" />
        <Text style={styles.logoutText}>Cerrar sesion</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.lg,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTextWrap: {
    flex: 1,
  },
  profileName: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    marginBottom: 2,
  },
  profilePhone: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: Spacing.sm,
  },
  scrollContent: {
    paddingTop: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: 14,
    marginBottom: 4,
  },
  menuLabel: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  logoutText: {
    color: '#ff6b6b',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
});
