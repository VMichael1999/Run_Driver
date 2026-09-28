# Status Unit Tests — RunSubasta

> Actualizar este archivo cada vez que se agregan, modifican o pasan tests.

| Feature | Suite | Archivo | Estado | Casos cubiertos |
|---------|-------|---------|--------|-----------------|
| auth | `useLogin` | `src/features/auth/hooks/__tests__/useLogin.test.ts` | ✅ Pasando (5/5) | init, setPhone, validación corta, sendOtp OK, error API |
| auth | `useOtpVerification` | `src/features/auth/hooks/__tests__/useOtpVerification.test.ts` | ✅ Pasando (4/4) | init, validación longitud, verifyOtp OK, error API |
| shared/utils | `mapUtils` | `src/shared/utils/__tests__/mapUtils.test.ts` | ✅ Pasando (11/11) | calculateDistance, calculateBearing, formatDistance, formatEta |
| store | `useTaxiStore` | `src/store/__tests__/useTaxiStore.test.ts` | ✅ Pasando (4/4) | init, setRequest, acceptOffer, endTrip |
| cliente/perfil | `usePerfil` | `src/features/cliente/perfil/hooks/__tests__/usePerfil.test.ts` | ✅ Pasando (4/4) | carga inicial, update OK, error de carga, error de update |
| store | `usePaymentSelectionStore` | `src/store/__tests__/usePaymentSelectionStore.test.ts` | ✅ Pasando (2/2) | inicializa con default, setSelected cambia entre opciones |
| cliente/promociones | `usePromociones` | `src/features/cliente/promociones/hooks/__tests__/usePromociones.test.ts` | ✅ Pasando (4/4) | carga, aplicar valido, error invalido, removeCoupon |
| store | `useFavoriteAddressesStore` | `src/store/__tests__/useFavoriteAddressesStore.test.ts` | ✅ Pasando (4/4) | add/remove, rename, rename vacio ignorado, moveFavorite limites |
| store | `useScheduledTripsStore` | `src/store/__tests__/useScheduledTripsStore.test.ts` | ✅ Pasando (3/3) | agregar ordenado, cancelar, notes vacias omitidas |

## Resumen de cobertura Jest CI (npm run test:ci)
- **Test Suites:** 9 pasadas, 9 total (100 %)
- **Tests:** 38 pasados, 38 total (100 %)
- **Coverage Statements:** 85.35 %
- **Coverage Lines:** 88.51 %

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
