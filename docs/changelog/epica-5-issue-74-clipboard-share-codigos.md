# Épica 5 — Issue #74: Copiar y compartir códigos de invitación

## Qué se hizo

- Instalada la librería `expo-clipboard` para acceso al portapapeles nativo
- Pantalla de detalle de vivienda (`app/casero/vivienda/[id].tsx`) actualizada con dos nuevas acciones sobre los códigos revelados:
  - **Mantener pulsado** (`onLongPress`) sobre el código → copia al portapapeles + `Alert` de confirmación
  - **Botón "Compartir"** → abre el sheet nativo de compartir de iOS/Android con el mensaje de invitación

## Archivos modificados

| Acción | Archivo |
|---|---|
| Modificado | `frontend/app/casero/vivienda/[id].tsx` |
| Modificado | `frontend/styles/casero/vivienda/detalle.styles.ts` |

## UX del código revelado

```
┌─────────────────────────────────────┐
│ Código de invitación                │
│ ┌───────────────────┐ ┌──────────┐  │
│ │ ROOM-X7B9         │ │Compartir │  │
│ │ Mantén pulsado... │ └──────────┘  │
│ └───────────────────┘               │
└─────────────────────────────────────┘
```

## Decisiones técnicas

| Decisión | Motivo |
|---|---|
| `onLongPress` para copiar | Gesto estándar en mobile para copiar texto; no ocupa espacio visual extra |
| `Share.share` nativo de react-native | No requiere dependencia extra; usa el sheet de sistema de iOS/Android |
| Hint "Mantén pulsado para copiar" | Descubribilidad — el gesto long press no es obvio sin indicación |
| Botón verde para compartir | Verde (`#34C759`) coherente con el FAB de añadir habitación; diferencia la acción de las de navegación (azul) |
| `codigoReveladoFila` con `flexDirection: row` | Código y botón en la misma línea sin romper el layout del `codigoContainer` existente |
