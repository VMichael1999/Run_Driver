// La clave se lee de .env (EXPO_PUBLIC_GOOGLE_MAPS_API_KEY); ver .env.example.
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

if (__DEV__ && !GOOGLE_MAPS_API_KEY) {
  console.warn('Falta EXPO_PUBLIC_GOOGLE_MAPS_API_KEY en .env: la búsqueda de direcciones y las rutas no funcionarán.');
}
