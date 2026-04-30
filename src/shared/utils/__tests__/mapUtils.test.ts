/**
 * @jest-environment node
 */
import { calculateDistance, calculateBearing, decodePolyline, formatDistance, formatEta } from '../mapUtils';

describe('calculateDistance', () => {
  it('calcula distancia entre dos puntos conocidos', () => {
    const miraflores = { latitude: -12.1214, longitude: -77.0297 };
    const sanBorja = { latitude: -12.1007, longitude: -77.0003 };
    const dist = calculateDistance(miraflores, sanBorja);
    expect(dist).toBeGreaterThan(2);
    expect(dist).toBeLessThan(5);
  });

  it('retorna ~0 para puntos iguales', () => {
    const p = { latitude: -12.0464, longitude: -77.0428 };
    expect(calculateDistance(p, p)).toBeCloseTo(0);
  });
});

describe('calculateBearing', () => {
  it('retorna un ángulo entre 0 y 360', () => {
    const from = { latitude: -12.0, longitude: -77.0 };
    const to = { latitude: -11.9, longitude: -76.9 };
    const bearing = calculateBearing(from, to);
    expect(bearing).toBeGreaterThanOrEqual(0);
    expect(bearing).toBeLessThanOrEqual(360);
  });
});

describe('formatDistance', () => {
  it('muestra metros para distancias < 1km', () => {
    expect(formatDistance(0.5)).toBe('500 m');
  });

  it('muestra kilómetros para distancias >= 1km', () => {
    expect(formatDistance(2.3)).toBe('2.3 km');
  });
});

describe('formatEta', () => {
  it('muestra minutos para menos de 1 hora', () => {
    expect(formatEta(15)).toBe('15 min');
  });

  it('muestra horas y minutos para >= 60 min', () => {
    expect(formatEta(90)).toBe('1 h 30 min');
  });
});

describe('decodePolyline', () => {
  it('decodifica una polyline codificada de Google', () => {
    const decoded = decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@');
    expect(decoded).toHaveLength(3);
    expect(decoded[0].latitude).toBeCloseTo(38.5);
    expect(decoded[0].longitude).toBeCloseTo(-120.2);
    expect(decoded[2].latitude).toBeCloseTo(43.252);
    expect(decoded[2].longitude).toBeCloseTo(-126.453);
  });
});
