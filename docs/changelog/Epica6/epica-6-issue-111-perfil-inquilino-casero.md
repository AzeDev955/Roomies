# Épica 6 — Issue #111: Perfil de Inquilino en Vista de Casero

**Fecha:** 2026-04-02 (actualizado 2026-04-03)  
**Rama:** dev  
**Archivos modificados:** 5 (+1 actualización)

---

## Resumen

Permite al casero acceder al perfil de contacto de sus inquilinos pulsando sobre la fila del inquilino en el tab "Resumen" de cada vivienda. Añade un endpoint protegido en el backend y una pantalla de detalle en el frontend con avatar, datos de contacto y acceso directo al correo.

---

## Cambios por área

### Backend

#### `backend/src/controllers/inquilino.controller.ts`

Nueva función `obtenerPerfilInquilino`:

- Recibe el ID del usuario por `req.params.id`
- Busca una `Habitacion` donde `inquilino_id = id` AND `vivienda.casero_id = req.usuario.id`
- Si no existe → 403 (el casero no tiene acceso a ese usuario)
- Devuelve: `id`, `nombre`, `apellidos`, `email`, `telefono`, `habitacion { id, nombre }`, `vivienda { id, alias_nombre }`

**Seguridad:** la validación de propiedad se realiza en la propia query Prisma — el casero solo puede ver el perfil de inquilinos que viven en sus viviendas. No hay endpoint que liste todos los usuarios.

#### `backend/src/routes/inquilino.routes.ts`

Añadida al final:
```
GET /inquilino/:id/perfil  →  verificarToken  →  obtenerPerfilInquilino
```

Sin conflicto con las rutas estáticas existentes (`/unirse`, `/vivienda`, `/habitacion`): el patrón `/:id/perfil` requiere dos segmentos, mientras las rutas estáticas tienen solo uno.

---

### Frontend

#### `app/casero/inquilino/[id].tsx` (nuevo)

Pantalla Stack estándar fuera del grupo `(tabs)`. Usa `<Stack.Screen>` dentro del componente para habilitar el header nativo con botón `←` sin modificar `casero/_layout.tsx`.

**Estructura visual:**
- Avatar circular 80px con fondo `Theme.colors.primary` e iniciales del inquilino en blanco
- Nombre completo en `heading` y subtítulo con habitación y vivienda en `textSecondary`
- `<Card>` con sección "Datos de contacto": email siempre visible, teléfono solo si `!= null`
- `<CustomButton variant="outline">` "Enviar Email" → `Linking.openURL(mailto:...)`
- `<CustomButton variant="outline">` "Llamar" → `Linking.openURL(tel:...)` — solo si `perfil.telefono !== null`

**Lógica:** `GET /inquilino/:id/perfil`, `LoadingScreen` mientras carga.

#### `styles/casero/inquilino/perfil.styles.ts` (nuevo)

Estilos modulares: `avatar`, `avatarTexto`, `nombre`, `subtitulo`, `card`, `cardTitulo`, `fila`, `filaTexto`, `separador`, `botonEmail`.

#### `app/casero/vivienda/[id]/(tabs)/index.tsx`

La `View` con `styles.inquilinoTextos` (nombre + email) se convierte en `Pressable` con:
- `onPress` → `router.push('/casero/inquilino/${id}')`
- `pressed && styles.enlacePressed` (opacidad 0.6, estilo ya existente en `detalle.styles.ts`)
- El botón "Expulsar" permanece independiente — no se ve afectado

---

## Decisiones técnicas

- **Endpoint en `/inquilino/:id/perfil` en lugar de `/usuarios/:id`**: mantiene la cohesión del dominio — es un endpoint de contexto del casero sobre sus inquilinos, no un endpoint de perfil público genérico.
- **Validación de propiedad vía Prisma nested where**: más eficiente que dos queries separadas (buscar habitacion + verificar vivienda). Una sola query con `vivienda: { casero_id: req.usuario.id }` garantiza la autorización.
- **`<Stack.Screen>` dentro del componente**: Expo Router permite sobreescribir opciones de pantalla desde el componente. Evita modificar `casero/_layout.tsx` para un caso específico.
- **Iniciales del avatar**: `nombre[0] + (apellidos?.[0] ?? '')` — nunca lanza error aunque `apellidos` sea null.
- **Teléfono condicional**: si `telefono` es null, la fila completa (icono + separador) no se renderiza.
- **Botón "Llamar" condicional**: el mismo guard `perfil.telefono &&` cubre el `<CustomButton>` de llamada — renderizado coherente con la fila de datos.
