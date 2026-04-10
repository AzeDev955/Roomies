---
name: roomies-changelog
description: Registrar cierres de tarea en Roomies creando o actualizando un markdown dentro de docs/changelog. Use when Codex completes implementation, refactors, fixes, reviews with edits, or any technical task in this repository and must leave a per-issue technical changelog using the epica-[X]-issue-[Y].md naming convention.
---

# Roomies Changelog

Al cerrar una tarea en este repositorio, revisar `docs/changelog/` y crear o actualizar el archivo de la issue correspondiente.

## Formato de nombre

Usar `docs/changelog/epica[X]/epica-[X]-issue-[Y].md` como patrón base.

- Sustituir `X` por el identificador de épica cuando exista.
- Sustituir `Y` por el identificador de issue cuando exista.
- Si falta alguno de los dos datos y no merece bloquear la tarea, usar un valor provisional explícito y dejar la suposición escrita en el contenido.

## Contenido requerido

Documentar cambios técnicos exactos, no resúmenes vagos.

Incluir siempre:

- fecha en formato `YYYY-MM-DD`
- épica o suposición usada
- título técnico breve de la tarea
- lista concreta de archivos, módulos, endpoints, componentes, migraciones, validaciones o flujos tocados
- resultado técnico observable del cambio

Usar esta plantilla:

```markdown
# Issue #[Y] — [Título técnico breve]

**Fecha:** YYYY-MM-DD
**Épica:** [X o nombre breve]

## Cambios técnicos

- `ruta/archivo.ext`: cambio técnico exacto
- `ruta/archivo.ext`: cambio técnico exacto
```

## Reglas de calidad

- No escribir contexto genérico ni texto orientado a gestión.
- No omitir archivos clave si fueron editados.
- Si hubo validación, añadir una línea técnica breve con lo verificado.
- Mantener el archivo sincronizado si la misma issue recibe cambios posteriores en vez de duplicar entradas innecesarias.
