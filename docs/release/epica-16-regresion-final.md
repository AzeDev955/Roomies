# Epica 16 - Regresion final y checklist de release

## Objetivo

Cerrar la revision integral de calidad con una comprobacion transversal de los flujos principales, dejando trazabilidad entre archivos revisados, issues responsables, estado y riesgos residuales.

## Scripts acordados

| Area | Comando | Objetivo |
|---|---|---|
| Backend | `npm test` | Ejecuta Vitest, Supertest y smoke tests finales de rutas/cron. |
| Backend | `npm run build` | Regenera Prisma Client y compila TypeScript. |
| Frontend | `npm test` | Ejecuta Jest Expo y smoke tests finales de navegacion. |
| Frontend | `npm run lint` | Revisa reglas Expo/ESLint. |
| Infra | `docker compose config --quiet` | Valida la configuracion Compose sin levantar servicios. |

## Checklist manual de producto

Usar Railway desarrollo como backend y Expo Go o build nativa segun el modulo a revisar. Marcar cada punto en la PR con OK, N/A o issue de seguimiento.

| Flujo | Validacion manual minima | Estado |
|---|---|---|
| Registro | Crear usuario manual con email nuevo y verificar que vuelve al login sin token filtrado. | Pendiente PR |
| Login | Login correcto por rol y error visible con credenciales invalidas. | Pendiente PR |
| Logout | Cerrar sesion desde perfil y confirmar vuelta a `/`. | Pendiente PR |
| Restauracion de sesion | Reabrir app con token valido e invalido; validar dashboard por rol y limpieza de token invalido. | Pendiente PR |
| Casero crea vivienda | Crear vivienda con dormitorios y zonas comunes; comprobar lista y detalle. | Pendiente PR |
| Casero crea habitacion | Crear y editar dormitorio con precio privado; crear zona comun sin precio. | Pendiente PR |
| Inquilino se une con codigo | Canjear codigo sin prefijo `ROOM-`; verificar que no se expone el nuevo codigo. | Pendiente PR |
| Consulta de vivienda | Casero ve su vivienda; inquilino ve su habitacion, zonas comunes y no ve precios/codigos privados ajenos. | Pendiente PR |
| Incidencias | Crear, listar, abrir detalle y cambiar estado solo con permisos backend. | Pendiente PR |
| Tablon | Crear, listar y eliminar anuncio cuando el rol/pertenencia lo permite. | Pendiente PR |
| Limpieza | Configurar zona, generar turnos y marcar turno como hecho con modulo activo. | Pendiente PR |
| Gastos | Crear gasto, revisar reparto, listar deuda y saldar como deudor. | Pendiente PR |
| Inventario | Crear item, verlo como inquilino y marcar conformidad. | Pendiente PR |
| Push | Registrar token en build compatible; confirmar que fallos de proveedor no bloquean login/anuncios. | Pendiente PR |
| Cron | Ejecutar/revisar cron de mensualidades y recordatorios con logs controlados y sin romper si Expo falla. | Pendiente PR |

## Cobertura automatica de regresion

| Flujo minimo | Cobertura automatica |
|---|---|
| Registro, login y Google OAuth | `backend/tests/release-regression.test.ts` valida payloads invalidos en rutas publicas; `frontend/app/__tests__/index.test.tsx` cubre login correcto/error. |
| Logout y restauracion de sesion | `frontend/app/__tests__/_layout.test.tsx` cubre restauracion y limpieza de token; logout queda en checklist manual. |
| Casero crea vivienda y habitacion | `backend/tests/release-regression.test.ts` valida rutas protegidas de vivienda/habitacion; checklist manual cubre persistencia real. |
| Inquilino se une con codigo | `backend/tests/multitenant-security.test.ts` cubre burn-after-reading; `backend/tests/release-regression.test.ts` cubre ruta. |
| Consulta sin datos privados | `backend/tests/multitenant-security.test.ts` cubre precio/codigo privado; smoke final cubre rutas. |
| Incidencias | `backend/tests/operational-modules.test.ts`, `frontend/app/incidencia/__tests__/detalle.test.tsx` y smoke final. |
| Tablon | `backend/tests/multitenant-security.test.ts`, `backend/tests/operational-modules.test.ts` y smoke final. |
| Limpieza | `backend/tests/limpieza.service.test.ts`, `backend/tests/operational-modules.test.ts` y smoke final. |
| Gastos/deudas/cobros | `backend/tests/economico.test.ts` y smoke final. |
| Inventario | `backend/tests/operational-modules.test.ts` y smoke final. |
| Push y cron | `backend/tests/operational-modules.test.ts` cubre push fire-and-forget; `backend/tests/release-regression.test.ts` cubre cron tolerante a fallo externo. |
| Navegacion principal | `frontend/app/__tests__/navigation-smoke.test.tsx` cubre tabs de casero, inquilino y vivienda. |

## Matriz final archivo -> issue -> estado

