# Checklist de Migración — Flutter → React Native Expo

> **Aclaración**: Todos los datos son en duro (dummy data), igual que en el proyecto legacy Flutter.  
> No hay integración con backend real. Los datos se definen como constantes locales en cada feature.

---

## Progreso general: ~40% migrado

---

## ✅ Ya migrado

### Navegación y estructura
- [x] RootNavigator (Auth / Cliente / Conductor)
- [x] AuthNavigator (Login → OTP)
- [x] ClienteNavigator (stack de pantallas cliente)
- [x] ConductorNavigator (tabs + stack conductor)
- [x] Tipos tipados para todas las rutas

### Theme
- [x] Colores (`colors.ts`) — mismo palette que Flutter
- [x] Fuentes (`fonts.ts`) — GeneralSans
- [x] Espaciado, bordes, sombras (`spacing.ts`)

### Store (Zustand)
- [x] `useAuthStore` — teléfono, rol, token, logout
- [x] `useThemeStore` — modo oscuro
- [x] `useTaxiStore` — flujo de viaje (idle → searching → in_trip)

### Modelos / Tipos TypeScript
- [x] `LocationMarker`, `Coordinates`
- [x] `PaymentMethod`, `PaymentMode`
- [x] `DriverAlert`, `PassengerAlert`
- [x] `TaxiRequest`, `TaxiTrip`
- [x] `ChatMessage`
- [x] `Rating`, `UserRating`, `RatingAspect`
- [x] `Option`, `CountryOption`, `VerificationOption`
- [x] `UserRole`

### Pantallas (estructura base)
- [x] `SplashScreen` — logo animado, redirige a Auth
- [x] `LoginScreen` — input teléfono, selector país, checkbox términos
- [x] `LoginVerificacionScreen` — OTP 4 dígitos
- [x] `ClienteHomeScreen` — mapa base, panel inferior básico
- [x] `SolicitudTaxiScreen` — lista de ofertas de conductores (dummy)
- [x] `TrayectoTaxiScreen` — mapa de viaje activo, botón SOS, panel conductor
- [x] `ConductorHomeScreen` — mapa con badge de estado
- [x] `SolicitudesScreen` — lista de solicitudes de pasajeros (dummy)
- [x] `SolicitudesDetalleScreen` — detalle con input de oferta
- [x] `SolicitudesTrayectoScreen` — pasajero en camino, botón "Llegué"
- [x] `VerificacionScreen` — lista de pasos con barra de progreso
- [x] `CuentaScreen` — menú de perfil con logout
- [x] `ExperienciaScreen` — calificaciones promedio + lista
- [x] `IngresosScreen` — resumen de ingresos por período
- [x] `ChatScreen` — burbujas de mensajes + input
- [x] `HistorialViajeScreen` — lista de viajes pasados (dummy)
- [x] `ConfiguracionScreen` — switch de modo oscuro

### Shared components
- [x] `RoundedButton` — variantes: primary / outline / ghost, loading state
- [x] `BackAppBar` — botón back + título opcional
- [x] `RatingCard` — tarjeta de calificación de usuario

### Utilidades
- [x] `mapUtils` — calculateDistance, calculateBearing, formatDistance, formatEta
- [x] `dateUtils` — formatDate, formatTime, formatRelativeTime

### Tests
- [x] `mapUtils.test.ts` — 4 tests pasando
- [x] `useTaxiStore.test.ts` — 4 tests pasando
- [x] `useLogin.test.ts` — 5 tests (escritos, pendiente ejecutar)
- [x] `useOtpVerification.test.ts` — 4 tests (escritos, pendiente ejecutar)
- [x] `status_unit_test.md` — tracker activo

---

## 🔲 Pendiente de migrar

### 1. Pantallas — contenido interno completo

#### Auth
- [ ] `LoginScreen` — selector de país con banderas (PaisBottomSheet)
  - Datos en duro: lista de 249 países con código y nombre
- [ ] `LoginScreen` — tarjeta de términos y políticas con links

