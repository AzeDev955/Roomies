# Épica 1 — Issue #8: Configurar proyecto base de React Native (Expo)

## Qué se hizo

- Proyecto Expo creado con `create-expo-app@latest` (Expo SDK 52, Expo Router 6, TypeScript)
- Limpieza del template por defecto: eliminados la navegación por tabs de ejemplo y `modal.tsx`
- Configuración de Stack navigator puro en `app/_layout.tsx` (sin header global)
- Pantalla de Login (`app/index.tsx`) con texto "Pantalla de Login" y botón que navega a `/home`
- Pantalla de Home (`app/home.tsx`) con texto "Bienvenido a Roomies - Home" y botón para volver atrás
- Adopción del estándar de **estilos modulares**: los estilos de cada pantalla viven en su propio `.styles.ts` adyacente, nunca inline en el componente

## Archivos creados / modificados

| Acción | Archivo |
|---|---|
| Generado | `frontend/` — proyecto completo por `create-expo-app` |
| Modificado | `frontend/app/_layout.tsx` — Stack sin header |
| Nuevo | `frontend/app/index.tsx` — pantalla Login |
| Nuevo | `frontend/app/index.styles.ts` — estilos Login |
| Nuevo | `frontend/app/home.tsx` — pantalla Home |
| Nuevo | `frontend/app/home.styles.ts` — estilos Home |
| Modificado | `frontend/README.md` — descripción, setup y estándar de estilos |

## Decisiones técnicas

| Decisión | Motivo |
|---|---|
| Expo Router (file-based routing) | Estándar moderno de Expo; rutas declarativas por nombre de archivo |
| Stack navigator sin tabs | MVP inicial: flujo lineal Login → Home; tabs cuando haya más secciones reales |
| `.styles.ts` adyacente al componente | Separación de responsabilidades; los componentes solo contienen lógica y JSX |
| `Pressable` en lugar de `Button` | Mayor control de estilos; `Button` nativo tiene estilo dependiente de plataforma |

## Cómo verificar

```bash
cd frontend
npx expo start
```

1. Abrir en Expo Go o emulador → aparece "Pantalla de Login"
2. Pulsar "Ir a Home" → navega a "Bienvenido a Roomies - Home"
3. Pulsar "Volver" → regresa a Login
