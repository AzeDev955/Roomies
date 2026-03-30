# Épica 6 — Issue #52: Inquilino canjea código conectando con endpoint real

## Qué se hizo

- Pantalla `app/inquilino/inicio.tsx` conectada a `POST /api/inquilino/unirse`
- Estado `loading` para deshabilitar el botón y mostrar `ActivityIndicator` durante la petición
- Estado `datosCasa` para almacenar `alias_nombre` de la vivienda y `nombre` de la habitación devueltos por el backend, sustituyendo los textos mockeados del dashboard
- Botón deshabilitado también cuando el sufijo está vacío
- Gestión de errores: los mensajes de error del backend (`error.response.data.error`) se muestran en un `Alert.alert` — cubre código inválido y habitación ya ocupada
- Estilo `botonCanjearDisabled` añadido a `inicio.styles.ts`

## Archivos modificados

| Acción | Archivo |
|---|---|
| Modificado | `frontend/app/inquilino/inicio.tsx` |
| Modificado | `frontend/styles/inquilino/inicio.styles.ts` |

## Respuesta del backend

`POST /api/inquilino/unirse` devuelve:
```json
{
  "mensaje": "Te has unido a la habitación correctamente.",
  "habitacion": {
    "id": 1,
    "nombre": "Habitación 1",
    "vivienda": {
      "alias_nombre": "Piso Centro",
      ...
    }
  }
}
```

Errores posibles (clave `error`):
- `404` — `"Código de invitación inválido."`
- `400` — `"Esta habitación ya está ocupada."`
- `403` — `"Solo los inquilinos pueden unirse a una habitación."`

## Decisiones técnicas

| Decisión | Motivo |
|---|---|
| Botón deshabilitado con sufijo vacío | Evita peticiones innecesarias con código incompleto |
| `err.response?.data?.error` para el mensaje | El backend usa la clave `error` en todos los errores, no `message` ni `mensaje` |
| `datosCasa` como estado local | Suficiente para este issue; persistencia real se abordará cuando se implemente la carga del perfil del inquilino al arrancar |
| `?? 'Mi vivienda'` como fallback en el dashboard | Guarda contra el edge case de `datosCasa` null si el estado se resetea |
