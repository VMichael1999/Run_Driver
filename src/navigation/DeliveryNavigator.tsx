import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useStatusBarStyle } from '@features/delivery/hooks/useStatusBarStyle';
import type { DeliveryStackParamList, DeliveryTabParamList } from './types';
import { cartCount, useCartStore } from '@store/useCartStore';
import { DeliveryCargaScreen } from '@features/delivery/screens/DeliveryCargaScreen';
import { DeliveryInicioScreen } from '@features/delivery/screens/DeliveryInicioScreen';
import { DeliveryCarritoScreen } from '@features/delivery/screens/DeliveryCarritoScreen';
import { DeliveryProximamenteScreen } from '@features/delivery/screens/DeliveryProximamenteScreen';
import { DeliveryLocalScreen } from '@features/delivery/screens/DeliveryLocalScreen';
import { DeliveryProductoScreen } from '@features/delivery/screens/DeliveryProductoScreen';
import { DeliveryMenuPlaceholderScreen } from '@features/delivery/screens/DeliveryMenuPlaceholderScreen';
import { PerfilScreen } from '@features/cliente/perfil';
import { MetodosPagoScreen } from '@features/cliente/metodos-pago';
import { ConfiguracionScreen } from '@features/configuracion/ConfiguracionScreen';
import { DeliveryTabBar } from '@features/delivery/components/DeliveryTabBar';

const Stack = createNativeStackNavigator<DeliveryStackParamList>();

/** Las pantallas de la cuenta no fijan la barra de estado; en delivery va oscura. */
function withDarkStatusBar<P extends object>(Screen: React.ComponentType<P>) {
  return function DarkStatusBarScreen(props: P) {
    useStatusBarStyle('dark');
    return <Screen {...props} />;
  };
}

const DeliveryPerfil = withDarkStatusBar(PerfilScreen);
const DeliveryMetodosPago = withDarkStatusBar(MetodosPagoScreen as React.ComponentType);
const DeliveryConfiguracion = withDarkStatusBar(ConfiguracionScreen);
const Tab = createBottomTabNavigator<DeliveryTabParamList>();

function DeliveryTabs() {
  const count = useCartStore((s) => cartCount(s.items));

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <DeliveryTabBar {...props} />}>
      <Tab.Screen name="DeliveryInicio" component={DeliveryInicioScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="DeliveryFavoritos" component={DeliveryProximamenteScreen} options={{ title: 'Favoritos' }} />
      <Tab.Screen
        name="DeliveryCarrito"
        component={DeliveryCarritoScreen}
        options={{ title: 'Carrito', tabBarBadge: count > 0 ? count : undefined }}
      />
    </Tab.Navigator>
  );
}

export function DeliveryNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DeliveryCarga" component={DeliveryCargaScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="DeliveryTabs" component={DeliveryTabs} options={{ animation: 'fade' }} />
      <Stack.Screen name="DeliveryLocal" component={DeliveryLocalScreen} />
      <Stack.Screen name="DeliveryProducto" component={DeliveryProductoScreen} />
      <Stack.Screen name="DeliveryPedidos" component={DeliveryMenuPlaceholderScreen} />
      <Stack.Screen name="DeliveryCupones" component={DeliveryMenuPlaceholderScreen} />
      <Stack.Screen name="DeliveryDirecciones" component={DeliveryMenuPlaceholderScreen} />
      <Stack.Screen name="DeliveryFacturacion" component={DeliveryMenuPlaceholderScreen} />
      <Stack.Screen name="DeliveryNotificaciones" component={DeliveryMenuPlaceholderScreen} />
      {/* Pantallas de la cuenta que se comparten con viajes. */}
      <Stack.Screen name="Perfil" component={DeliveryPerfil} />
      <Stack.Screen name="MetodosPago" component={DeliveryMetodosPago} />
      <Stack.Screen name="Configuracion" component={DeliveryConfiguracion} />
    </Stack.Navigator>
  );
}
