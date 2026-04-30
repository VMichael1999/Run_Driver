import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ConductorStackParamList, ConductorTabParamList } from './types';
import { ConductorHomeScreen } from '@features/conductor/home/ConductorHomeScreen';
import { SolicitudesScreen } from '@features/conductor/solicitudes/SolicitudesScreen';
import { SolicitudesDetalleScreen } from '@features/conductor/solicitudes-detalle/SolicitudesDetalleScreen';
import { SolicitudesTrayectoScreen } from '@features/conductor/solicitudes-trayecto/SolicitudesTrayectoScreen';
import { ConfirmarPuntoPartidaScreen } from '@features/conductor/confirmar-punto-partida/ConfirmarPuntoPartidaScreen';
import { CuentaScreen } from '@features/conductor/cuenta/CuentaScreen';
import { ExperienciaScreen } from '@features/conductor/experiencia/ExperienciaScreen';
import { IngresosScreen } from '@features/conductor/ingresos/IngresosScreen';
import { ChatScreen } from '@features/chat/ChatScreen';
import { HistorialViajeScreen } from '@features/historial/HistorialViajeScreen';
import { ConfiguracionScreen } from '@features/configuracion/ConfiguracionScreen';
import { VerificacionScreen } from '@features/conductor/verificacion/VerificacionScreen';
import { VerificacionInformacionBasicaScreen } from '@features/conductor/verificacion/VerificacionInformacionBasicaScreen';
import { VerificacionFotoConductorScreen } from '@features/conductor/verificacion/VerificacionFotoConductorScreen';
import { VerificacionDocumentoScreen } from '@features/conductor/verificacion/VerificacionDocumentoScreen';
import { VerificacionLicenciaScreen } from '@features/conductor/verificacion/VerificacionLicenciaScreen';
import { VerificacionSoatScreen } from '@features/conductor/verificacion/VerificacionSoatScreen';
import { VerificacionVehiculoScreen } from '@features/conductor/verificacion/VerificacionVehiculoScreen';
import { VerificacionAntecedentesScreen } from '@features/conductor/verificacion/VerificacionAntecedentesScreen';
import { VerificacionContactoEmergenciaScreen } from '@features/conductor/verificacion/VerificacionContactoEmergenciaScreen';
import { Colors } from '@theme/colors';

const Tab = createBottomTabNavigator<ConductorTabParamList>();
const Stack = createNativeStackNavigator<ConductorStackParamList>();

function ConductorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
      }}
    >
      <Tab.Screen name="Solicitudes" component={SolicitudesScreen} />
      <Tab.Screen name="Ingresos" component={IngresosScreen} />
      <Tab.Screen name="Experiencia" component={ExperienciaScreen} />
      <Tab.Screen name="Cuenta" component={CuentaScreen} />
    </Tab.Navigator>
  );
}

export function ConductorNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConductorHome" component={ConductorTabs} />
      <Stack.Screen name="SolicitudesDetalle" component={SolicitudesDetalleScreen} />
      <Stack.Screen name="SolicitudesTrayecto" component={SolicitudesTrayectoScreen} />
      <Stack.Screen name="ConfirmarPuntoPartida" component={ConfirmarPuntoPartidaScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="HistorialViaje" component={HistorialViajeScreen} />
      <Stack.Screen name="Configuracion" component={ConfiguracionScreen} />
      <Stack.Screen name="Verificacion" component={VerificacionScreen} />
      <Stack.Screen name="VerificacionInformacionBasica" component={VerificacionInformacionBasicaScreen} />
      <Stack.Screen name="VerificacionFotoConductor" component={VerificacionFotoConductorScreen} />
      <Stack.Screen name="VerificacionDocumento" component={VerificacionDocumentoScreen} />
      <Stack.Screen name="VerificacionLicencia" component={VerificacionLicenciaScreen} />
      <Stack.Screen name="VerificacionSoat" component={VerificacionSoatScreen} />
      <Stack.Screen name="VerificacionVehiculo" component={VerificacionVehiculoScreen} />
      <Stack.Screen name="VerificacionAntecedentes" component={VerificacionAntecedentesScreen} />
      <Stack.Screen name="VerificacionContactoEmergencia" component={VerificacionContactoEmergenciaScreen} />
    </Stack.Navigator>
  );
}
