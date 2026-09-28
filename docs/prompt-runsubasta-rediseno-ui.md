# Prompt para agente — Rediseño UI/UX de RunSubasta (app del pasajero, React Native + Expo)

> Revisa las líneas marcadas **(confirmar)** antes de pasárselo al agente. Son supuestos míos a partir del código.

---

## Rol

Actúa como un desarrollador React Native senior con criterio de diseñador de producto. Vas a **rediseñar la capa visual de una app que ya existe**, no a crear una nueva. El objetivo es que RunSubasta se vea diseñada a propósito para quien pide un taxi en Lima, no como una plantilla ni como algo generado automáticamente.

## Contexto de la app

- **Nombre (confirmar):** RunSubasta. El repo se llama `Run_Driver`, el paquete `runsubasta` y la app "RunSubasta"; es la app del **pasajero** (también trae pantallas de conductor migradas de Flutter).
- **Repositorio:** https://github.com/VMichael1999/Run_Driver
- **Qué resuelve:** el pasajero elige origen y destino (con paradas extra), elige un servicio (Subasta, Confort, Premium, XL, Pet, Espera y Ahorra, XLCAB GO), paga en efectivo, Yape o Plin, y en **Subasta** propone su precio y recibe ofertas de conductores cercanos. Luego sigue al conductor, viaja, califica y gestiona favoritos, promociones, viajes programados y métodos de pago.
- **Usuario principal (confirmar):** pasajero en Lima que pide taxi desde la vereda, a veces apurado o de noche, y que quiere saber cuánto va a pagar antes de pedir y qué auto le va a recoger.
- **Personalidad de marca (confirmar):** directa, confiable, con algo de juego en la subasta.
- **Tipografía (NO cambiar):** General Sans, desde `assets/legacy/fonts`. No agregues Google Fonts ni otra familia.
- **Logo y colores:** el logo actual es `assets/icon.png` (negro con "Run" en blanco y la línea de carretera en lima, aprox. `#D4E838`), el mismo de la app del conductor Run Pilot. **La paleta debe partir de ese negro y ese lima** para que ambas apps se sientan de la misma familia. En `assets/legacy/images` queda un logo anterior ("run" en minúscula con escudo, sobre azul marino); no lo mezcles con el actual.
- **Ilustraciones existentes (reutilizar):** `assets/servicios/*.png` (autos por servicio), `assets/payment/*.png` (Efectivo, Yape, Plin), `assets/legacy/images/car_north|south|east|west.png` (marcador de auto en el mapa), `location_origen.png` y `location_destino.png`, `shield.png`, estilos de mapa en `assets/legacy/maps/`.
- **Lo que NO quiero (confirmar):** que parezca un clon de inDrive o Uber, textos en mayúsculas por todas partes.
- **Plataformas:** Android e iOS (Expo SDK 54).
- **Stack existente (NO cambiar):** React Navigation 7, Zustand, TanStack Query, `react-native-maps`, `StyleSheet` + `useAppTheme`, `expo-haptics`, `react-native-reanimated`, `react-native-gesture-handler`, `lottie-react-native`, `react-native-svg`, `@expo/vector-icons`.
- **Idioma de la UI:** español (Perú), montos como `S/ 24.00`, placas como `ABC-123`.

---

## Límites del trabajo

- Solo toca la **capa de presentación**: `src/theme`, `src/shared/components`, componentes y estilos de `src/features/**`, `App.tsx` (fuentes y splash), `app.json` (ícono, splash) y `assets`.
- **No cambies** stores, servicios, hooks de negocio (`useAuctionSimulation`, etc.), tipos de dominio ni navegación. Si una mejora de UX lo necesita, propónla y espera mi OK.
- **Antes de rediseñar `SolicitudTaxiScreen.tsx` (2,423 líneas)**, propón cómo dividirlo en componentes (lista de servicios, panel de subasta, ofertas, selector de pago) sin cambiar su comportamiento, y espera mi OK.
- **No introduzcas otra librería de estilos** (NativeWind, Tamagui, etc.) sin mi aprobación.
- No copies ni muevas claves de API a ningún archivo nuevo.
- `npx tsc --noEmit` sin errores nuevos y `npm run test:ci` en verde (ya hay tests).
- Trabaja en una rama nueva (`feat/redesign-ui`) con commits pequeños por pantalla.

---

