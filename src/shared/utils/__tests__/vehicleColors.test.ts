import { getVehiclePaint } from '../vehicleColors';

describe('getVehiclePaint', () => {
  it('usa el color real del auto sin importar mayúsculas ni tildes', () => {
    expect(getVehiclePaint('Plata').base).toBe('#A9B1B9');
    expect(getVehiclePaint('AZUL').base).toBe('#2456A8');
    expect(getVehiclePaint('Azul metálico').base).toBe('#2456A8');
    expect(getVehiclePaint('gris plomo').base).toBe('#6F777E');
  });

  it('reconoce sinónimos comunes', () => {
    expect(getVehiclePaint('Plateado')).toEqual(getVehiclePaint('Plata'));
    expect(getVehiclePaint('Guinda')).toEqual(getVehiclePaint('Rojo'));
  });

  it('con un color desconocido elige siempre el mismo según la placa', () => {
    const first = getVehiclePaint('Turquesa', 'ABC-123');
    expect(getVehiclePaint('Turquesa', 'ABC-123')).toEqual(first);
    expect(getVehiclePaint('Morado', 'abc-123')).toEqual(first);
  });
});
