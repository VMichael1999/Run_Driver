import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { FontFamily } from '@theme/fonts';
import { DeliveryShadow, useDeliveryColors } from '../theme';

const TITLES: Record<string, string> = {
  DeliveryGuardados: 'Guardados',
  DeliveryOfertas: 'Ofertas',
  DeliveryPerfil: 'Perfil',
  DeliveryInicio: 'Inicio',
  DeliveryCarrito: 'Carrito',
};

interface Props {
  /** Contenido extra arriba del aviso (por ejemplo, el botón del menú). */
  header?: React.ReactNode;
}

/** Pestañas sin diseño todavía: muestran su título y "Próximamente". */
export function DeliveryProximamenteScreen({ header }: Props) {
  const colors = useDeliveryColors();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const title = TITLES[route.name] ?? route.name;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top + 6 }]}>
      {header}
      <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: colors.card }, DeliveryShadow.card]}>
        <Ionicons name="time-outline" size={24} color={colors.olive} />
        <Text style={[styles.cardTitle, { color: colors.ink }]}>Próximamente</Text>
        <Text style={[styles.cardText, { color: colors.muted }]}>Esta sección todavía está en diseño.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    gap: 12,
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: 17,
    lineHeight: 23,
    marginTop: 8,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 15.5,
  },
  cardText: {
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    textAlign: 'center',
  },
});
