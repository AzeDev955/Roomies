# Épica 2 — Issue #35: Ocultar códigos de invitación con autenticación biométrica/PIN

## Qué se hizo

- Instalado `expo-local-authentication` (SDK 54 compatible)
- Estado `codigosRevelados: Record<number, boolean>` — registra qué habitaciones tienen el código visible
- Función `revelarCodigo(habitacionId)` — llama a `LocalAuthentication.authenticateAsync` y solo actualiza el estado si el resultado es `success: true`
- Renderizado condicional por habitación:
  - **No revelado**: muestra `••••••••` + "Toca para revelar" (Pressable que dispara la autenticación)
  - **Revelado**: muestra el código real en `Courier New`
- Nuevos estilos en `detalle.styles.ts`: `codigoOculto` y `revelarTexto`

## Archivos modificados

| Acción | Archivo |
|---|---|
| Modificado | `frontend/app/casero/vivienda/[id].tsx` |
| Modificado | `frontend/styles/casero/vivienda/detalle.styles.ts` |

## Comportamiento

- Cada código se revela de forma independiente (tocar en uno no revela los demás)
- Si la autenticación falla o el usuario cancela, el código permanece oculto
- Al navegar fuera y volver, los códigos vuelven a estar ocultos (estado local, no persistido)

## Nota

`expo-local-authentication` usa Face ID / Touch ID en iOS y huella / PIN en Android. En el simulador de iOS la autenticación siempre falla (no hay biométrica); usar dispositivo físico o emulador Android para probar.
