# Issue 254 - Auditoria pantallas inquilino, perfil, incidencia y tablon

## Cambios

- El detalle de incidencia consume permisos calculados por backend y deja de confiar en parametros de navegacion para mostrar editar, eliminar o cambio de estado.
- Los formularios de nueva incidencia, tablones, gastos y canje de codigo validan datos obligatorios antes de llamar a la API.
- Las rutas directas a Limpieza, Gastos e Inventario muestran un estado claro cuando el modulo esta desactivado para la vivienda.
- El flujo de gastos mantiene separados los pendientes entre companeros y los pendientes con casero, ocultando el FAB cuando la carga falla o el modulo esta desactivado.
- Se mantiene la privacidad de datos del inquilino: precios de dormitorios ajenos siguen llegando como `null` desde backend y el detalle de companeros solo se consulta por el endpoint autorizado.

## Matriz de pantallas criticas

| Pantalla | Cobertura / justificacion |
| --- | --- |
| `frontend/app/inquilino/(tabs)/_layout.tsx` | Auditado: oculta tabs por flags de modulo y vivienda activa. Sin test nuevo por depender de Expo Tabs; queda cubierto por validacion manual y endpoints protegidos. |
| `frontend/app/inquilino/(tabs)/inicio.tsx` | Auditado y ajustado: valida codigo de invitacion antes de API y conserva datos privados de companeros tras endpoint autorizado. |
| `frontend/app/inquilino/(tabs)/gastos.tsx` | Auditado y ajustado: estado explicito de modulo desactivado, validacion previa y FAB oculto si no hay contexto valido. |
| `frontend/app/inquilino/(tabs)/inventario.tsx` | Auditado y ajustado: estado explicito de modulo desactivado antes de mostrar inventario. |
| `frontend/app/inquilino/(tabs)/limpieza.tsx` | Auditado y ajustado: estado explicito de modulo desactivado antes de mostrar turnos. |
| `frontend/app/inquilino/(tabs)/tablon.tsx` | Auditado y ajustado: valida titulo/contenido y contexto antes de publicar. |
| `frontend/app/inquilino/nueva-incidencia.tsx` | Auditado y ajustado: parseo seguro de parametros, aviso si falta vivienda y trim antes de POST. |
| `frontend/app/incidencia/[id].tsx` | Test de render/permisos en `frontend/app/incidencia/__tests__/detalle.test.tsx`. |
| `frontend/app/tablon/[viviendaId].tsx` | Auditado y ajustado: valida vivienda, titulo y contenido antes de publicar. |
| `frontend/app/perfil.tsx` | Auditado: perfil compartido no expone documento de identidad ni datos de otros usuarios. Sin cambio funcional. |

## Verificacion prevista

- `npm test -- --runTestsByPath app/incidencia/__tests__/detalle.test.tsx`
- `npm run build`
