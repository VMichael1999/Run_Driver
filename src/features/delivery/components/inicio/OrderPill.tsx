import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontFamily } from '@theme/fonts';
import { DeliveryShadow, useDeliveryColors } from '../../theme';
import { StoreLogo } from '../StoreLogo';
import { Avatar } from '../Avatar';
import { ACTIVE_ORDER, COURIER, DELIVERY_ADDRESS, RESTAURANTS, type ActiveOrderStatus } from '../../data/mock';

interface OrderPillProps {
  status: ActiveOrderStatus;
  bottom: number;
  onPress?: () => void;
}

/** Aviso flotante del pedido en curso (.opill). Con el repartidor en camino, muestra su avatar. */
export function OrderPill({ status, bottom, onPress }: OrderPillProps) {
  const colors = useDeliveryColors();
  const restaurant = RESTAURANTS[ACTIVE_ORDER.restaurantId];
  const minutes = ACTIVE_ORDER.minutesLeft[status];
  const onTheWay = status === 'en-camino';
  const title = onTheWay ? `${COURIER.firstName} está en camino` : 'Preparando tu pedido';
  const subtitle = onTheWay
    ? `A ${DELIVERY_ADDRESS.label} · Llega ${ACTIVE_ORDER.arrivesAt}`
    : `${restaurant.name.split(' – ')[0]} · Llega ${ACTIVE_ORDER.arrivesAt}`;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, { backgroundColor: colors.card, bottom }, DeliveryShadow.floating]}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}. Faltan ${minutes} minutos`}
    >
      {onTheWay ? (
        <Avatar initials={COURIER.initials} variant="sm" />
      ) : (
        <StoreLogo logo={restaurant.logo} size={38} radius={12} fontSize={13} />
      )}
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.ink }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View style={[styles.eta, { backgroundColor: colors.limeSoft }]}>
        <Text style={[styles.etaNumber, { color: colors.ink }]}>{minutes}</Text>
        <Text style={[styles.etaUnit, { color: colors.olive }]}>min</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 6,
    borderRadius: 18,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 12,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    flex: 1,
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    lineHeight: 18.9,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 11.5,
    lineHeight: 15.5,
  },
  eta: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  etaNumber: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    lineHeight: 18.7,
  },
  etaUnit: {
    fontFamily: FontFamily.semibold,
    fontSize: 10,
    lineHeight: 11,
  },
});
