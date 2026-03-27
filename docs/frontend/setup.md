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
    _layout.tsx           # Layout raíz (Stack navigator)
    index.tsx             # Pantalla de Login
    index.styles.ts       # Estilos de Login
    home.tsx              # Pantalla de Home
    home.styles.ts        # Estilos de Home
```

## Convenciones

### Estilos modulares

Todos los componentes y pantallas tienen sus estilos en un archivo `.styles.ts` adyacente.
Nunca se usa `StyleSheet.create` dentro del propio componente.

```
MiComponente.tsx          # Solo lógica y JSX
MiComponente.styles.ts    # Solo StyleSheet.create + export { styles }
```

El componente importa los estilos así:

```tsx
import { styles } from './MiComponente.styles';
```

## Decisiones de arquitectura

| Decisión | Motivo |
|---|---|
| Expo Router (file-based routing) | Estándar moderno de Expo; rutas declarativas por nombre de archivo |
| Stack navigator sin tabs | MVP inicial: flujo lineal; tabs cuando haya secciones reales |
| `.styles.ts` adyacente al componente | Separación de responsabilidades; los componentes solo contienen lógica y JSX |
| `Pressable` en lugar de `Button` | Mayor control de estilos; `Button` nativo depende de la plataforma |