| Alcance | Archivos | Issue responsable | Estado |
|---|---|---|---|
| Infra de tests | `backend/package.json`, `frontend/package.json`, `backend/tests/setup.ts`, `frontend/jest.setup.js` | #246 | Cubierto |
| App Express testeable | `backend/src/app.ts`, `backend/src/index.ts` | #246 | Cubierto |
| Auth backend | `backend/src/controllers/auth.controller.ts`, `backend/src/routes/auth.routes.ts`, `backend/src/middlewares/auth.middleware.ts`, `backend/src/schemas/auth.schema.ts`, `backend/src/services/email.service.ts` | #247 | Cubierto |
| Sesion frontend | `frontend/app/_layout.tsx`, `frontend/app/index.tsx`, `frontend/app/registro.tsx`, `frontend/app/rol.tsx`, `frontend/services/auth.service.ts`, `frontend/utils/authRoutes.ts`, `frontend/utils/notifications.ts` | #252 | Cubierto |
| Usuarios y push token | `backend/src/controllers/user.controller.ts`, `backend/src/routes/user.routes.ts`, `frontend/utils/notifications.ts` | #247 / #252 | Cubierto |
| Multi-tenant viviendas | `backend/src/controllers/vivienda.controller.ts`, `backend/src/routes/vivienda.routes.ts`, `backend/src/controllers/inquilino.controller.ts`, `backend/src/routes/inquilino.routes.ts`, `backend/src/utils/generarCodigo.ts` | #248 | Cubierto |
| Parametros dinamicos | `frontend/hooks/useViviendaIdParam.ts`, `frontend/utils/viviendaParams.ts`, `frontend/utils/viviendaModules.ts` | #248 / #252 | Cubierto |
| Prisma y seed | `backend/prisma/schema.prisma`, `backend/prisma/seed.ts`, `backend/prisma.config.ts` | #249 | Cubierto |
| Gastos y deudas | `backend/src/controllers/gasto.controller.ts`, `backend/src/controllers/gasto-recurrente.controller.ts`, `backend/src/controllers/deuda.controller.ts`, `backend/src/controllers/cobros.controller.ts`, `backend/src/services/gasto.service.ts`, `backend/src/routes/gasto.routes.ts`, `backend/src/routes/gasto-recurrente.routes.ts`, `backend/src/routes/deuda.routes.ts` | #250 | Cubierto |
| Cron economico | `backend/src/services/cron.service.ts`, `backend/src/cron/mensualidades.cron.ts`, `backend/src/cron/recordatorios.cron.ts` | #250 / #257 | Cubierto |
| Limpieza | `backend/src/controllers/limpieza.controller.ts`, `backend/src/services/limpieza.service.ts`, `backend/src/routes/limpieza.routes.ts`, `frontend/app/casero/vivienda/[id]/(tabs)/limpieza.tsx`, `frontend/app/inquilino/(tabs)/limpieza.tsx` | #251 | Cubierto |
| Inventario | `backend/src/controllers/inventario.controller.ts`, `backend/src/routes/inventario.routes.ts`, `backend/src/config/cloudinary.config.ts`, `frontend/app/casero/(tabs)/inventario.tsx`, `frontend/app/inquilino/(tabs)/inventario.tsx` | #251 | Cubierto |
| Incidencias | `backend/src/controllers/incidencia.controller.ts`, `backend/src/routes/incidencia.routes.ts`, `frontend/app/incidencia/[id].tsx`, `frontend/app/inquilino/nueva-incidencia.tsx`, tabs de incidencias del casero | #251 / #254 | Cubierto |
| Tablon | `backend/src/controllers/anuncio.controller.ts`, `backend/src/routes/anuncio.routes.ts`, `frontend/app/casero/(tabs)/tablon.tsx`, `frontend/app/casero/vivienda/[id]/(tabs)/tablon.tsx`, `frontend/app/inquilino/(tabs)/tablon.tsx`, `frontend/app/tablon/[viviendaId].tsx` | #251 / #254 | Cubierto |
| Pantallas casero | `frontend/app/casero/**`, `frontend/styles/casero/**`, `frontend/components/casero/**` | #253 | Cubierto |
| Pantallas inquilino | `frontend/app/inquilino/**`, `frontend/styles/inquilino/**` | #254 | Cubierto |
| Sistema visual | `frontend/constants/theme.ts`, `frontend/constants/toastConfig.tsx`, `frontend/components/common/**`, `frontend/styles/**`, `docs/frontend/visual-quality.md` | #255 | Cubierto |
| Infra/despliegue | `docker-compose.yml`, `.env.example`, `backend/.env.example`, `frontend/.env.example`, `backend/Dockerfile`, `frontend/app.json`, `frontend/eas.json`, `README.md`, `docs/infra/setup-despliegue.md` | #256 | Cubierto |
| Documentacion backend/frontend | `docs/backend/**`, `docs/frontend/**`, `CONTEXT.md` | #256 / #257 | Cubierto |
| Regresion final | `backend/tests/release-regression.test.ts`, `frontend/app/__tests__/navigation-smoke.test.tsx`, `docs/release/epica-16-regresion-final.md` | #257 | Cubierto |

## Riesgos residuales

| Riesgo | Decision |
|---|---|
| Push real no se valida en Expo Go. | Documentado: requiere build nativa o development build. Checklist manual obliga a validarlo en entorno compatible antes de release. |
| Tests smoke no sustituyen E2E con base real. | Decision documentada: se cubren rutas, permisos y servicios criticos con mocks; persistencia real queda en checklist manual contra Railway desarrollo. |
| Mojibake historico visible en algunos textos/docs. | Revisado en #255 y documentado como deuda de limpieza continua si aparece en areas no tocadas. |
| Importes usan `Float` en Prisma. | Revisado en #250; no se migra en esta epica por riesgo de cambio de datos, se mantiene test de centimos y decision documentada. |
| Docker Compose no se levanta durante la suite automatica. | Se valida `docker compose config --quiet`; levantar servicios queda como paso manual opcional por coste y duracion. |

## Resumen para PR

- Backend: smoke final de rutas principales protegidas, validacion de payloads publicos de auth y cron de recordatorios tolerante a fallos externos.
- Frontend: smoke final de navegacion principal para tabs de casero, inquilino y detalle de vivienda.
- Release: checklist manual, matriz final de trazabilidad por archivo/issue y riesgos residuales documentados.
