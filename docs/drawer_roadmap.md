# Roadmap del Drawer del Cliente

Guia de implementacion para extender el menu lateral en `src/shared/components/drawer/ClienteDrawer.tsx`. El navegador esta en `src/navigation/ClienteDrawerNavigator.tsx` y los tipos en `src/navigation/types.ts`.

## Estado actual

Opciones existentes:
- Mapa (`ClienteHome`)
- Mis viajes
- Seguridad e integridad
- Configuracion
- Ayuda
- Soporte

## Convenciones del proyecto

Antes de implementar, revisar `CLAUDE.md` en la raiz. Reglas obligatorias relevantes:
- Una feature por carpeta en `src/features/<feature>/` con `components/`, `hooks/`, `services/`, `types.ts`, `index.ts`.
- UI no importa servicios directamente, pasa por hooks.
- Tipos explicitos, sin `any`.
- Test minimo por hook con `@testing-library/react-native`. Actualizar `status_unit_test.md`.

## Estructura propuesta del drawer

Orden recomendado (de arriba a abajo):

1. Header de perfil (existente).
2. Navegacion principal: Mapa, Mis viajes, Programar viaje.
3. Cartera y promociones: Metodos de pago, Promociones, Saldo, Referidos.
4. Personales: Direcciones favoritas, Contactos de emergencia.
5. Preferencias: Notificaciones, Idioma, Modo oscuro, Configuracion.
6. Confianza: Seguridad, Ayuda, Soporte, Terminos y condiciones, Politica de privacidad.
7. Footer fijo: Cerrar sesion + version de la app.

## Tareas, agrupadas por prioridad

### Fase 1 - Esenciales

#### 1. Metodos de pago
- Feature: `src/features/cliente/metodos-pago/`.
- Tipos: reusar `PaymentMode` y `PaymentMethod` de `src/shared/types/index.ts`.
- Store: `src/store/usePaymentMethodsStore.ts` (Zustand) con CRUD de tarjetas y wallets (Yape, Plin, Tunki).
- Pantallas: lista, anadir, eliminar, marcar predeterminado.
- Ruta nueva en `ClienteStackParamList`: `MetodosPago`.

#### 2. Promociones y cupones
- Feature: `src/features/cliente/promociones/`.
- Service: `src/features/cliente/promociones/services/promotionsService.ts` con funciones `validateCoupon`, `listActivePromotions`.
- Store: `src/store/usePromotionsStore.ts` con cupones aplicados y descuentos.
- UI: input de codigo, lista de activos, badge en home (ya existe el placeholder "10% DCTO").

#### 3. Editor completo de direcciones favoritas
- Reusar `useFavoriteAddressesStore` existente.
- Nueva pantalla `FavoritasManager` con renombrar, reordenar (drag handle) y eliminar (swipe ya implementado).
- Si se requiere reordenar, instalar `react-native-draggable-flatlist`.

#### 4. Programar viaje
- Feature: `src/features/cliente/programar-viaje/`.
- Reusar `@react-native-community/datetimepicker` (ya instalado).
- Service: extender `taxiRequestService` con `scheduleRequest(date, request)`.
- Store: `useScheduledTripsStore` o agregar campo `scheduledFor?: Date` a `TaxiRequest`.

### Fase 2 - Personales

#### 5. Mi perfil
- Feature: `src/features/cliente/perfil/`.
- Pantalla con edicion de foto (`expo-image-picker` ya instalado), nombre, telefono, correo.
- Service: `userProfileService` con `getProfile`, `updateProfile`, `uploadAvatar`.
- Reusar `UserNetworkAvatar` para la foto.

#### 6. Notificaciones
- Pantalla simple con switches por tipo (push, email, SMS) y por categoria (viajes, promociones, seguridad).
- Store: `useNotificationPreferencesStore`.
- Persistencia con `expo-secure-store` (ya instalado).

#### 7. Idioma
- Instalar `i18next` + `react-i18next`.
- Estructura: `src/shared/i18n/` con archivos `es.json`, `en.json`, `qu.json`.
- Store: `useLocaleStore`.
- Aplicar a todas las pantallas existentes durante migracion gradual.

#### 8. Modo oscuro
- En `app.json` ya esta `userInterfaceStyle: light`. Cambiar a `automatic` o controlar manualmente.
- Crear `src/theme/colorsDark.ts` espejo de `src/theme/colors.ts`.
- Hook `useTheme` que devuelve set de colores segun preferencia.
- Toggle persistido en `useThemeStore`.

#### 9. Contactos de emergencia
- Feature: `src/features/cliente/contactos-emergencia/`.
- CRUD persistido localmente (`expo-secure-store`).
- Integrar con boton SOS en `TrayectoTaxiScreen`.

### Fase 3 - Fidelizacion

#### 10. Referidos
- Pantalla con codigo personal, link compartible (`Share` API de RN), historial de invitaciones.
- Service: `referralService.getReferralCode`, `getReferralStats`.

#### 11. Calificaciones recibidas
- Feature: `src/features/cliente/calificaciones/`.
- Reusar tipos `Rating`, `UserRating`.
- Pantalla con score promedio y lista de comentarios.

#### 12. Historial de auctions
- Feature: `src/features/cliente/auctions/historial/`.
- Service que lista las pujas pasadas con resultado y monto.

### Fase 4 - Cierre

#### 13. Terminos y condiciones
- Pantalla estatica con scroll. Contenido en `src/shared/legal/terminos.ts` o markdown.

#### 14. Politica de privacidad
- Misma estructura que terminos.

#### 15. Cerrar sesion
- Boton fijo al final del drawer, fuera del ScrollView.
- Llamar a `authService.logout()` y limpiar stores con `useStoreReset` (crear si no existe).
- Navegacion: reset al stack de auth.

#### 16. Version de la app
- Footer pequeno con `Constants.expoConfig.version` de `expo-constants` (instalar si falta).

## Cambios al drawer existente

`src/shared/components/drawer/ClienteDrawer.tsx`:

1. Convertir el array `OPCIONES` en una constante exportable tipada con `id` (string), `icon`, `label`, `route` y `section`.
2. Agrupar por seccion con headers visuales.
3. Anadir contenedor para el footer fijo (cerrar sesion + version).
4. Conectar `onSelectOpcion` directamente a navegacion en lugar de delegar al consumidor.

Sugerencia de tipo:

```ts
type DrawerSection = 'main' | 'wallet' | 'personal' | 'preferences' | 'trust' | 'legal';

interface DrawerOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: keyof ClienteStackParamList;
  section: DrawerSection;
}
```

## Tests requeridos

Por cada feature anadida:
- Hook con happy path, error y edge case.
- Store con sus acciones.
- Pantalla con render y eventos de usuario.

Actualizar `status_unit_test.md` siguiendo el formato existente.

## Dependencias a evaluar

- `react-native-draggable-flatlist` para reordenar favoritos.
- `i18next` y `react-i18next` para idiomas.
- `expo-constants` para version.
- `expo-sharing` o `Share` API para referidos.

## Orden recomendado de implementacion

1. Refactor del `ClienteDrawer` para soportar secciones, footer y rutas tipadas.
2. Cerrar sesion y version (rapido, alto impacto).
3. Mi perfil (base para validar el flujo de pantallas conectadas al drawer).
4. Metodos de pago (logica de negocio importante).
5. Promociones, programar viaje, contactos de emergencia.
6. Preferencias (notificaciones, idioma, modo oscuro).
7. Referidos, calificaciones, historial de auctions.
8. Terminos y privacidad.
