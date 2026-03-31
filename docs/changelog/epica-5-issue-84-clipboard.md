# Issue #84 — Ajuste en el portapapeles de invitaciones

## Problema

Los códigos de invitación se almacenan en la base de datos con el prefijo `ROOM-` (ej: `ROOM-AB12CD`), generado por `backend/src/utils/generarCodigo.ts`. Al copiar el código desde la tarjeta de habitación, el string completo —prefijo incluido— se escribía en el portapapeles. El inquilino, al pegarlo en la pantalla de canje, obtenía un error porque el campo espera únicamente la parte alfanumérica (`AB12CD`).

## Cambio

**`frontend/app/casero/vivienda/[id].tsx`** — función `copiarCodigo`:

```typescript
// Antes
const copiarCodigo = async (codigo: string) => {
  await Clipboard.setStringAsync(codigo);
  Alert.alert('¡Copiado!', 'El código de invitación se ha guardado en el portapapeles.');
};

// Después
const copiarCodigo = async (codigo: string) => {
  const codigoLimpio = codigo.replace(/^room[-\s]*/i, '').trim();
  await Clipboard.setStringAsync(codigoLimpio);
  Alert.alert('Código copiado', 'Pégalo en la app para unirte a la habitación.');
};
```

## Regex utilizada

`/^room[-\s]*/i`

- `^room` — prefijo "ROOM" al inicio del string, insensible a mayúsculas
- `[-\s]*` — consume el guion o espacio que sigue al prefijo (0 o más)
- `.trim()` — elimina espacios residuales al inicio/fin

Casos cubiertos: `ROOM-AB12CD`, `ROOM AB12CD`, `ROOMAB12CD`, `room-ab12cd`.

## Decisión técnica

Se optó por limpiar en el momento del copiado (frontend) en lugar de cambiar el formato de almacenamiento en la base de datos, para no afectar la unicidad del índice `codigo_invitacion` ni el endpoint de canje del inquilino, que ya funciona correctamente.
