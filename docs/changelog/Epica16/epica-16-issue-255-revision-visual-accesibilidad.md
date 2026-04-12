# Issue #255 - Revision visual, copy, accesibilidad y mojibake

## Objetivo

Corregir deuda visible del sistema visual y dejar reglas claras para que las siguientes PRs mantengan un producto consistente.

## Cambios

- `frontend/constants/theme.ts`: anade tokens semanticos para texto de tints, fondo oscuro y color de Google.
- `frontend/components/common/*`: mejora accesibilidad por defecto en `CustomButton`, `CustomInput` y `Card`.
- `frontend/components/ui/collapsible.tsx` y `frontend/components/themed-text.tsx`: eliminan valores locales y consumen `Theme`.
- `frontend/app/index.tsx`, `frontend/app/registro.tsx` y `frontend/app/rol.tsx`: anaden roles, labels y estados accesibles en acciones principales.
- `frontend/app/rol.tsx`: sustituye emojis estructurales por `Ionicons`.
- Estilos de incidencias y limpieza: migran hexadecimales semanticos a tokens de `Theme`.
- `CONTEXT.md` y changelog de Epica 11: corrigen mojibake detectado.
- `docs/frontend/visual-quality.md`: documenta reglas obligatorias de tokens, accesibilidad, copy y encoding.

## Verificacion

- Pendiente de ejecutar `npm test` y `npm run lint` en `frontend`.

