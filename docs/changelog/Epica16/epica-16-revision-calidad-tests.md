# Epica 16 - Revision integral de calidad, seguridad y tests

## Objetivo
Revisar todo el codigo de Roomies para detectar malos usos, typos, incongruencias, regresiones funcionales, brechas de seguridad y deuda tecnica, introduciendo una base real de tests que permita seguir desarrollando sin romper flujos criticos.

## Rama objetivo
`dev`

> Regla del repo aplicada desde el skill `roomies-github-issues`: las ramas de trabajo salen siempre desde `dev` salvo instruccion explicita contraria.

## Diagnostico inicial
- No hay tests versionados: `git ls-files '*test*' '*spec*' '__tests__/*'` no devuelve archivos.
- `backend/package.json` no define script `test`; `frontend/package.json` solo define `lint`.
- Backend tiene `strict: true`, pero faltan validaciones y tests alrededor de controladores, servicios, middlewares y cronjobs.
- Frontend tiene `strict: true`, pero hay pantallas grandes y flujos sensibles sin tests de render, navegacion ni errores de API.
- Hay mojibake visible en codigo/documentacion, especialmente en respuestas de API, comentarios de Prisma y servicios.
- Hay hardcodes pendientes de revisar: `PORT = 3000`, `cors()` abierto, fallback `http://localhost:3000/api`, hex literals y magic numbers fuera de `Theme`.
- La verificacion por email esta deshabilitada temporalmente en auth y el registro devuelve JWT inmediato; esto debe quedar auditado como decision consciente o deuda de seguridad.
- Los modulos de pagos, inventario, limpieza, anuncios, incidencias y vivienda manejan permisos multi-tenant que necesitan tests negativos.

## Cobertura obligatoria
Esta epica no se considera cerrada hasta que cada archivo versionado quede cubierto por una revision o por una decision documentada de "sin cambios".

Alcance minimo:
- Backend: `backend/src`, `backend/prisma`, `backend/package.json`, `backend/tsconfig.json`, `backend/Dockerfile`, `backend/.env.example`.
- Frontend: `frontend/app`, `frontend/components`, `frontend/constants`, `frontend/hooks`, `frontend/services`, `frontend/styles`, `frontend/utils`, `frontend/package.json`, `frontend/tsconfig.json`, `frontend/eslint.config.js`, `frontend/app.json`, `frontend/eas.json`, `frontend/Dockerfile`, `frontend/.env.example`.
- Raiz e infraestructura: `README.md`, `CONTEXT.md`, `docker-compose.yml`, `.env.example`, `.gitignore`.
- Documentacion: `docs/backend`, `docs/frontend`, `docs/wireframes`, `docs/changelog`.

Conteo orientativo detectado:
- 42 archivos en `backend/src` + `backend/prisma`.
- 87 archivos frontend de app/componentes/servicios/hooks/utils/styles/constants.
- 103 archivos de documentacion.
- 266 archivos versionados en el alcance amplio revisado.

## Issues propuestos

## Issues creados en GitHub
- #245 - [EPICA 16] Revision integral de calidad, seguridad y tests
- #246 - [EPICA 16][1] Introducir infraestructura de tests y comandos de calidad
- #247 - [EPICA 16][2] Auditar autenticacion, sesion, roles y secretos
- #248 - [EPICA 16][3] Auditar permisos multi-tenant y proteccion de datos
- #249 - [EPICA 16][4] Revisar modelo Prisma, seed y consistencia de datos
- #250 - [EPICA 16][5] Revisar pagos, gastos, deudas, cobros y calculos monetarios
- #251 - [EPICA 16][6] Revisar limpieza, inventario, anuncios, incidencias y notificaciones
- #252 - [EPICA 16][7] Revisar frontend de autenticacion, navegacion y cliente API
- #253 - [EPICA 16][8] Revisar pantallas del casero y sus estilos
- #254 - [EPICA 16][9] Revisar pantallas del inquilino, perfil, incidencia y tablon
- #255 - [EPICA 16][10] Revisar sistema visual, typos, copy, accesibilidad y mojibake
- #256 - [EPICA 16][11] Revisar infraestructura, Docker, envs, despliegue y documentacion
- #257 - [EPICA 16][12] Crear suite de regresion final y checklist de release

