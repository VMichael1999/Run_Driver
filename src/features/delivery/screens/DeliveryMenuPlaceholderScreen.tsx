import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageHeader } from '@shared/components/ui/PageHeader';
import { useNavigation } from '@react-navigation/native';
import { FontFamily } from '@theme/fonts';
import { DeliveryShadow, useDeliveryColors } from '../theme';
import { useStatusBarStyle } from '../hooks/useStatusBarStyle';

const TITLES: Record<string, string> = {
  DeliveryPedidos: 'Mis pedidos',
  DeliveryCupones: 'Cupones',
  DeliveryDirecciones: 'Direcciones guardadas',
  DeliveryFacturacion: 'Datos de facturación',
  DeliveryNotificaciones: 'Notificaciones',
};

/** Opciones del menú de delivery cuyo diseño está en propuesta. */
export function DeliveryMenuPlaceholderScreen() {
  const colors = useDeliveryColors();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  useStatusBarStyle('dark');

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <PageHeader title={TITLES[route.name] ?? route.name} onBack={() => navigation.goBack()} />
      <View style={[styles.card, { backgroundColor: colors.card }, DeliveryShadow.card]}>
        <Ionicons name="time-outline" size={24} color={colors.olive} />
        <Text style={[styles.title, { color: colors.ink }]}>Próximamente</Text>
        <Text style={[styles.text, { color: colors.muted }]}>Esta sección todavía está en diseño.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  card: {
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: 15.5,
  },
  text: {
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    textAlign: 'center',
  },
});
