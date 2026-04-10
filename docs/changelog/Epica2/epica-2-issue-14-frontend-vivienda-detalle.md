# Épica 2 — Issue #14: (Frontend) Pantalla de Detalle de Casa

## Qué se hizo

- Ruta dinámica `app/casero/vivienda/[id].tsx` — Expo Router la registra como `/casero/vivienda/:id`
- `useLocalSearchParams()` extrae el `id` de la URL
- Datos mock con 2 dormitorios (con `codigo_invitacion`) y 2 zonas comunes (`codigo_invitacion: null`)
- Renderizado condicional:
  - Habitaciones habitables → recuadro gris claro con código en fuente monoespaciada (`Courier New`, `letterSpacing: 2`)
  - Zonas comunes → texto en cursiva `Zona común · Sin código`
- FAB verde ("Añadir Habitación") con `onPress` pendiente de implementar

## Archivos creados

| Acción | Archivo |
|---|---|
| Nuevo | `frontend/app/casero/vivienda/[id].tsx` |
| Nuevo | `frontend/styles/casero/vivienda/detalle.styles.ts` |

## Decisiones técnicas

| Decisión | Motivo |
|---|---|
| `ScrollView` + `.map()` en lugar de `FlatList` | Lista pequeña y fija (habitaciones de una casa); `FlatList` tiene overhead para listas cortas |
| `Courier New` para el código | Fuente monoespaciada disponible en iOS y Android sin configuración extra |
| FAB verde (`#34C759`) | Diferencia visualmente el FAB de "añadir habitación" del FAB azul de "añadir vivienda" |
| `detalle.styles.ts` (no `[id].styles.ts`) | Los corchetes en nombres de archivo causan problemas en algunos sistemas de archivos |

## Pendiente

- Conectar `onPress` del FAB a la pantalla de formulario de nueva habitación
- Reemplazar `MOCK_VIVIENDA` por llamada real a `GET /api/viviendas/:id`
- Usar el `id` de `useLocalSearchParams` para cargar la vivienda correcta