### Issue 16.0 - [EPICA 16] Revision integral de calidad, seguridad y tests

**Objetivo**
Coordinar una revision completa de Roomies para elevar calidad, seguridad, consistencia y cobertura de tests antes de seguir ampliando funcionalidades.

**Alcance**
- Orquestar todos los issues hijos de esta epica.
- Mantener una matriz de cobertura por carpeta y modulo.
- Bloquear el cierre de la epica hasta que backend, frontend, docs e infraestructura hayan sido revisados.
- Exigir tests nuevos o justificacion explicita cuando no sean viables.

**Issues incluidos**
- Issue 16.1 - Introducir infraestructura de tests y comandos de calidad.
- Issue 16.2 - Auditar autenticacion, sesion, roles y secretos.
- Issue 16.3 - Auditar permisos multi-tenant y proteccion de datos.
- Issue 16.4 - Revisar modelo Prisma, seed, migraciones implicitas y consistencia de datos.
- Issue 16.5 - Revisar pagos, gastos, deudas, cobros y calculos monetarios.
- Issue 16.6 - Revisar limpieza, inventario, anuncios, incidencias y notificaciones.
- Issue 16.7 - Revisar frontend de autenticacion, navegacion y cliente API.
- Issue 16.8 - Revisar pantallas del casero y sus estilos.
- Issue 16.9 - Revisar pantallas del inquilino, perfil, incidencia y tablon.
- Issue 16.10 - Revisar sistema visual, typos, copy, accesibilidad y mojibake.
- Issue 16.11 - Revisar infraestructura, Docker, envs, despliegue y documentacion.
- Issue 16.12 - Crear suite de regresion final y checklist de release.

**Criterios de aceptacion**
- Todos los issues hijos estan cerrados.
- Existe al menos una suite de tests de backend y una de frontend ejecutable por script.
- Existe una matriz final con todos los archivos revisados.
- Toda brecha de seguridad encontrada queda corregida o convertida en issue especifico enlazado.
- Los docs quedan actualizados con como ejecutar tests, lint, build y checks previos a PR.

---

### Issue 16.1 - Introducir infraestructura de tests y comandos de calidad

**Objetivo**
Anadir la base tecnica para probar backend y frontend de forma repetible.

**Alcance**
- Definir framework de backend: Vitest o Jest + Supertest para Express.
- Definir framework de frontend: Jest + React Native Testing Library, o alternativa compatible con Expo 54.
- Anadir scripts en `backend/package.json` y `frontend/package.json`: `test`, `test:watch`, `test:coverage` si aplica.
- Preparar config de entorno de test sin tocar datos reales.
- Documentar comandos en `README.md` y docs tecnicos.
- Revisar si conviene anadir CI basico o checklist local si no hay GitHub Actions.

**Archivos a revisar**
- `backend/package.json`
- `backend/tsconfig.json`
- `backend/src/index.ts`
- `backend/src/lib/prisma.ts`
- `frontend/package.json`
- `frontend/tsconfig.json`
- `frontend/eslint.config.js`
- `README.md`
- `docs/backend/setup.md`
- `docs/frontend/setup.md`

**Criterios de aceptacion**
- `npm test` funciona en backend.
- `npm test` funciona en frontend.
- Los tests pueden ejecutarse sin depender de `.env` privados.
- La app Express puede importarse sin arrancar servidor real, o queda documentado un wrapper de test.
- Se documenta como ejecutar tests y coverage.

---

### Issue 16.2 - Auditar autenticacion, sesion, roles y secretos

**Objetivo**
Revisar a fondo el flujo de identidad para cerrar brechas de seguridad y cubrirlo con tests.

**Alcance**
- Registro email/password.
- Login email/password.
- Google OAuth.
- Actualizacion de rol.
- `GET /auth/me`.
- Verificacion de correo deshabilitada y decision de producto/seguridad.
- JWT, expiracion, payload, ausencia de `JWT_SECRET`, manejo de tokens invalidos.
- Almacenamiento de token en frontend con SecureStore.
- Registro/sincronizacion de push token.

