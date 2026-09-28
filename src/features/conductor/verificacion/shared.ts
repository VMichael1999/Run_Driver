import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type VerificationRouteName =
  | 'VerificacionInformacionBasica'
  | 'VerificacionFotoConductor'
  | 'VerificacionDocumento'
  | 'VerificacionLicencia'
  | 'VerificacionSoat'
  | 'VerificacionVehiculo'
  | 'VerificacionAntecedentes'
  | 'VerificacionContactoEmergencia';

export interface VerificationStep {
  id: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  value: string;
  route: VerificationRouteName;
}

export const verificationSteps: VerificationStep[] = [
  { id: '1', icon: 'document-text-outline', value: 'Información básica', route: 'VerificacionInformacionBasica' },
  { id: '2', icon: 'camera-outline', value: 'Confirmación foto conductor', route: 'VerificacionFotoConductor' },
  { id: '3', icon: 'card-outline', value: 'Documento de identificación', route: 'VerificacionDocumento' },
  { id: '4', icon: 'car-outline', value: 'Licencia de conducir', route: 'VerificacionLicencia' },
  { id: '5', icon: 'shield-checkmark-outline', value: 'SOAT', route: 'VerificacionSoat' },
  { id: '6', icon: 'car-sport-outline', value: 'Información acerca del vehículo', route: 'VerificacionVehiculo' },
  { id: '7', icon: 'newspaper-outline', value: 'Antecedentes policiales y penales', route: 'VerificacionAntecedentes' },
  { id: '8', icon: 'call-outline', value: 'Contacto de emergencia', route: 'VerificacionContactoEmergencia' },
];
