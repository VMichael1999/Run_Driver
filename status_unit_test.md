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
