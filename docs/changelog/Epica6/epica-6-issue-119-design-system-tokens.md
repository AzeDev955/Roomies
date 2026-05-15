# Issue #119 — Sistema de Diseño y Tokens (Design System)

## Resumen

Creación de `frontend/constants/theme.ts` como única fuente de verdad para colores, espaciado, radios y tipografía. Refactorización completa de los 14 archivos `.styles.ts` para eliminar todos los valores hexadecimales hardcodeados y números mágicos.

## Cambios

### Nuevo archivo
- **`frontend/constants/theme.ts`**: Objeto `Theme` con tokens para `colors`, `spacing`, `radius` y `typography`, exportado con `as const` para type safety completo. Añadido también export `Colors` para compatibilidad con componentes de plantilla Expo (`ThemedText`, `ThemedView`, `Collapsible`).

### Archivos de estilos refactorizados (14)
Todos importan `{ Theme } from '@/constants/theme'` y usan tokens en lugar de literales:

| Archivo | Cambios destacados |
|---|---|
| `styles/index.styles.ts` | Login — colores primario, fondo, superficie |
| `styles/registro.styles.ts` | Registro — ídem |
| `styles/home.styles.ts` | Selector rol — colores y tipografía |
| `styles/perfil.styles.ts` | Perfil — colores, spacing, radios |
| `styles/rol.styles.ts` | Post-OAuth rol — colores y pills |
| `styles/casero/viviendas.styles.ts` | Lista viviendas — badges de estado |
| `styles/casero/nueva-vivienda.styles.ts` | Formulario — añadidos `habitacionItemWrapper` e `habitacionItemEliminarTexto` |
| `styles/casero/vivienda/detalle.styles.ts` | Detalle vivienda |
| `styles/casero/vivienda/incidencias.styles.ts` | `COLORES_PRIORIDAD` usa tokens semánticos |
| `styles/casero/vivienda/nueva-habitacion.styles.ts` | Nueva/editar habitación |
| `styles/incidencia/detalle.styles.ts` | Fix: `Theme.spacing.title` → `Theme.spacing.lg` |
| `styles/inquilino/inicio.styles.ts` | Dashboard inquilino — `COLORES_PRIORIDAD` + todos los tokens |
| `styles/inquilino/nueva-incidencia.styles.ts` | Nueva incidencia — `COLORES_PRIORIDAD` |
| `styles/tablon/tablon.styles.ts` | Tablón anuncios — FAB, modal, cards |

### Componente actualizado
- **`app/casero/nueva-vivienda.tsx`**: Eliminados los 2 inline styles (`style={{ flex: 1 }}` y `style={{ color: '#fff', fontWeight: '700' }}`), reemplazados por `styles.habitacionItemWrapper` y `styles.habitacionItemEliminarTexto`.

### Fix adicional
- **`app/casero/vivienda/[id].tsx`**: Corregido `pathname` de `router.push` para usar `'/casero/vivienda/[id]/editar-habitacion'` con `id` en `params` en vez de template literal (error de tipos expo-router).

## Tokens creados

| Categoría | Tokens |
|---|---|
| `colors` | `primary`, `primaryDisabled`, `success`, `successDisabled`, `danger`, `warning`, `background`, `surface`, `surface2`, `text`, `textSecondary`, `textTertiary`, `textMuted`, `textMedium`, `border`, `shadow` |
| `spacing` | `xs` (4), `sm` (8), `md` (12), `base` (16), `lg` (24), `xl` (32) |
| `radius` | `sm` (8), `md` (12), `lg` (20), `full` (28) |
| `typography` | `caption` (12), `label` (13), `body` (15), `input` (16), `title` (20), `heading` (24), `hero` (32) |

## Valores no tokenizados (intencionado)

- `paddingBottom: 96` — espacio reservado sobre el FAB
- `width/height: 56` — tamaño fijo del FAB
- `fontSize: 17`, `18`, `11`, `22`, `28` — usos aislados sin token semántico
- Opacidades de sombra (`0.06`, `0.08`, `0.3`)
- `letterSpacing` — valores específicos por componente

## Verificación

- `npx tsc --noEmit` en `frontend/` → 0 errores