#### Cliente Home — widgets faltantes
- [ ] Panel deslizante (`SlidingUpPanel`) con origen/destino
- [ ] `BuscarLugar` — bottom sheet de búsqueda de dirección (datos dummy: lista de lugares)
- [ ] `BuscarPin` — selector de ubicación con pin en mapa
- [ ] `AgregarComentario` — bottom sheet para añadir nota al viaje
- [ ] `AgregarMetodoPago` — bottom sheet selector de método de pago
  - Datos en duro: Efectivo, Yape, Plin, Tunki
- [ ] `TipoSolicitudCard` — selector de tipo: Estándar, Familiar, Deluxe
  - Datos en duro: 3 tipos de servicio con icono y descripción

#### Solicitud Taxi — widgets faltantes
- [ ] `AlertaTaxiCard` — tarjeta de oferta con precio editable (+/- botones)
- [ ] `PinRipple` — animación de ping mientras se busca conductor

#### Trayecto Taxi — widgets faltantes
- [ ] `SosCard` — tarjeta SOS expandida (llamar, compartir ubicación)
- [ ] `PlacaTaxi` — display de placa del vehículo
- [ ] Dialog de calificación al finalizar viaje
  - Datos en duro: aspectos de calificación (puntualidad, amabilidad, etc.)

#### Conductor Solicitudes — widgets faltantes
- [ ] `AlertaPasajeroCard` — tarjeta de pasajero con imagen, rating, ruta
- [ ] `CargandoText` — animación de puntos "esperando solicitudes…"
- [ ] `EditarMontoPago` — bottom sheet para editar monto de oferta
- [ ] `PasajeroEnCaminoCard` — tarjeta de confirmación de recogida

#### Chat — widgets faltantes
- [ ] `UserInfoCard` — cabecera del chat con avatar y nombre de usuario
- [ ] `MensajeCard` — burbuja de mensaje con estado leído/no leído (reemplazado por inline)

---

### 2. Pantallas de Verificación de Conductor (8 pantallas vacías)

Todas con datos en duro (formularios sin API).

- [ ] `VerificacionInformacionBasicaScreen`
  - Datos: nombre, apellido, fecha nacimiento, género (dummy picker)
- [ ] `VerificacionFotoConductorScreen`
  - Datos: captura con `expo-image-picker`
- [ ] `VerificacionDocumentoIdentificacionScreen`
  - Datos: número de documento, fotos frontal/trasera
- [ ] `VerificacionLicenciaConducirScreen`
  - Datos: número de licencia, categoría, vencimiento, foto
- [ ] `VerificacionSoatScreen`
  - Datos: número de póliza, aseguradora, vencimiento, foto
- [ ] `VerificacionVehiculoScreen`
  - Datos: marca, modelo, año, color, placa, foto
- [ ] `VerificacionAntecedentesPoliciales`
  - Datos: subida de documento PDF/foto
- [ ] `VerificacionContactoEmergencia`
  - Datos: nombre, teléfono, relación

---

### 3. Shared Components faltantes

- [ ] `CircleButton` — botón circular (usado en mapa para centrar ubicación)
- [ ] `SquareButton` — botón cuadrado con icono
- [ ] `TimeoutButton` — botón con contador regresivo (para expiración de ofertas)
  - Datos en duro: tiempo límite de 30 segundos por oferta
- [ ] `ExpandedCard` — tarjeta colapsable/expandible
- [ ] `ModosPagoCard` — tarjeta de selección de método de pago
- [ ] `CalificacionCard` — dialog/modal de calificación con estrellas
- [ ] `VerificacionApoyoConductorCard` — tarjeta de estado de verificación
- [ ] `UserNetworkAvatar` — avatar circular con imagen de red + fallback
- [ ] `ClienteDrawer` — drawer lateral del cliente (historial, configuración, logout)
- [ ] `ConductorDrawer` — drawer lateral del conductor
- [ ] `TextFormFieldCustom` — input personalizado con estilo unificado
- [ ] `SimpleDatePicker` — selector de fecha (para verificación)
- [ ] `SimpleYearPicker` — selector de año (para licencia/SOAT)
- [ ] `IconText` — ícono + label alineados horizontalmente
- [ ] `MapaCargandoText` — texto animado "Cargando mapa…"

