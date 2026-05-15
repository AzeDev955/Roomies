# Epica 16 y 17 - Revision documental de cierre

## Objetivo

Sincronizar la documentacion general y tecnica con el estado real de las epicas 16 y 17.

## Cambios

- `CONTEXT.md`: actualizado el flujo de registro/login de Epica 16, y anadido resumen de Epica 17 sobre limpieza por habitaciones, exportacion CSV, documentos legales e inventario validado.
- `README.md`: reflejados sesion inmediata tras registro, documentos legales, exportacion de limpiezas e inventario con estado de validacion.
- `docs/backend/api.md`: corregido el contrato actual de registro/login, inventario con auditoria de conformidad y limpieza basada en habitaciones responsables.
- `docs/backend/setup.md`: documentadas decisiones de consistencia para `TurnoLimpieza.habitacion_id`, auditoria de inventario y el guard temporal de correo verificado.
- `docs/frontend/setup.md`: anadidas rutas legales, aceptacion en registro/rol, limpieza por habitaciones y comportamiento de inventario filtrado.
- `docs/changelog/Epica17/epica-17-issue-282-exportar-limpiezas.md`: ajustadas las cabeceras CSV al contrato actual.

## Verificacion

- Revision local con `rg` de referencias obsoletas sobre registro sin JWT, `correo_verificado`, `usuario_ids` en limpieza y cabeceras antiguas de exportacion.