## Diagnóstico actual (revisado en el código)

No pude ejecutar la app, así que esto sale del código. Toma capturas de cada pantalla en la Fase 0 y agrega lo que veas.

**Sistema visual**
1. La paleta es la misma de Run Pilot: azul marino `#001f3f`, tres azules casi iguales y los grises y estados por defecto de Tailwind. No tiene relación con el logo negro y lima que usa `app.json`.
2. Unas **244** apariciones de colores literales y **235** de `fontSize:` fuera de `src/theme`. Colores sueltos como la estrella `#f59e0b` en `DriverOfferCard`.
3. Solo se cargan General Sans Regular y Bold (más itálicas), aunque existen Medium y Semibold en `assets/legacy/fonts`.
4. Las ilustraciones de servicios usan autos blancos con vidrios azul marino y luces cian; hay que integrarlas con la paleta negro/lima sin redibujarlas (fondo, recorte, tamaño consistente).
5. Mientras cargan las fuentes, `App.tsx` devuelve `null` (pantalla en blanco). El splash de `app.json` tiene fondo blanco aunque el logo es negro.

**Datos que se ven en pantalla**
6. En la lista de servicios, cada opción usa el nombre del servicio como placa y como modelo ("PET", "SUBASTA"), todas tienen `driverName: 'Conductora'` y el mismo teléfono. "Premiun" está mal escrito (debe ser "Premium").
7. Las placas de la simulación de subasta tienen 4 dígitos (`ABC-1234`); en Perú el formato es de 6 caracteres (`ABC-123`).
8. Subasta aparece en la lista con un precio fijo (S/ 58.00), lo que contradice la idea de que el pasajero propone su precio.
9. `metodosPago.ts` incluye Tunki, pero no hay ícono de Tunki en `assets/payment`.

**Texto e idioma**
10. Faltan tildes: "numero", "Metodo de pago", "Ubicacion seleccionada", "Sabados", "VEHICULO".
11. Mayúsculas: "ELIGE UN VEHICULO", "CANCELAR SERVICIO", "CONFIRMAR", "RESERVAR", "10% DCTO".

**Accesibilidad**
12. **Cero** `accessibilityLabel` o `accessibilityRole` en 263 elementos tocables.

---

## Fase 0 — Preparación

1. **Skills de Expo:** instala el plugin oficial siguiendo https://docs.expo.dev/skills/ (para Claude Code: `claude plugin install expo@claude-plugins-official`; verifica el comando actual). Usa `expo-design-system`, `expo-native-ui` y `expo-animation`. **Ignora `expo-router`**: este proyecto usa React Navigation.
2. **Rendimiento:** instala `react-native-best-practices` de https://github.com/callstackincubator/agent-skills.
3. **Criterio visual:** lee el SKILL.md de `frontend-design` en https://github.com/anthropics/skills y tradúcelo a React Native.
4. Antes de instalar cualquier skill de terceros, lee su SKILL.md y sus scripts y dime en 3 líneas qué hacen. No ejecutes scripts sin mi OK.
5. Revisa con `npx expo install --check` que las versiones de los paquetes coincidan con el SDK 54 y dime qué no coincide **antes** de tocar nada. No actualices dependencias sin mi OK.
6. Toma capturas del estado actual de cada pantalla (claro y oscuro).

---

## Fase 1 — Dirección de diseño (espera mi aprobación)

1. Propón **2 o 3 direcciones** que partan del negro y el lima del logo y que se entiendan como "familia" con Run Pilot. Para cada una: nombre, justificación en 2 frases, paleta, cómo usarás la escala y pesos de General Sans, forma de componentes y carácter del motion. Deben funcionar sobre un mapa, de día y de noche.
2. **Detente y espera a que elija una.**
3. Con la elegida, rehaz `src/theme`:
   - Paleta clara y oscura con roles + colores **semánticos del dominio**: `origin`, `destination`, `auction` (subasta), `offer`, `driverArriving`, `onTrip`, `promo`, `danger` (SOS). El color comunica estado, nunca decoración.
   - El lima no se lee como texto sobre blanco: úsalo como relleno con texto oscuro en modo claro.
   - Tipografía: General Sans en Regular, Medium, Semibold y Bold, cada peso mapeado a su archivo. General Sans **no trae cifras tabulares** (no tiene `tnum`): para contadores y precios que cambian en vivo usa ancho mínimo fijo o alineación a la derecha.
   - Tokens de motion para Reanimated y escala de espaciado, radios y sombras.
   - Migra los 244 colores y 235 tamaños de fuente sueltos a tokens.
