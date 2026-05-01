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
import { PerfilScreen } from '@features/cliente/perfil';
import { MetodosPagoScreen } from '@features/cliente/metodos-pago';
import { PromocionesScreen } from '@features/cliente/promociones';
import { FavoritasScreen } from '@features/cliente/favoritas';
import { ProgramarViajeScreen } from '@features/cliente/programar-viaje';

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
      <Stack.Screen name="Perfil" component={PerfilScreen} />
      <Stack.Screen name="MetodosPago" component={MetodosPagoScreen} />
      <Stack.Screen name="Promociones" component={PromocionesScreen} />
      <Stack.Screen name="Favoritas" component={FavoritasScreen} />
      <Stack.Screen name="ProgramarViaje" component={ProgramarViajeScreen} />
    </Stack.Navigator>
  );
}
