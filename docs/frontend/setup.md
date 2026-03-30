# Setup — Frontend Roomies

## Requisitos

- Node.js 20+
- Expo Go en el móvil (iOS / Android), o un emulador Android/iOS

## Variables de entorno

El frontend lee la URL de la API a través de la variable `EXPO_PUBLIC_API_URL`.

Crea un archivo `frontend/.env` (no lo subas al repositorio):

```env
EXPO_PUBLIC_API_URL=http://192.168.1.X:3001/api
```

> Sustituye la IP por la de tu máquina en la red Wi-Fi local (`ipconfig` → IPv4 del adaptador Wi-Fi).
> Si usas Docker Compose, esta variable se inyecta automáticamente desde el `.env` de la raíz del repo.
> Si arrancas sin Docker (solo nodemon), apunta a `http://localhost:3000/api`.

## Instalación y arranque

### Desarrollo local (sin Docker)

```bash
cd frontend
npm install
npx expo start
```

Escanea el QR con Expo Go o pulsa `a` (Android) / `i` (iOS) para abrir el emulador.

### Con Docker Compose (recomendado)

Desde la raíz del repositorio:

```bash
docker-compose up --build
```

El servicio `frontend` arranca en el puerto `8081`. Metro Bundler anuncia la IP configurada en `HOST_IP` del `.env` raíz para que Expo Go en el móvil pueda conectar.

## Estructura de la app

```
frontend/
  app/
    _layout.tsx                               # Layout raíz (Stack navigator sin header)
    index.tsx                                 # Pantalla de Login — JWT real via api.ts
    home.tsx                                  # Pantalla de Home — selector de rol
    casero/
      viviendas.tsx                           # Lista de viviendas del casero (GET /viviendas)
      nueva-vivienda.tsx                      # Formulario crear vivienda (POST /viviendas)
      vivienda/
        [id].tsx                              # Detalle: habitaciones + auth biométrica (GET /viviendas/:id)
        [id]/
          nueva-habitacion.tsx                # Formulario crear habitación (POST /viviendas/:id/habitaciones)
    inquilino/
      inicio.tsx                              # Onboarding (canjear código) + Dashboard (GET /incidencias)
      nueva-incidencia.tsx                    # Formulario nueva incidencia (POST /incidencias)
  services/
    api.ts                                    # Instancia Axios centralizada con interceptor JWT
    auth.service.ts                           # guardarToken / obtenerToken / eliminarToken (SecureStore)
  styles/
    index.styles.ts                           # Estilos de Login
    home.styles.ts                            # Estilos de Home
    casero/
      viviendas.styles.ts
      nueva-vivienda.styles.ts
      vivienda/
        detalle.styles.ts                     # Estilos del detalle (no [id].styles.ts — evita brackets)
        nueva-habitacion.styles.ts
    inquilino/
      inicio.styles.ts                        # Estilos + COLORES_PRIORIDAD + ETIQUETAS_ESTADO
      nueva-incidencia.styles.ts              # Estilos + COLORES_PRIORIDAD + ETIQUETAS_PRIORIDAD
  constants/
    theme.ts                                  # Colores globales
```

## Pantallas implementadas

| Ruta | Archivo | Datos |
|---|---|---|
| `/` | `app/index.tsx` | POST `/auth/login` → JWT guardado en SecureStore |
| `/home` | `app/home.tsx` | Estático — selector de rol |
| `/casero/viviendas` | `app/casero/viviendas.tsx` | GET `/viviendas` — lista real |
| `/casero/nueva-vivienda` | `app/casero/nueva-vivienda.tsx` | POST `/viviendas` |
| `/casero/vivienda/:id` | `app/casero/vivienda/[id].tsx` | GET `/viviendas/:id` — detalle real + biometría |
| `/casero/vivienda/:id/nueva-habitacion` | `app/casero/vivienda/[id]/nueva-habitacion.tsx` | POST `/viviendas/:id/habitaciones` |
| `/inquilino/inicio` | `app/inquilino/inicio.tsx` | POST `/inquilino/unirse` + GET `/incidencias` |
| `/inquilino/nueva-incidencia` | `app/inquilino/nueva-incidencia.tsx` | POST `/incidencias` |

## Arquitectura de autenticación

### Flujo

1. Login en `/` → `POST /auth/login` → recibe `token` JWT
2. `guardarToken(token)` lo persiste en `expo-secure-store`
3. Todas las peticiones a rutas protegidas llevan `Authorization: Bearer <token>` inyectado automáticamente por el interceptor de `services/api.ts`

### Interceptor Axios (`services/api.ts`)

```typescript
api.interceptors.request.use(async (config) => {
  const token = await obtenerToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Códigos de invitación (biometría)

La pantalla de detalle de vivienda protege los códigos de invitación con `expo-local-authentication`. Cada habitación tiene su propio estado de revelado — revelar un código no afecta al resto.

```tsx
const revelarCodigo = async (habitacionId: number) => {
  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Autentícate para ver el código de invitación',
  });
  if (resultado.success) {
    setCodigosRevelados((prev) => ({ ...prev, [habitacionId]: true }));
  }
};
```

## Convenciones

### Estilos modulares

Los estilos viven en `styles/` (fuera de `app/`), espejando la misma estructura de carpetas. Expo Router trata **todos** los archivos de `app/` como rutas, por lo que los `.styles.ts` no pueden estar dentro de esa carpeta.

```
app/casero/vivienda/[id].tsx              # Solo lógica y JSX
styles/casero/vivienda/detalle.styles.ts  # Solo StyleSheet.create + export { styles }
```

> El archivo de estilos de `[id].tsx` se llama `detalle.styles.ts` (no `[id].styles.ts`) para evitar problemas con los brackets en nombres de archivo. El de `[id]/nueva-habitacion.tsx` está en `styles/casero/vivienda/nueva-habitacion.styles.ts`.

### Alias `@/`

Las pantallas en rutas anidadas usan el alias `@/` para importar sin rutas relativas largas:

```tsx
import { styles } from '@/styles/casero/vivienda/detalle.styles';
import api from '@/services/api';
```

`@/` apunta a la raíz de `frontend/` y está configurado en `tsconfig.json`.

### Recarga automática con `useFocusEffect`

Las pantallas que listan datos (viviendas, detalle de vivienda, incidencias) usan `useFocusEffect` + `useCallback` para recargar al volver de una pantalla de formulario, sin necesidad de prop drilling ni contexto global.

```tsx
useFocusEffect(
  useCallback(() => {
    cargarDatos();
  }, [id])
);
```

## Decisiones de arquitectura

| Decisión | Motivo |
|---|---|
| Expo Router (file-based routing) | Estándar moderno de Expo; rutas declarativas por nombre de archivo |
| Stack navigator sin tabs | MVP inicial: flujo lineal; tabs cuando haya secciones reales |
| `styles/` fuera de `app/` | Expo Router trata todo `app/` como rutas — los `.styles.ts` causarían warnings |
| `@/` alias para imports | Evita `../../../../` en rutas anidadas |
| `Pressable` en lugar de `Button` | Mayor control de estilos; `Button` nativo depende de la plataforma |
| `expo-secure-store` para el JWT | Almacenamiento seguro en el dispositivo; más seguro que AsyncStorage |
| Instancia Axios centralizada | Un único punto de configuración del interceptor JWT; todas las pantallas la importan igual |
| `useFocusEffect` en lugar de `useEffect` | Recarga datos al volver de pantallas de formulario sin estados globales |
| Auth biométrica por habitación | Estado `Record<number, boolean>` independiente por ID — un código revelado no afecta al resto |