**Archivos a revisar**
- `backend/src/controllers/auth.controller.ts`
- `backend/src/routes/auth.routes.ts`
- `backend/src/middlewares/auth.middleware.ts`
- `backend/src/schemas/auth.schema.ts`
- `backend/src/services/email.service.ts`
- `backend/src/controllers/user.controller.ts`
- `backend/src/routes/user.routes.ts`
- `frontend/app/index.tsx`
- `frontend/app/registro.tsx`
- `frontend/app/rol.tsx`
- `frontend/app/_layout.tsx`
- `frontend/services/auth.service.ts`
- `frontend/utils/notifications.ts`

**Criterios de aceptacion**
- Tests de login correcto e incorrecto.
- Tests de registro duplicado por email y documento.
- Tests de token ausente, invalido y expirado.
- Tests de cambio de rol con valores invalidos.
- Decision documentada sobre correo verificado: reactivar, sustituir por proveedor viable o mantener deuda explicita.
- No se filtra `password_hash` ni secretos en respuestas o logs.
- El backend falla de forma clara si faltan secretos criticos.

---

### Issue 16.3 - Auditar permisos multi-tenant y proteccion de datos

**Objetivo**
Garantizar que caseros e inquilinos solo puedan ver y modificar datos que les pertenecen.

**Alcance**
- Viviendas y habitaciones.
- Perfil de inquilino y companeros.
- Codigos de invitacion.
- Precio privado por habitacion.
- Incidencias.
- Anuncios.
- Guardas de modulos activos.
- Endpoints de usuario y aliases legacy.

**Archivos a revisar**
- `backend/src/controllers/vivienda.controller.ts`
- `backend/src/controllers/inquilino.controller.ts`
- `backend/src/controllers/incidencia.controller.ts`
- `backend/src/controllers/anuncio.controller.ts`
- `backend/src/middlewares/module.guard.ts`
- `backend/src/routes/vivienda.routes.ts`
- `backend/src/routes/inquilino.routes.ts`
- `backend/src/routes/incidencia.routes.ts`
- `backend/src/routes/anuncio.routes.ts`
- `backend/src/utils/generarCodigo.ts`
- `frontend/hooks/useViviendaIdParam.ts`
- `frontend/utils/viviendaModules.ts`

**Criterios de aceptacion**
- Tests negativos para acceso cruzado entre dos viviendas.
- Tests negativos para casero intentando acceder a vivienda ajena.
- Tests negativos para inquilino intentando editar recursos de casero.
- Tests de ocultacion de precio privado.
- Tests de burn-after-reading de codigo de invitacion.
- Todos los endpoints sensibles validan pertenencia antes de devolver datos.

---

### Issue 16.4 - Revisar modelo Prisma, seed y consistencia de datos

**Objetivo**
Revisar el modelo de datos y el seed para detectar incoherencias, constraints faltantes, nombres inconsistentes, relaciones peligrosas y datos de prueba que se cuelen en producto.

**Alcance**
- Esquema Prisma completo.
- Seed y datos demo.
- Relacion Usuario/Vivienda/Habitacion.
- Relaciones de gastos, deudas, inventario, limpieza y anuncios.
- Comentarios corruptos por encoding.
- Constraints unicas y borrados con dependencias.
- Uso de `Float` en importes y decisiones de precision.

**Archivos a revisar**
- `backend/prisma/schema.prisma`
- `backend/prisma/seed.ts`
- `backend/prisma.config.ts`
- `backend/src/generated/prisma` si esta generado localmente, sin versionarlo.
- `docs/backend/api.md`
- `docs/backend/setup.md`

**Criterios de aceptacion**
- Mojibake corregido en schema/seed/docs.
- Se documentan constraints que faltan o se anaden si son seguras.
- Se revisa si `Float` debe migrar a centimos enteros o `Decimal`.
- Seed no introduce datos sensibles ni credenciales confusas fuera de entorno local.
- Se anaden tests o validaciones para relaciones criticas.

---

### Issue 16.5 - Revisar pagos, gastos, deudas, cobros y calculos monetarios

**Objetivo**
Auditar el modulo economico porque cualquier bug aqui genera deuda real, desconfianza o exposicion de datos.

**Alcance**
- Creacion de gastos divididos.
- Reparto automatico en centimos.
- Reparto manual y descuadres.
- Edicion de facturas.
- Deudas pagadas, justificantes y saldado.
- Gastos recurrentes y cron de mensualidades.
- Dashboard de cobros del casero.
- Permisos de lectura/escritura por rol.