4. Splash con fondo negro y el logo actual, `expo-splash-screen` mientras cargan las fuentes.
5. Pantalla de **catálogo de componentes** solo en `__DEV__`.

---

## Fase 2 — Pantallas, en este orden

1. **Inicio del pasajero** (mapa + "¿A dónde vas?" + favoritos)
2. **Buscar dirección** y elegir en el mapa (con paradas extra)
3. **Elegir servicio** (lista con ilustraciones, precio, tiempo y método de pago)
4. **Subasta**: proponer precio → buscando conductores → ofertas → aceptar
5. **Conductor en camino** y **en viaje** (con SOS, chat y compartir viaje)
6. **Calificar conductor**
7. Métodos de pago, Promociones, Favoritas, Programar viaje, Perfil
8. Login, verificación por código y splash
9. Pantallas del conductor que viven en este repo (solo alinear al nuevo sistema)

### Reglas específicas para el pasajero
- **Precio antes de pedir:** cada servicio muestra precio y tiempo de llegada estimado en la misma línea. En Subasta se muestra "Tú propones" en vez de un precio fijo.
- **Subasta clara:** al proponer precio, muestra un rango sugerido y qué pasa si ofreces muy bajo. Las ofertas llegan como tarjetas con conductor, auto, placa, calificación, tiempo de llegada y precio, cada una con su tiempo restante visible. Aceptar una oferta es una acción explícita.
- **Identificar el auto:** cuando el conductor viene en camino, la **placa** y el modelo/color van grandes; es lo que el pasajero busca en la calle.
- **Seguridad:** SOS y "Compartir viaje" visibles durante el viaje, SOS sin activación accidental.
- **Estados de cada pantalla con datos:** cargando (skeleton), vacío (mensaje útil + acción), error (qué pasó + reintentar), éxito.
- **Contenido realista en español de Perú:** direcciones de Lima, montos en soles, placas de 6 caracteres. Corrige tildes y "Premiun".
- **Microcopy** en oración normal, no en mayúsculas: "Pedir Confort · S/ 35.00", "Buscar conductores", "Cancelar viaje".
- **Accesibilidad:** `accessibilityRole` y `accessibilityLabel` en todo lo tocable; contraste ≥ 4.5:1; objetivos ≥ 48×48 dp; la UI no se rompe con texto al 150 %.

### Motion con propósito (Reanimated)
- Reemplaza la API `Animated` y `LayoutAnimation` por Reanimated donde convenga (layout animations para tarjetas que entran y salen).
- Ofertas de la subasta: entran una por una desde abajo, con una barra de tiempo restante que se vacía; al vencer salen con un fade corto.
- Búsqueda de conductores: puedes usar el `ripple_lottie.json` que ya existe, una sola vez y sin textos dentro del Lottie.
- Respeta `useReducedMotion()`.

### Checklist anti "hecho por IA"
- Nada de paleta Tailwind por defecto, ni azules que no vienen del logo.
- Nada de mayúsculas con letter-spacing en títulos y botones, ni badges tipo "10% DCTO" en todas partes.
- Un solo set de íconos y un solo logo.
- Ilustraciones de servicios con el mismo tamaño, recorte y fondo en toda la app.
- Cualquier decisión que no puedas justificar con el pasajero descrito arriba.

---

## Fase 3 — Verificación (por pantalla)

1. `npx tsc --noEmit` sin errores nuevos y `npm run test:ci` en verde.
2. Capturas antes/después en claro y oscuro, y con texto al 150 %.
3. Revisa uno por uno los 12 puntos del diagnóstico y dime cuáles quedan resueltos y cuáles no.
4. Dime explícitamente **qué no cumple todavía**.
5. Actualiza `status_unit_test.md` y `MIGRATION_CHECKLIST.md`.

---

## Cómo trabajamos

- Pantalla por pantalla. Al terminar cada una: capturas + 3-5 líneas con las decisiones de diseño y por qué.
- Si una instrucción mía contradice buenas prácticas de UX, seguridad o accesibilidad, dímelo antes.
- Si te falta información de producto, pregunta en vez de inventar.
