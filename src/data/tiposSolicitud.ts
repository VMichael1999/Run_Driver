export interface TipoSolicitud {
  id: number;
  nombre: string;
  descripcion: string;
  assetName: string;
}

export const tiposSolicitud: TipoSolicitud[] = [
  {
    id: 1,
    nombre: 'Estándar',
    descripcion: 'Servicio básico de taxi',
    assetName: 'taxi_estandar',
  },
  {
    id: 2,
    nombre: 'Familiar',
    descripcion: 'Para grupos y familias',
    assetName: 'taxi_familiar',
  },
  {
    id: 3,
    nombre: 'Deluxe',
    descripcion: 'Vehículo premium',
    assetName: 'taxi_deluxe',
  },
];
