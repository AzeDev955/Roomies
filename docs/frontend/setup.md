# Setup — Frontend Roomies

## Requisitos

- Node.js 20+
- Expo Go en el móvil, o un emulador Android/iOS

## Instalación

```bash
cd frontend
npm install
```

## Arrancar en desarrollo

```bash
npx expo start
```

Escanea el QR con Expo Go o pulsa `a` (Android) / `i` (iOS) para abrir el emulador.

## Estructura de la app

```
frontend/
  app/
    _layout.tsx                      # Layout raíz (Stack navigator sin header)
    index.tsx                        # Pantalla de Login (placeholder)
    home.tsx                         # Pantalla de Home — botón "Mis Viviendas"
    casero/
      viviendas.tsx                  # Lista de viviendas del casero (mock data + FAB)
      vivienda/
        [id].tsx                     # Detalle de vivienda: habitaciones + auth biométrica
  styles/
    index.styles.ts                  # Estilos de Login
    home.styles.ts                   # Estilos de Home
    casero/
      viviendas.styles.ts            # Estilos de la lista de viviendas
      vivienda/
        detalle.styles.ts            # Estilos del detalle (no [id].styles.ts — evita brackets)
```

## Convenciones

### Estilos modulares

Los estilos viven en `styles/` (fuera de `app/`), espejando la misma estructura de carpetas.
Expo Router trata **todos** los archivos de `app/` como rutas, por lo que los `.styles.ts`
no pueden estar dentro de esa carpeta.

```
app/casero/vivienda/[id].tsx              # Solo lógica y JSX
styles/casero/vivienda/detalle.styles.ts  # Solo StyleSheet.create + export { styles }
```

> El archivo de estilos de `[id].tsx` se llama `detalle.styles.ts` (no `[id].styles.ts`) para evitar
> problemas con los brackets en nombres de archivo.

### Alias `@/`

Las pantallas en rutas anidadas (e.g. `app/casero/vivienda/[id].tsx`) usan el alias `@/`
para importar estilos sin rutas relativas largas:

```tsx
import { styles } from '@/styles/casero/vivienda/detalle.styles';
```

`@/` apunta a la raíz de `frontend/` y está configurado en `tsconfig.json`.

### Autenticación biométrica

La pantalla de detalle de vivienda usa `expo-local-authentication` para proteger los
códigos de invitación. Cada habitación tiene su propio estado de revelado independiente
(estado `Record<number, boolean>`), de modo que revelar un código no afecta a los demás.

```tsx
import * as LocalAuthentication from 'expo-local-authentication';

const revelarCodigo = async (habitacionId: number) => {
  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Autentícate para ver el código de invitación',
  });
  if (resultado.success) {
    setCodigosRevelados((prev) => ({ ...prev, [habitacionId]: true }));
  }
};
```

## Pantallas implementadas

| Ruta | Archivo | Descripción |
|---|---|---|
| `/` | `app/index.tsx` | Login (placeholder — navega a `/home`) |
| `/home` | `app/home.tsx` | Home — botón "Mis Viviendas" |
| `/casero/viviendas` | `app/casero/viviendas.tsx` | Lista de viviendas con FAB |
| `/casero/vivienda/:id` | `app/casero/vivienda/[id].tsx` | Detalle con habitaciones y códigos biométricos |

> Las pantallas de detalle e lista usan **mock data** mientras no se integre la API.

## Decisiones de arquitectura

| Decisión | Motivo |
|---|---|
| Expo Router (file-based routing) | Estándar moderno de Expo; rutas declarativas por nombre de archivo |
| Stack navigator sin tabs | MVP inicial: flujo lineal; tabs cuando haya secciones reales |
| `styles/` fuera de `app/` | Expo Router trata todo `app/` como rutas — los `.styles.ts` causarían warnings |
| `@/` alias para imports | Evita `../../../../` en rutas anidadas |
| `Pressable` en lugar de `Button` | Mayor control de estilos; `Button` nativo depende de la plataforma |
| Auth biométrica por habitación | Estado independiente por ID — revelar un código no afecta al resto |