**Archivos a revisar**
- `backend/src/controllers/gasto.controller.ts`
- `backend/src/controllers/gasto-recurrente.controller.ts`
- `backend/src/controllers/deuda.controller.ts`
- `backend/src/controllers/cobros.controller.ts`
- `backend/src/services/gasto.service.ts`
- `backend/src/services/cron.service.ts`
- `backend/src/cron/mensualidades.cron.ts`
- `backend/src/cron/recordatorios.cron.ts`
- `backend/src/routes/gasto.routes.ts`
- `backend/src/routes/gasto-recurrente.routes.ts`
- `backend/src/routes/deuda.routes.ts`
- `frontend/app/casero/(tabs)/cobros.tsx`
- `frontend/app/inquilino/(tabs)/gastos.tsx`
- `frontend/styles/casero/cobros.styles.ts`
- `frontend/styles/inquilino/gastos.styles.ts`

**Criterios de aceptacion**
- Tests unitarios de reparto automatico con importes que no dividen exacto.
- Tests de reparto manual con suma correcta, suma incorrecta, usuario duplicado, usuario ajeno y cuota cero.
- Tests de saldar deuda solo por deudor.
- Tests de edicion bloqueada si hay pagos registrados.
- Revision de precision monetaria documentada.
- Pantallas de casero e inquilino manejan loading, empty, error y success sin datos mock.

---

### Issue 16.6 - Revisar limpieza, inventario, anuncios, incidencias y notificaciones

**Objetivo**
Revisar modulos operativos de convivencia, especialmente flujos con estado, archivos, push y cambios de permisos.

**Alcance**
- Limpieza: zonas, asignaciones fijas, turnos, balances, presencia y transacciones.
- Inventario: items, fotos, conformidad, permisos de casero/inquilino.
- Anuncios: lectura, creacion, eliminacion y push.
- Incidencias: creacion, edicion, estado, prioridad, borrado y push.
- Uploads a Cloudinary.
- Servicios de notificacion push y manejo de errores.

**Archivos a revisar**
- `backend/src/controllers/limpieza.controller.ts`
- `backend/src/services/limpieza.service.ts`
- `backend/src/routes/limpieza.routes.ts`
- `backend/src/controllers/inventario.controller.ts`
- `backend/src/routes/inventario.routes.ts`
- `backend/src/config/cloudinary.config.ts`
- `backend/src/controllers/anuncio.controller.ts`
- `backend/src/controllers/incidencia.controller.ts`
- `backend/src/services/notification.service.ts`
- `backend/src/services/push.service.ts`
- `frontend/app/casero/(tabs)/inventario.tsx`
- `frontend/app/casero/vivienda/[id]/(tabs)/limpieza.tsx`
- `frontend/app/casero/vivienda/[id]/(tabs)/incidencias.tsx`
- `frontend/app/casero/vivienda/[id]/(tabs)/tablon.tsx`
- `frontend/app/inquilino/(tabs)/inventario.tsx`
- `frontend/app/inquilino/(tabs)/limpieza.tsx`
- `frontend/app/inquilino/(tabs)/tablon.tsx`
- `frontend/app/inquilino/nueva-incidencia.tsx`
- `frontend/app/incidencia/[id].tsx`

**Criterios de aceptacion**
- Tests de generacion de turnos y balance de limpieza.
- Tests de modulo desactivado para limpieza, inventario y gastos.
- Tests negativos de acceso a inventario ajeno.
- Tests de incidencias por rol y pertenencia.
- Uploads validan tipo, tamano, proveedor configurado y errores.
- Push fire-and-forget no rompe la operacion principal.

---

### Issue 16.7 - Revisar frontend de autenticacion, navegacion y cliente API

**Objetivo**
Revisar que la app arranque, restaure sesion, enrute por rol y maneje errores de API sin estados inconsistentes.

**Alcance**
- Layout raiz.
- Login y registro.
- Selector de rol.
- Interceptor Axios.
- Manejo de token y logout.
- Deep links de verificacion si se reactivan.
- Parametros dinamicos de Expo Router.
- Fallbacks de API URL por entorno.

