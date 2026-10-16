import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { FontFamily } from '@theme/fonts';
import { useDeliveryColors } from '../theme';
import { DeliveryDrawer } from '../components/DeliveryDrawer';
import { DeliveryProximamenteScreen } from './DeliveryProximamenteScreen';

/** Temporal: el inicio de delivery (del-03) se construye en el siguiente paso. */
export function DeliveryInicioScreen() {
  const colors = useDeliveryColors();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <>
      <DeliveryProximamenteScreen
        header={
          <Pressable
            style={[styles.avatar, { backgroundColor: colors.ink }]}
            onPress={() => setDrawerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Abrir menú"
          >
            <Text style={[styles.avatarText, { color: colors.card }]}>LR</Text>
          </Pressable>
        }
      />
      <DeliveryDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  // Avatar .av del mockup: 40 × 40, iniciales 13 semibold.
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.semibold,
    fontSize: 13,
  },
});
