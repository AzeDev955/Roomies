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
    home.tsx              # Pantalla de Home
  styles/
    index.styles.ts       # Estilos de Login
    home.styles.ts        # Estilos de Home
```

## Convenciones

### Estilos modulares

Los estilos viven en `styles/` (fuera de `app/`), con el mismo nombre que la pantalla.
Expo Router trata todos los archivos de `app/` como rutas, por lo que los `.styles.ts`
no pueden estar dentro de esa carpeta.

```
app/MiPantalla.tsx              # Solo lógica y JSX
styles/MiPantalla.styles.ts     # Solo StyleSheet.create + export { styles }
```

El componente importa los estilos así:

```tsx
import { styles } from '../styles/MiPantalla.styles';
```

## Decisiones de arquitectura

| Decisión | Motivo |
|---|---|
| Expo Router (file-based routing) | Estándar moderno de Expo; rutas declarativas por nombre de archivo |
| Stack navigator sin tabs | MVP inicial: flujo lineal; tabs cuando haya secciones reales |
| `.styles.ts` adyacente al componente | Separación de responsabilidades; los componentes solo contienen lógica y JSX |
| `Pressable` en lugar de `Button` | Mayor control de estilos; `Button` nativo depende de la plataforma |
