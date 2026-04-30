import type { Coordinates } from '@shared/types';

export const habich: Coordinates[] = [
  { latitude: -11.989727245667737, longitude: -77.06661873668942 },
  { latitude: -11.989158703693521, longitude: -77.06670292489089 },
  { latitude: -11.988631406983105, longitude: -77.06679088795315 },
  { latitude: -11.988516680949084, longitude: -77.0660262870756 },
  { latitude: -11.988024683111231, longitude: -77.06609620635398 },
  { latitude: -11.987949669247511, longitude: -77.06561579339495 },
  { latitude: -11.988412986045052, longitude: -77.06553459669047 },
  { latitude: -11.990511942897436, longitude: -77.06520201564973 },
  { latitude: -11.994352993991217, longitude: -77.06462264729574 },
  { latitude: -12.004118923333712, longitude: -77.05990864919085 },
  { latitude: -12.017264866895447, longitude: -77.05169562314235 },
  { latitude: -12.022630424145454, longitude: -77.05064192817883 },
  { latitude: -12.023624725986533, longitude: -77.05062146562722 },
];

export const cantaCallao: Coordinates[] = [
  { latitude: -11.989727245667737, longitude: -77.06661873668942 },
  { latitude: -11.989158703693521, longitude: -77.06670292489089 },
  { latitude: -11.986764650354052, longitude: -77.06578787951284 },
  { latitude: -11.98720169605401, longitude: -77.06857134302881 },
  { latitude: -11.987572747058296, longitude: -77.06917067093417 },
  { latitude: -11.986153724485945, longitude: -77.07043577905775 },
  { latitude: -11.984480397122448, longitude: -77.07199196050269 },
  { latitude: -11.978743086573907, longitude: -77.07227101209418 },
  { latitude: -11.972005659138803, longitude: -77.07245624140636 },
  { latitude: -11.968151832833913, longitude: -77.08362920595938 },
  { latitude: -11.968061783410883, longitude: -77.08331952005305 },
];

export const comas: Coordinates[] = [
  { latitude: -11.989727245667737, longitude: -77.06661873668942 },
  { latitude: -11.988024683111231, longitude: -77.06609620635398 },
  { latitude: -11.986382303217354, longitude: -77.06419757482944 },
  { latitude: -11.985390828753948, longitude: -77.05793802970318 },
  { latitude: -11.980112000800549, longitude: -77.05885549646064 },
  { latitude: -11.97313457150482, longitude: -77.05758416830672 },
  { latitude: -11.968784044583552, longitude: -77.05748954038602 },
  { latitude: -11.959095402525797, longitude: -77.05344619106073 },
  { latitude: -11.950746075095502, longitude: -77.04886236988378 },
];

export const norte: Coordinates[] = [
  { latitude: -11.989727245667737, longitude: -77.06661873668942 },
  { latitude: -11.976384668088313, longitude: -77.0676499352547 },
  { latitude: -11.944875600879929, longitude: -77.07064690085389 },
  { latitude: -11.918937675439597, longitude: -77.0730050794367 },
];

export const sur: Coordinates[] = [
  { latitude: -11.989727245667737, longitude: -77.06661873668942 },
  { latitude: -11.991844410585895, longitude: -77.06555061053521 },
  { latitude: -12.004482516898124, longitude: -77.06370164215741 },
  { latitude: -12.020449719473687, longitude: -77.06161014109063 },
  { latitude: -12.034725326312131, longitude: -77.05960917604872 },
];

export const este: Coordinates[] = [
  { latitude: -11.989727245667737, longitude: -77.06661873668942 },
  { latitude: -11.987542711648961, longitude: -77.05718791486112 },
  { latitude: -11.988185698525994, longitude: -77.04178535756107 },
  { latitude: -11.988591942387119, longitude: -77.02301819973742 },
];

export const oeste: Coordinates[] = [
  { latitude: -11.989727245667737, longitude: -77.06661873668942 },
  { latitude: -11.988266057859667, longitude: -77.07025898793441 },
  { latitude: -11.988161121279463, longitude: -77.0778228224418 },
  { latitude: -11.987450911897291, longitude: -77.08377862228254 },
];

export const allRoutes: Coordinates[][] = [
  habich, cantaCallao, comas, norte, sur, este, oeste,
];

// Lugares dummy para búsqueda de origen
export const lugaresDummy = {
  origenes: [
    { nombre: 'Av. Los Alisos 556', referencia: 'Los Olivos', coords: { latitude: -11.989727, longitude: -77.066618 } },
    { nombre: 'Av. Izaguirre 336', referencia: 'Los Olivos', coords: { latitude: -11.989158, longitude: -77.066702 } },
    { nombre: 'Av. Las Palmeras 99', referencia: 'Los Olivos', coords: { latitude: -11.988631, longitude: -77.066790 } },
  ],
  destinos: [
    { nombre: 'Av. Canta Callao 659', referencia: 'San Martín de Porres', coords: cantaCallao[cantaCallao.length - 1] },
    { nombre: 'Av. Tomas Valle 141', referencia: 'San Martín de Porres', coords: norte[norte.length - 1] },
    { nombre: 'Av. Habich 889', referencia: 'San Martín de Porres', coords: habich[habich.length - 1] },
  ],
};
