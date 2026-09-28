import type { MapStyleElement } from 'react-native-maps';

// Estilo de Google Maps con la paleta del mapa del diseño (--map-* en docs/rediseno-runsubasta.html).
// En iOS con Apple Maps no aplica; ahí se usa mapType "mutedStandard".
function buildMapStyle(c: {
  bg: string;
  block: string;
  road: string;
  ave: string;
  park: string;
  sea: string;
  label: string;
  labelHalo: string;
}): MapStyleElement[] {
  return [
    { elementType: 'geometry', stylers: [{ color: c.bg }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: c.label }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: c.labelHalo }] },
    { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: c.block }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: c.park }] },
    { featureType: 'poi.park', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: c.road }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: c.ave }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: c.ave }] },
    { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: c.sea }] },
  ];
}

export const MapStyleLight = buildMapStyle({
  bg: '#E3E7EA',
  block: '#D7DCE0',
  road: '#FFFFFF',
  ave: '#F6F1DF',
  park: '#D1E5D5',
  sea: '#CFE0EA',
  label: '#66717A',
  labelHalo: '#FFFFFF',
});

export const MapStyleNight = buildMapStyle({
  bg: '#101519',
  block: '#161C21',
  road: '#232B32',
  ave: '#303840',
  park: '#12241A',
  sea: '#0B1922',
  label: '#6F7A83',
  labelHalo: '#101519',
});
