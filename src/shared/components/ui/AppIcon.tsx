import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

// Íconos de trazo del diseño (docs/rediseno-runsubasta.html). Mismo viewBox 24, trazo 1.9 y extremos redondeados.
const ICONS = {
  menu: <Path d="M4 7h16M4 12h16M4 17h10" />,
  arrow: <Path d="M5 12h14M13 6l6 6-6 6" />,
  back: <Path d="M19 12H5M11 6l-6 6 6 6" />,
  phone: <Path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  msg: <Path d="M4 5h16v11H9l-5 4z" />,
  nav: <Path d="M3 11l18-8-8 18-2-8z" />,
  shield: (
    <>
      <Path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" />
      <Path d="M12 8v5M12 16v.01" />
    </>
  ),
  check: <Path d="M5 12.5l4.5 4.5L19 7" />,
  info: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 11v5M12 8v.01" />
    </>
  ),
  power: (
    <>
      <Path d="M12 3v8" />
      <Path d="M6.3 7.3a8 8 0 1 0 11.4 0" />
    </>
  ),
  cash: (
    <>
      <Rect x="3" y="6" width="18" height="12" rx="2" />
      <Circle cx="12" cy="12" r="2.5" />
      <Path d="M7 9.5v.01M17 14.5v.01" />
    </>
  ),
  list: <Path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  wallet: (
    <>
      <Path d="M4 7a2 2 0 0 1 2-2h12v4" />
      <Path d="M4 7v10a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2z" />
      <Path d="M16 14h.01" />
    </>
  ),
  cal: (
    <>
      <Rect x="3" y="5" width="18" height="16" rx="2" />
      <Path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  staro: <Path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z" />,
  time: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 7v5l3 2" />
    </>
  ),
  gear: (
    <>
      <Circle cx="12" cy="12" r="3.2" />
      <Path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
    </>
  ),
  logout: (
    <>
      <Path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5" />
      <Path d="M15 7l5 5-5 5M20 12H9" />
    </>
  ),
  del: (
    <>
      <Path d="M21 5H8l-5 7 5 7h13z" />
      <Path d="M16 9.5l-5 5M11 9.5l5 5" />
    </>
  ),
  search: (
    <>
      <Circle cx="11" cy="11" r="7" />
      <Path d="M20 20l-3.5-3.5" />
    </>
  ),
  home: <Path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" />,
  brief: (
    <>
      <Rect x="3" y="7" width="18" height="13" rx="2" />
      <Path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18" />
    </>
  ),
  plus: <Path d="M12 5v14M5 12h14" />,
  share: (
    <>
      <Circle cx="6" cy="12" r="2.5" />
      <Circle cx="18" cy="6" r="2.5" />
      <Circle cx="18" cy="18" r="2.5" />
      <Path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" />
    </>
  ),
  pin: (
    <>
      <Path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <Circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  chev: <Path d="M9 6l6 6-6 6" />,
  down: <Path d="M6 9l6 6 6-6" />,
  hist: (
    <>
      <Path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <Path d="M3 3v5h5M12 7v5l3 2" />
    </>
  ),
  map: (
    <>
      <Path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z" />
      <Path d="M9 4v14M15 6v14" />
    </>
  ),
  bolt: <Path d="M13 3L5 13h6l-1 8 8-10h-6z" />,
  close: <Path d="M6 6l12 12M18 6L6 18" />,
  tag: (
    <>
      <Path d="M3 12V4h8l10 10-8 8z" />
      <Circle cx="7.5" cy="8.5" r="1.5" />
    </>
  ),
} as const;

export type AppIconName = keyof typeof ICONS;

const SIZES = { s: 16, m: 20, l: 24 } as const;

interface AppIconProps {
  name: AppIconName;
  color: string;
  size?: keyof typeof SIZES | number;
  strokeWidth?: number;
}

export function AppIcon({ name, color, size = 'm', strokeWidth = 1.9 }: AppIconProps) {
  const px = typeof size === 'number' ? size : SIZES[size];
  return (
    <Svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </Svg>
  );
}

// Estrella rellena para calificaciones (símbolo "star" del diseño).
export function StarIcon({ color, size = 12 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path fill={color} d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z" />
    </Svg>
  );
}