**Archivos a revisar**
- `frontend/app/_layout.tsx`
- `frontend/app/index.tsx`
- `frontend/app/registro.tsx`
- `frontend/app/rol.tsx`
- `frontend/app/home.tsx`
- `frontend/app/perfil.tsx`
- `frontend/services/api.ts`
- `frontend/services/auth.service.ts`
- `frontend/hooks/useViviendaIdParam.ts`
- `frontend/app.json`
- `frontend/eas.json`

**Criterios de aceptacion**
- Tests de render y errores de login.
- Tests de redireccion por rol.
- Tests de token eliminado cuando `/auth/me` falla.
- No hay fallback peligroso a localhost en produccion sin decision documentada.
- Los parametros dinamicos se parsean de forma estable en tabs y pantallas hijas.

---

### Issue 16.8 - Revisar pantallas del casero y sus estilos

**Objetivo**
Auditar todas las pantallas del casero para corregir bugs, copy, navegacion, estados visuales, typos y deuda de componentes.

**Alcance**
- Tabs del casero.
- Detalle de vivienda y tabs internos.
- Flujos de crear/editar vivienda y habitaciones.
- Perfil de inquilino visto por casero.
- Gestor de modulos.
- Estilos asociados.

**Archivos a revisar**
- `frontend/app/casero/(tabs)/_layout.tsx`
- `frontend/app/casero/(tabs)/viviendas.tsx`
- `frontend/app/casero/(tabs)/cobros.tsx`
- `frontend/app/casero/(tabs)/inventario.tsx`
- `frontend/app/casero/(tabs)/perfil.tsx`
- `frontend/app/casero/(tabs)/tablon.tsx`
- `frontend/app/casero/_layout.tsx`
- `frontend/app/casero/nueva-vivienda.tsx`
- `frontend/app/casero/inquilino/[id].tsx`
- `frontend/app/casero/vivienda/[id]/**`
- `frontend/components/casero/vivienda/ModulosViviendaManager.tsx`
- `frontend/styles/casero/**`

**Criterios de aceptacion**
- Todas las pantallas tienen loading, error, empty y success cuando aplica.
- No quedan textos de prueba ni copy incoherente.
- No hay imports muertos ni duplicacion obvia que impida mantener.
- Se revisa cada ruta dinamica con parametros invalidos.
- Estilos usan `Theme` salvo excepciones documentadas.

---

### Issue 16.9 - Revisar pantallas del inquilino, perfil, incidencia y tablon

**Objetivo**
Auditar toda la experiencia del inquilino y pantallas compartidas para asegurar consistencia funcional y visual.

**Alcance**
- Tabs del inquilino.
- Inicio, gastos, inventario, limpieza, perfil y tablon.
- Nueva incidencia.
- Detalle de incidencia compartido.
- Tablon por vivienda.
- Perfil general.
- Estilos asociados.

**Archivos a revisar**
- `frontend/app/inquilino/(tabs)/_layout.tsx`
- `frontend/app/inquilino/(tabs)/inicio.tsx`
- `frontend/app/inquilino/(tabs)/gastos.tsx`
- `frontend/app/inquilino/(tabs)/inventario.tsx`
- `frontend/app/inquilino/(tabs)/limpieza.tsx`
- `frontend/app/inquilino/(tabs)/perfil.tsx`
- `frontend/app/inquilino/(tabs)/tablon.tsx`
- `frontend/app/inquilino/_layout.tsx`
- `frontend/app/inquilino/nueva-incidencia.tsx`
- `frontend/app/incidencia/[id].tsx`
- `frontend/app/tablon/[viviendaId].tsx`
- `frontend/app/perfil.tsx`
- `frontend/styles/inquilino/**`
- `frontend/styles/incidencia/**`
- `frontend/styles/tablon/**`
- `frontend/styles/perfil.styles.ts`

**Criterios de aceptacion**
- No hay acceso visual a modulos desactivados sin estado claro.
- El inquilino no ve datos privados de otros usuarios.
- Las confirmaciones destructivas son consistentes.
- Los formularios validan antes de llamar a API.
- Cada pantalla critica tiene test de render o queda justificada en matriz.

---

### Issue 16.10 - Revisar sistema visual, typos, copy, accesibilidad y mojibake

**Objetivo**
Corregir inconsistencias visibles y hacer que la app parezca un producto cuidado, no una suma de iteraciones.

