# Status Unit Tests — RunSubasta

> Actualizar este archivo cada vez que se agregan, modifican o pasan tests.

| Feature | Suite | Archivo | Estado | Casos cubiertos |
|---------|-------|---------|--------|-----------------|
| auth | `useLogin` | `auth/hooks/__tests__/useLogin.test.ts` | ✅ Escrito | init, setPhone, validación corta, sendOtp OK, error API |
| auth | `useOtpVerification` | `auth/hooks/__tests__/useOtpVerification.test.ts` | ✅ Escrito | init, validación longitud, verifyOtp OK, error API |
| shared/utils | `mapUtils` | `shared/utils/__tests__/mapUtils.test.ts` | ✅ Pasando (11/11) | calculateDistance, calculateBearing, formatDistance, formatEta |
| store | `useTaxiStore` | `store/__tests__/useTaxiStore.test.ts` | ✅ Pasando (11/11) | init, setRequest, acceptOffer, endTrip |
| chat | `useChat` | — | ⬜ Pendiente | sendMessage, draft |
| conductor | `useSolicitudes` | — | ⬜ Pendiente | fetch, selectedId |
| cliente | `useClienteHome` | — | ⬜ Pendiente | requestTaxi, canRequest |
| cliente/perfil | `usePerfil` | `features/cliente/perfil/hooks/__tests__/usePerfil.test.ts` | ✅ Escrito | carga inicial, update OK, error de carga, error de update |
| store | `usePaymentSelectionStore` | `store/__tests__/usePaymentSelectionStore.test.ts` | ✅ Pasando (2/2) | inicializa con default, setSelected cambia entre opciones |
| cliente/promociones | `usePromociones` | `features/cliente/promociones/hooks/__tests__/usePromociones.test.ts` | ✅ Pasando (4/4) | carga, aplicar valido, error invalido, removeCoupon |
| store | `useFavoriteAddressesStore` | `store/__tests__/useFavoriteAddressesStore.test.ts` | ✅ Pasando (4/4) | add/remove, rename, rename vacio ignorado, moveFavorite limites |
| store | `useScheduledTripsStore` | `store/__tests__/useScheduledTripsStore.test.ts` | ✅ Pasando (3/3) | agregar ordenado, cancelar, notes vacias omitidas |

## Convención de estados
- ✅ Escrito y pasando
- 🔴 Escrito pero fallando
- ⬜ Pendiente de escribir
- ⚠️ Saltado (motivo documentado)

## Ejecutar tests
```bash
npm run test:ci    # una vez + coverage
npm run test       # modo watch
```
