import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

export interface GradientStop {
  color: string;
  /** Posición de 0 a 1 (en CSS, el porcentaje de la parada). */
  offset: number;
}

type GradientFillProps =
  | {
      type: 'linear';
      /** Ángulo en grados como en CSS `linear-gradient(<angle>, …)`. */
      angle: number;
      stops: GradientStop[];
    }
  | {
      type: 'radial';
      /** Centro y radios en fracción de la caja, como CSS `radial-gradient(rx ry at cx cy, …)`. */
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      stops: GradientStop[];
    };

/** Fondo con degradado que llena a su padre (los degradados del mockup en SVG). */
export function GradientFill(props: GradientFillProps) {
  const id = React.useId().replace(/:/g, '');

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        {props.type === 'linear' ? (
          <LinearGradient id={id} {...linearPoints(props.angle)}>
            {props.stops.map((stop) => (
              <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
            ))}
          </LinearGradient>
        ) : (
          <RadialGradient
            id={id}
            cx={props.cx}
            cy={props.cy}
            fx={props.cx}
            fy={props.cy}
            rx={props.rx}
            ry={props.ry}
          >
            {props.stops.map((stop) => (
              <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
            ))}
          </RadialGradient>
        )}
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

/** Convierte el ángulo CSS (0° hacia arriba, sentido horario) a puntos de la caja. */
function linearPoints(angle: number) {
  const radians = (angle * Math.PI) / 180;
  const dx = Math.sin(radians) / 2;
  const dy = -Math.cos(radians) / 2;
  return { x1: 0.5 - dx, y1: 0.5 - dy, x2: 0.5 + dx, y2: 0.5 + dy };
}