**Alcance**
- Textos en espanol.
- Mojibake en codigo, strings y docs.
- Uso de `Theme`.
- Hex literals y magic numbers.
- Accesibilidad en botones, Pressables, iconos y estados.
- Reemplazo de `Alert.alert` donde el sistema de Toast o modal propio sea mas consistente.
- Componentes comunes y boilerplate heredado de Expo.

**Archivos a revisar**
- `frontend/constants/theme.ts`
- `frontend/constants/toastConfig.tsx`
- `frontend/components/common/**`
- `frontend/components/ui/**`
- `frontend/components/*.tsx`
- `frontend/styles/**`
- `frontend/app/**/*.tsx`
- `backend/src/**/*.ts` para strings de respuesta.
- `docs/**/*.md`

**Criterios de aceptacion**
- No quedan textos corruptos por encoding en archivos versionados.
- Hex literals fuera de `Theme` quedan migrados o justificados.
- Los botones principales tienen labels accesibles cuando sea necesario.
- El copy de errores es claro y consistente.
- Se documentan patrones visuales obligatorios para futuras PRs.

---

### Issue 16.11 - Revisar infraestructura, Docker, envs, despliegue y documentacion

**Objetivo**
Asegurar que el proyecto puede instalarse, ejecutarse, probarse y desplegarse con instrucciones fiables.

**Alcance**
- Dockerfiles.
- Docker Compose.
- Variables `.env.example`.
- Puertos y URLs por entorno.
- Prisma generate/db push.
- Scripts de build/start.
- Documentacion backend/frontend/API.
- Changelogs existentes.
- Archivos ignorados y artefactos locales.

**Archivos a revisar**
- `docker-compose.yml`
- `.env.example`
- `.gitignore`
- `backend/.env.example`
- `backend/.gitignore`
- `backend/.dockerignore`
- `backend/Dockerfile`
- `backend/package.json`
- `backend/package-lock.json`
- `frontend/.env.example`
- `frontend/.gitignore`
- `frontend/.dockerignore`
- `frontend/Dockerfile`
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/app.json`
- `frontend/eas.json`
- `README.md`
- `CONTEXT.md`
- `docs/**`

**Criterios de aceptacion**
- Setup local documentado y probado.
- Build backend documentado y ejecutable.
- Lint frontend documentado y ejecutable.
- Variables obligatorias y opcionales explicadas.
- No se versionan artefactos locales nuevos.
- La documentacion coincide con endpoints y scripts reales.

---

### Issue 16.12 - Crear suite de regresion final y checklist de release

**Objetivo**
Cerrar la epica con una comprobacion transversal que demuestre que se reviso todo el codigo y que los flujos principales siguen vivos.

**Alcance**
- Smoke tests backend de rutas principales.
- Smoke tests frontend de render/navegacion principal.
- Checklist manual de flujos de producto.
- Matriz final archivo -> issue responsable -> estado.
- Informe de riesgos residuales.

**Flujos minimos a validar**
- Registro, login, logout y restauracion de sesion.
- Casero crea vivienda y habitacion.
- Inquilino se une con codigo.
- Casero e inquilino consultan vivienda sin filtrar datos privados.
- Incidencia: crear, listar, editar estado.
- Tablon: crear, listar, eliminar si procede.
- Limpieza: configurar zona, generar turno, marcar estado.
- Gastos: crear gasto, repartir, listar deuda, saldar.
- Inventario: crear item, ver como inquilino, conformidad.
- Push y cron: no bloquean flujos si fallan servicios externos.

**Criterios de aceptacion**
- Se ejecutan todos los scripts de test/lint/build acordados.
- Se adjunta resumen de resultados en la PR.
- La matriz final cubre todos los archivos del alcance.
- Los riesgos no resueltos tienen issue propio o decision documentada.
- La epica queda lista para cerrar con changelog final.

## Comandos sugeridos para crear los issues con GitHub CLI

> Requiere `gh auth login` valido. Usar `--repo AzeDev955/Roomies`.

```powershell
gh issue create --repo AzeDev955/Roomies --title "[EPICA 16] Revision integral de calidad, seguridad y tests" --body-file docs/changelog/Epica16/epica-16-revision-calidad-tests.md
```

Para los issues hijos, copiar cada bloque `Issue 16.x` como cuerpo individual y enlazarlos desde la epica una vez creados.
