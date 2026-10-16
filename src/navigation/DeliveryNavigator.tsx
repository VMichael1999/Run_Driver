import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { DeliveryStackParamList, DeliveryTabParamList } from './types';
import { DeliveryCargaScreen } from '@features/delivery/screens/DeliveryCargaScreen';
import { DeliveryInicioScreen } from '@features/delivery/screens/DeliveryInicioScreen';
import { DeliveryCarritoScreen } from '@features/delivery/screens/DeliveryCarritoScreen';
import { DeliveryProximamenteScreen } from '@features/delivery/screens/DeliveryProximamenteScreen';
import { DeliveryTabBar } from '@features/delivery/components/DeliveryTabBar';

const Stack = createNativeStackNavigator<DeliveryStackParamList>();
const Tab = createBottomTabNavigator<DeliveryTabParamList>();

function DeliveryTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <DeliveryTabBar {...props} />}>
      <Tab.Screen name="DeliveryInicio" component={DeliveryInicioScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="DeliveryGuardados" component={DeliveryProximamenteScreen} options={{ title: 'Guardados' }} />
      <Tab.Screen name="DeliveryCarrito" component={DeliveryCarritoScreen} options={{ title: 'Carrito' }} />
      <Tab.Screen name="DeliveryOfertas" component={DeliveryProximamenteScreen} options={{ title: 'Ofertas' }} />
      <Tab.Screen name="DeliveryPerfil" component={DeliveryProximamenteScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export function DeliveryNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DeliveryCarga" component={DeliveryCargaScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="DeliveryTabs" component={DeliveryTabs} options={{ animation: 'fade' }} />
    </Stack.Navigator>
  );
}
