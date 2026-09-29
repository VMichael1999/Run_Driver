import React from 'react';
import { render } from '@testing-library/react-native';
import { MovingCarMarker } from '../MovingCarMarker';

// Mock de react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Marker: (props: any) => React.createElement(View, { testID: 'moving-car-marker', ...props }),
  };
});

describe('MovingCarMarker', () => {
  const sampleRoute = [
    { latitude: -12.0464, longitude: -77.0428 },
    { latitude: -12.0500, longitude: -77.0428 },
  ];

  it('debe renderizar el marcador de auto en la coordenada inicial', () => {
    const { getByTestId } = render(
      <MovingCarMarker
        route={sampleRoute}
        isActive={false}
      />
    );

    const marker = getByTestId('moving-car-marker');
    expect(marker).toBeTruthy();
    expect(marker.props.coordinate).toEqual(sampleRoute[0]);
  });
});