---

### 4. Utilidades faltantes

- [ ] `audioUtils.ts` — reproducir sonido de notificación al recibir oferta
  - Usa `expo-av` (ya instalado)
  - Datos: archivo de sonido `long_pop.wav`
- [ ] `vibrationUtils.ts` — vibración al recibir solicitud/oferta
  - Usa `expo-haptics` (ya instalado)
- [ ] `colorUtils.ts` — manipulación de colores (aclarar/oscurecer)
- [ ] `imageUtils.ts` — selección y conversión de imágenes
  - Usa `expo-image-picker` (ya instalado)
- [ ] `launchUtils.ts` — abrir Google Maps / Waze con coordenadas
  - Usa `Linking` de React Native
- [ ] `platformUtils.ts` — detección de modo oscuro del sistema

---

### 5. Datos dummy faltantes (equivalentes a `lib/data/local/`)

- [ ] `src/data/metodosPago.ts` — lista de métodos de pago con iconos
  ```ts
  // Datos en duro: Efectivo, Yape, Plin, Tunki
  ```
- [ ] `src/data/rutasDummy.ts` — puntos de ruta (LatLng) para simular trayecto en mapa
  ```ts
  // Datos en duro: arreglo de Coordinates[] para trazar Polyline
  ```
- [ ] `src/data/paises.ts` — lista de 249 países con código telefónico y nombre
  ```ts
  // Datos en duro: misma lista que pais_opcion.dart
  ```
- [ ] `src/data/tiposSolicitud.ts` — tipos de servicio de taxi
  ```ts
  // Datos en duro: Estándar, Familiar, Deluxe con descripción
  ```
- [ ] `src/data/aspectosCalificacion.ts` — aspectos para calificar conductor/pasajero
  ```ts
  // Datos en duro: puntualidad, amabilidad, limpieza, etc.
  ```

---

### 6. Transiciones de navegación personalizadas

- [ ] Transición Fade (slide-in suave entre pantallas)
- [ ] Transición Left/Right (slide horizontal)
- [ ] Transición Upper/Down (slide vertical para bottom sheets)
  - En RN se configura en `screenOptions` de React Navigation con `animation`

---

### 7. Mapa — funcionalidades avanzadas

- [ ] Estilo de mapa oscuro (`app_map_style.dart` equivalente en JSON)
- [ ] Polyline animada sobre la ruta activa
- [ ] Marcador de conductor en movimiento (interpolación de posición)
- [ ] Zoom automático para encuadrar origen + destino

---

### 8. Tests pendientes de escribir

| Feature | Hook/Util | Casos a cubrir |
|---------|-----------|----------------|
| cliente | `useClienteHome` | setOrigin, setDestination, canRequest, requestTaxi |
| chat | `useChat` | sendMessage, draft vacío, acumula mensajes |
| conductor | `useSolicitudes` | selectSolicitud, loading state |
| shared | `dateUtils` | formatDate, formatTime, formatRelativeTime |
| store | `useAuthStore` | setPhone, setAuthenticated, logout |
| store | `useThemeStore` | toggleTheme |

---

## Orden sugerido de implementación

1. **Datos dummy** (`src/data/`) — desbloquea el resto
2. **Shared components** básicos (DatePicker, Drawer, Avatar)
3. **Cliente Home** — widgets del panel (buscar lugar, método de pago, tipo servicio)
4. **Solicitud Taxi** — AlertaTaxiCard con precio editable + TimeoutButton
5. **Trayecto** — SosCard, calificación al finalizar
6. **Verificación** — 8 pantallas de formulario
7. **Conductor** — widgets de solicitudes y edición de oferta
8. **Utilidades** (audio, vibración, launch maps)
9. **Transiciones** y mapa avanzado
10. **Tests** — completar suites pendientes
