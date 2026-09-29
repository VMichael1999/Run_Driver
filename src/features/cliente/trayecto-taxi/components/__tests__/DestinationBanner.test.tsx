import React from 'react';
import { render, act } from '@testing-library/react-native';
import { DestinationBanner, useTripProgressStore } from '../DestinationBanner';

describe('DestinationBanner', () => {
  beforeEach(() => {
    useTripProgressStore.getState().resetProgress();
  });

  it('debe mostrar los minutos y kilómetros iniciales correctamente', () => {
    const { getByText } = render(
      <DestinationBanner
        top={50}
        destinationName="Av. Javier Prado Este 450"
        etaMinutes={10}
        distanceKm={4.0}
      />
    );

    expect(getByText('Llegas en ~10 min')).toBeTruthy();
    expect(getByText('4.0 km')).toBeTruthy();
    expect(getByText('Av. Javier Prado Este 450')).toBeTruthy();
    expect(getByText('En viaje')).toBeTruthy();
  });

  it('debe actualizar los minutos y kilómetros reactivamente cuando cambia useTripProgressStore', () => {
    const { getByText } = render(
      <DestinationBanner
        top={50}
        destinationName="Av. Javier Prado Este 450"
        etaMinutes={10}
        distanceKm={4.0}
      />
    );

    act(() => {
      useTripProgressStore.getState().setProgress(0.5);
    });

    expect(getByText('Llegas en ~5 min')).toBeTruthy();
    expect(getByText('2.0 km')).toBeTruthy();

    act(() => {
      useTripProgressStore.getState().setProgress(1);
    });

    expect(getByText('Llegas en ~1 min')).toBeTruthy();
    expect(getByText('0.1 km')).toBeTruthy();
  });
});
