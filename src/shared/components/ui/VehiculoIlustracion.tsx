import React from 'react';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useAppTheme } from '@theme/useAppTheme';
import { getVehiclePaint } from '@shared/utils/vehicleColors';

interface VehiculoIlustracionProps {
  /** Color del auto como lo reporta el conductor ("Plata", "Azul"…). */
  color: string;
  /** Si el color no se reconoce, la placa decide uno fijo para ese auto. */
  plate?: string;
  width?: number;
}

const BODY =
  'M16 68 C16 60 20 55 28 53 L66 48 C80 33 96 25 118 24 L150 24 C168 24 180 32 194 45 L216 49 C226 51 232 57 232 66 L232 72 C232 76 229 78 225 78 L203 78 A21 21 0 0 0 161 78 L85 78 A21 21 0 0 0 43 78 L22 78 C18 78 16 75 16 71 Z';
const GLASS = 'M76 47 C88 35 100 29 119 28.5 L148 28.5 C162 28.5 172 34 184 46 Z';
const WHEELS = [64, 182];

/** Sedán de perfil en SVG, pintado con el color del auto en acabado metalizado. */
export function VehiculoIlustracion({ color, plate, width = 180 }: VehiculoIlustracionProps) {
  const theme = useAppTheme();
  const paint = getVehiclePaint(color, plate);
  // Ids únicos por instancia: dos autos en pantalla no comparten gradientes.
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '');

  return (
    <Svg width={width} height={(width * 100) / 240} viewBox="0 0 240 100" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Defs>
        <LinearGradient id={`body${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={paint.light} />
          <Stop offset="0.38" stopColor={paint.base} />
          <Stop offset="0.62" stopColor={paint.base} />
          <Stop offset="1" stopColor={paint.dark} />
        </LinearGradient>
        <LinearGradient id={`shine${id}`} x1="0" y1="0" x2="0.35" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.35} />
          <Stop offset="0.4" stopColor="#FFFFFF" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id={`glass${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3A4652" />
          <Stop offset="1" stopColor="#11161B" />
        </LinearGradient>
        <RadialGradient id={`rim${id}`} cx="0.4" cy="0.35" r="0.7">
          <Stop offset="0" stopColor="#F2F4F6" />
          <Stop offset="1" stopColor="#7C848C" />
        </RadialGradient>
      </Defs>

      <Ellipse cx={122} cy={88} rx={104} ry={6} fill="#000000" opacity={0.18} />
      {WHEELS.map((cx) => (
        <Circle key={`well${cx}`} cx={cx} cy={78} r={21} fill="#0B0D0F" />
      ))}
      <Path d={BODY} fill={`url(#body${id})`} />
      {/* Brillo y un contorno tenue para que un auto negro se distinga en modo oscuro (y uno blanco en claro). */}
      <Path d={BODY} fill={`url(#shine${id})`} stroke={theme.text} strokeOpacity={0.2} strokeWidth={1} />
      <Path d={GLASS} fill={`url(#glass${id})`} />
      <Rect x={127} y={28} width={4} height={19} fill={paint.base} />
      <Path d="M22 58 L226 58" stroke="#FFFFFF" strokeOpacity={0.28} strokeWidth={1.5} />
      <Path d="M129 49 L129 76" stroke="#000000" strokeOpacity={0.22} strokeWidth={1.2} />
      <Rect x={108} y={54} width={10} height={2.5} rx={1.2} fill="#000000" opacity={0.3} />
      <Rect x={146} y={54} width={10} height={2.5} rx={1.2} fill="#000000" opacity={0.3} />
      <Path d="M219 53 L230 58 L229 62 L218 60 Z" fill="#FFF4CF" />
      <Path d="M17 58 L29 55 L29 61 L17 62 Z" fill="#D8262F" />
      {WHEELS.map((cx) => (
        <React.Fragment key={`wheel${cx}`}>
          <Circle cx={cx} cy={78} r={18} fill="#15181B" />
          <Circle cx={cx} cy={78} r={10.5} fill={`url(#rim${id})`} />
          <Circle cx={cx} cy={78} r={3} fill="#2A2F34" />
        </React.Fragment>
      ))}
    </Svg>
  );
}
