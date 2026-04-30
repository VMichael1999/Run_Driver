import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { SearchTarget } from '@shared/types';

// Root stack — decides whether to show auth or main app
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  ClienteApp: undefined;
  ConductorApp: undefined;
};

// Auth stack
export type AuthStackParamList = {
  Login: undefined;
  LoginVerificacion: { phone: string; countryCode: string };
};

// Cliente stack (inside drawer/tabs)
export type ClienteStackParamList = {
  ClienteHome: undefined;
  SearchAddress: { target: SearchTarget; saveFavorite?: boolean };
  SelectAddressOnMap: { target: SearchTarget; saveFavorite?: boolean };
  SolicitudTaxi: undefined;
  TrayectoTaxi: undefined;
  Chat: { userId: string; userName: string };
  HistorialViaje: undefined;
  Configuracion: undefined;
};

// Conductor bottom tabs
export type ConductorTabParamList = {
  Solicitudes: undefined;
  Ingresos: undefined;
  Experiencia: undefined;
  Cuenta: undefined;
};

// Conductor stack
export type ConductorStackParamList = {
  ConductorHome: undefined;
  SolicitudesDetalle: { alertId: string };
  SolicitudesTrayecto: undefined;
  Chat: { userId: string; userName: string };
  HistorialViaje: undefined;
  Configuracion: undefined;
  Verificacion: undefined;
  VerificacionInformacionBasica: undefined;
  VerificacionFotoConductor: undefined;
  VerificacionDocumento: undefined;
  VerificacionLicencia: undefined;
  VerificacionSoat: undefined;
  VerificacionVehiculo: undefined;
  VerificacionAntecedentes: undefined;
  VerificacionContactoEmergencia: undefined;
};

// Screen prop types
export type LoginProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type LoginVerificacionProps = NativeStackScreenProps<AuthStackParamList, 'LoginVerificacion'>;
export type ClienteHomeProps = NativeStackScreenProps<ClienteStackParamList, 'ClienteHome'>;
export type SolicitudTaxiProps = NativeStackScreenProps<ClienteStackParamList, 'SolicitudTaxi'>;
export type TrayectoTaxiProps = NativeStackScreenProps<ClienteStackParamList, 'TrayectoTaxi'>;
export type ConductorHomeProps = NativeStackScreenProps<ConductorStackParamList, 'ConductorHome'>;
export type SolicitudesDetalleProps = NativeStackScreenProps<ConductorStackParamList, 'SolicitudesDetalle'>;
