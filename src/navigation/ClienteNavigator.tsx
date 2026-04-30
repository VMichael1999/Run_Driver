import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ClienteStackParamList } from './types';
import { ClienteHomeScreen } from '@features/cliente/home/ClienteHomeScreen';
import { SearchAddressScreen } from '@features/cliente/search/SearchAddressScreen';
import { SelectAddressOnMapScreen } from '@features/cliente/search/SelectAddressOnMapScreen';
import { SolicitudTaxiScreen } from '@features/cliente/solicitud-taxi/SolicitudTaxiScreen';
import { TrayectoTaxiScreen } from '@features/cliente/trayecto-taxi/TrayectoTaxiScreen';
import { ChatScreen } from '@features/chat/ChatScreen';
import { HistorialViajeScreen } from '@features/historial/HistorialViajeScreen';
import { ConfiguracionScreen } from '@features/configuracion/ConfiguracionScreen';

const Stack = createNativeStackNavigator<ClienteStackParamList>();

export function ClienteNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClienteHome" component={ClienteHomeScreen} />
      <Stack.Screen name="SearchAddress" component={SearchAddressScreen} />
      <Stack.Screen name="SelectAddressOnMap" component={SelectAddressOnMapScreen} />
      <Stack.Screen name="SolicitudTaxi" component={SolicitudTaxiScreen} />
      <Stack.Screen name="TrayectoTaxi" component={TrayectoTaxiScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="HistorialViaje" component={HistorialViajeScreen} />
      <Stack.Screen name="Configuracion" component={ConfiguracionScreen} />
    </Stack.Navigator>
  );
}
