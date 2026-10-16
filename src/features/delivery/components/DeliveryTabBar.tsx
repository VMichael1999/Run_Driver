import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { DeliveryTabParamList } from '@navigation/types';
import { FontFamily } from '@theme/fonts';
import { useDeliveryColors } from '../theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<keyof DeliveryTabParamList, { outline: IoniconName; filled: IoniconName }> = {
  DeliveryInicio: { outline: 'home-outline', filled: 'home' },
  DeliveryFavoritos: { outline: 'heart-outline', filled: 'heart' },
  DeliveryCarrito: { outline: 'bag-outline', filled: 'bag' },
};

const ICON_SIZE = 20;

/** Barra de pestañas (.tabbar del mockup) con Inicio, Favoritos y Carrito. */
export function DeliveryTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors = useDeliveryColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: colors.card, borderTopColor: colors.line, paddingBottom: insets.bottom > 0 ? 22 : 8 },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const icons = TAB_ICONS[route.name as keyof DeliveryTabParamList];
        const badge = options.tabBarBadge;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };

        return (
          <Pressable
            key={route.key}
            style={styles.tab}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={badge ? `${label}, ${badge} productos` : label}
          >
            <View style={styles.iconWrap}>
              {focused ? (
                // Pestaña activa: relleno lima con el contorno en tinta encima.
                <>
                  <Ionicons name={icons.filled} size={ICON_SIZE} color={colors.lime} style={styles.iconUnder} />
                  <Ionicons name={icons.outline} size={ICON_SIZE} color={colors.ink} />
                </>
              ) : (
                <Ionicons name={icons.outline} size={ICON_SIZE} color={colors.muted} />
              )}
              {badge ? (
                <View style={[styles.badge, { backgroundColor: colors.ink, borderColor: colors.card }]}>
                  <Text style={[styles.badgeText, { color: colors.lime }]}>{badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, { color: focused ? colors.ink : colors.muted }, focused && styles.labelOn]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  iconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUnder: {
    position: 'absolute',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 2,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 10.5,
    lineHeight: 13,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    lineHeight: 14.85,
  },
  labelOn: {
    fontFamily: FontFamily.semibold,
  },
});
