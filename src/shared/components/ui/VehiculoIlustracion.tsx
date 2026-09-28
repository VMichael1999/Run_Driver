import React from 'react';
import Svg, { Defs, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import { useAppTheme } from '@theme/useAppTheme';
import { getVehiclePaint } from '@shared/utils/vehicleColors';
import { CAR_PATHS, CAR_VIEWBOX } from './vehiculo/carPaths';

interface VehiculoIlustracionProps {
  /** Color del auto como lo reporta el conductor ("Plata", "Azul"…). */
  color: string;
  /** Si el color no se reconoce, la placa decide uno fijo para ese auto. */
  plate?: string;
  width?: number;
}

const LINE_COLOR = '#0B0D0F';

/** Auto en vista de tres cuartos con la carrocería pintada del color del conductor, en acabado metalizado. */
export function VehiculoIlustracion({ color, plate, width = 200 }: VehiculoIlustracionProps) {
  const theme = useAppTheme();
  const paint = getVehiclePaint(color, plate);
  // Ids únicos por instancia: dos autos en pantalla no comparten gradientes.
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const height = (width * CAR_VIEWBOX.height) / CAR_VIEWBOX.width;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${CAR_VIEWBOX.width} ${CAR_VIEWBOX.height}`}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Defs>
        <LinearGradient id={`paint${id}`} x1="0" y1="0" x2="0.25" y2="1">
          <Stop offset="0" stopColor={paint.light} />
          <Stop offset="0.45" stopColor={paint.base} />
          <Stop offset="1" stopColor={paint.dark} />
        </LinearGradient>
        <LinearGradient id={`glass${id}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#DCE6EE" />
          <Stop offset="1" stopColor="#9FB0BF" />
        </LinearGradient>
        <RadialGradient id={`rim${id}`} cx="0.4" cy="0.35" r="0.8">
          <Stop offset="0" stopColor="#F4F6F8" />
          <Stop offset="1" stopColor="#8A929A" />
        </RadialGradient>
      </Defs>
      <G fillRule="evenodd">
        {/* Borde exterior tenue: separa el contorno negro del fondo en modo oscuro. Las piezas lo tapan por dentro. */}
        <Path d={CAR_PATHS.lines} fill="none" stroke={theme.text} strokeOpacity={0.35} strokeWidth={14} />
        <Path d={CAR_PATHS.body} fill={`url(#paint${id})`} />
        <Path d={CAR_PATHS.grille} fill={paint.dark} />
        <Path d={CAR_PATHS.lip} fill={paint.dark} />
        <Path d={CAR_PATHS.glass} fill={`url(#glass${id})`} />
        <Path d={CAR_PATHS.lights} fill="#FFF8E1" />
        <Path d={CAR_PATHS.rims} fill={`url(#rim${id})`} />
        <Path d={CAR_PATHS.lines} fill={LINE_COLOR} />
      </G>
    </Svg>
  );
}
