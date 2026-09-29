import {
  buildRouteProfile,
  interpolateRoutePosition,
  interpolateShortestAngle,
  sanitizeRoutePoints,
} from '../routeInterpolation';


describe('routeInterpolation', () => {
  const sampleRoute = [
    { latitude: -12.0464, longitude: -77.0428 },
    { latitude: -12.0500, longitude: -77.0428 }, // avanza al sur
    { latitude: -12.0500, longitude: -77.0380 }, // avanza al este
  ];

  describe('buildRouteProfile', () => {
    it('debe devolver perfil vacío si hay menos de 2 puntos', () => {
      const profile = buildRouteProfile([{ latitude: -12.0, longitude: -77.0 }]);
      expect(profile.totalDistance).toBe(0);
      expect(profile.cumulativeDistances).toEqual([0]);
    });

    it('debe calcular distancias acumuladas crecientes', () => {
      const profile = buildRouteProfile(sampleRoute);
      expect(profile.totalDistance).toBeGreaterThan(0);
      expect(profile.cumulativeDistances).toHaveLength(3);
      expect(profile.cumulativeDistances[0]).toBe(0);
      expect(profile.cumulativeDistances[1]).toBeGreaterThan(0);
      expect(profile.cumulativeDistances[2]).toBe(profile.totalDistance);
    });
  });

  describe('interpolateRoutePosition', () => {
    it('debe manejar ruta vacía', () => {
      const profile = buildRouteProfile([]);
      const result = interpolateRoutePosition([], profile, 0);
      expect(result.position).toEqual({ latitude: 0, longitude: 0 });
    });

    it('debe devolver el primer punto para distancia 0', () => {
      const profile = buildRouteProfile(sampleRoute);
      const result = interpolateRoutePosition(sampleRoute, profile, 0);
      expect(result.position.latitude).toBeCloseTo(sampleRoute[0].latitude);
      expect(result.position.longitude).toBeCloseTo(sampleRoute[0].longitude);
      expect(result.segmentIndex).toBe(0);
    });

    it('debe devolver el punto intermedio a mitad de camino', () => {
      const profile = buildRouteProfile(sampleRoute);
      const halfDist = profile.totalDistance / 2;
      const result = interpolateRoutePosition(sampleRoute, profile, halfDist);
      expect(result.position.latitude).toBeLessThan(sampleRoute[0].latitude);
      expect(result.remainingPoints.length).toBeGreaterThan(0);
    });

    it('debe devolver el último punto si la distancia supera el total', () => {
      const profile = buildRouteProfile(sampleRoute);
      const result = interpolateRoutePosition(sampleRoute, profile, profile.totalDistance + 10);
      const last = sampleRoute[sampleRoute.length - 1];
      expect(result.position.latitude).toBeCloseTo(last.latitude);
      expect(result.position.longitude).toBeCloseTo(last.longitude);
      expect(result.remainingPoints).toEqual([last]);
    });
  });

  describe('interpolateShortestAngle', () => {
    it('debe interpolar suavemente en línea recta', () => {
      const angle = interpolateShortestAngle(10, 20, 0.5);
      expect(angle).toBe(15);
    });

    it('debe tomar el camino más corto cruzando 0 y 360 grados', () => {
      const angle = interpolateShortestAngle(350, 10, 0.5);
      // Entre 350° y 10°, el camino más corto son +20°, la mitad es 360° (0°)
      expect(angle).toBeCloseTo(0, 0);
    });
  });

  describe('sanitizeRoutePoints', () => {
    it('debe filtrar puntos duplicados consecutivos', () => {
      const duplicateRoute = [
        { latitude: -12.0464, longitude: -77.0428 },
        { latitude: -12.0464, longitude: -77.0428 }, // idéntico
        { latitude: -12.0500, longitude: -77.0428 },
      ];
      const sanitized = sanitizeRoutePoints(duplicateRoute);
      expect(sanitized).toHaveLength(2);
      expect(sanitized[0]).toEqual(duplicateRoute[0]);
      expect(sanitized[1]).toEqual(duplicateRoute[2]);
    });
  });
});

