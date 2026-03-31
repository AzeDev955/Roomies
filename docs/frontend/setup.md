# Setup — Frontend Roomies

## Requisitos

- Node.js 20+
- Expo Go en el móvil (iOS / Android), o un emulador Android/iOS

## Variables de entorno

Crea un archivo `frontend/.env` (no lo subas al repositorio):

```env
EXPO_PUBLIC_API_URL=http://192.168.1.X:3001/api
EXPO_PUBLIC_MAPBOX_TOKEN=<tu_token_mapbox>
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<web_client_id>
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<android_client_id>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<ios_client_id>
```

> `EXPO_PUBLIC_API_URL`: IP de tu máquina en la red Wi-Fi local (`ipconfig` → IPv4 del adaptador Wi-Fi). Si arrancas sin Docker, apunta a `http://localhost:3000/api`.
> `EXPO_PUBLIC_MAPBOX_TOKEN`: necesario para el autocompletado de dirección en "Nueva vivienda".
> `EXPO_PUBLIC_GOOGLE_*`: IDs de credenciales OAuth 2.0 de Google Cloud Console. Ver sección [Autenticación Google OAuth](#autenticación-google-oauth).

Las variables `EXPO_PUBLIC_*` se hornean en el bundle en tiempo de compilación por Metro — un cambio requiere reiniciar Metro.

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
    index.tsx                                 # Pantalla de Login — email/password + Google OAuth
    registro.tsx                              # Pantalla de Registro — formulario completo + Google OAuth
    home.tsx                                  # Pantalla de Home — selector de rol
    perfil.tsx                                # Perfil del usuario + botón Cerrar Sesión
    casero/
      viviendas.tsx                           # Lista de viviendas del casero (GET /viviendas)
      nueva-vivienda.tsx                      # Formulario crear vivienda con habitaciones inline (POST /viviendas)
      vivienda/
        [id].tsx                              # Detalle: habitaciones + inquilinos + biometría + editar/eliminar
        [id]/
          nueva-habitacion.tsx                # Formulario crear habitación con autocompletado de nombre
          editar-habitacion.tsx               # Formulario editar habitación (PUT /viviendas/:id/habitaciones/:habId)
    inquilino/
      inicio.tsx                              # Onboarding (canjear código) + Dashboard completo (compañeros, zonas, incidencias)
      nueva-incidencia.tsx                    # Formulario nueva incidencia con selector de habitación
  services/
    api.ts                                    # Instancia Axios centralizada con interceptor JWT
    auth.service.ts                           # guardarToken / obtenerToken / eliminarToken (SecureStore)
  styles/
    index.styles.ts                           # Estilos de Login
    registro.styles.ts                        # Estilos de Registro
    home.styles.ts                            # Estilos de Home
    perfil.styles.ts                          # Estilos de Perfil
    casero/
      viviendas.styles.ts
      nueva-vivienda.styles.ts
      vivienda/
        detalle.styles.ts                     # Estilos del detalle (no [id].styles.ts — evita brackets)
        nueva-habitacion.styles.ts            # Reutilizado también por editar-habitacion.tsx
    inquilino/
      inicio.styles.ts                        # Estilos + COLORES_PRIORIDAD + ETIQUETAS_ESTADO + ETIQUETAS_TIPO
      nueva-incidencia.styles.ts              # Estilos + COLORES_PRIORIDAD + ETIQUETAS_PRIORIDAD
  constants/
    theme.ts                                  # Colores globales
```

## Pantallas implementadas

| Ruta | Archivo | Datos |
|---|---|---|
| `/` | `app/index.tsx` | POST `/auth/login` + Google OAuth → JWT en SecureStore |
| `/registro` | `app/registro.tsx` | POST `/auth/register` + Google OAuth |
| `/home` | `app/home.tsx` | Estático — selector de rol |
| `/perfil` | `app/perfil.tsx` | GET `/auth/me` — datos del usuario + logout |
| `/casero/viviendas` | `app/casero/viviendas.tsx` | GET `/viviendas` |
| `/casero/nueva-vivienda` | `app/casero/nueva-vivienda.tsx` | POST `/viviendas` con habitaciones inline + autocompletado Mapbox |
| `/casero/vivienda/:id` | `app/casero/vivienda/[id].tsx` | GET `/viviendas/:id` — inquilinos + biometría + editar/eliminar |
| `/casero/vivienda/:id/nueva-habitacion` | `app/casero/vivienda/[id]/nueva-habitacion.tsx` | POST `/viviendas/:id/habitaciones` + autocompletado nombre |
| `/casero/vivienda/:id/editar-habitacion` | `app/casero/vivienda/[id]/editar-habitacion.tsx` | PUT `/viviendas/:id/habitaciones/:habId` |
| `/inquilino/inicio` | `app/inquilino/inicio.tsx` | GET `/inquilino/vivienda` + GET `/incidencias` + onboarding |
| `/inquilino/nueva-incidencia` | `app/inquilino/nueva-incidencia.tsx` | POST `/incidencias` con selector de habitación filtrado |

## Arquitectura de autenticación

### Flujo email/password

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

### Autenticación Google OAuth

El flujo usa `expo-auth-session` en el frontend y `google-auth-library` en el backend:

1. El usuario pulsa "Continuar con Google" → `expo-auth-session` abre el navegador embebido
2. Google redirige de vuelta con un `idToken`
3. El frontend envía el `idToken` al backend (`POST /auth/google`)
4. El backend lo verifica con `OAuth2Client.verifyIdToken()` y devuelve el JWT propio de la app
5. El JWT se persiste igual que en el flujo email/password

**Configuración necesaria:**
- Credencial **Web** en Google Cloud Console (para backend + Expo Go) — añadir `https://auth.expo.io/@<usuario>/frontend` como URI de redirección autorizada
- Credencial **Android** (package `host.exp.exponent`, SHA-1 del debug keystore de Expo)
- Credencial **iOS** (bundle ID de la app)
- Copiar los Client IDs en `frontend/.env` y el Web Client ID en `backend/.env` (`GOOGLE_CLIENT_ID`)

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

Al copiar un código al portapapeles se elimina el prefijo `ROOM-` automáticamente — el inquilino solo pega la parte alfanumérica (`XXXXXX`) en el campo de canje.

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
| Google OAuth via backend verification | El `idToken` siempre se verifica en el servidor con `google-auth-library` — el frontend nunca decide si un token de Google es válido |
| Autocompletado de nombre de habitación | Mejora de UX: nombres canónicos (Baño, Cocina, Salón) al seleccionar el tipo; el campo sigue siendo editable |
| Prefijo `ROOM-` eliminado al copiar | Los códigos se almacenan con prefijo en la BD pero el inquilino solo pega la parte alfanumérica — la limpieza ocurre en el cliente |
