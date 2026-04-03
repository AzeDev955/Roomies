# Épica 7 — Issue #130 (Fase 5): Algoritmo de Reparto Semanal de Limpieza

**Fecha:** 2026-04-03  
**Rama:** dev  
**Archivos creados/modificados:** 3

---

## Resumen

Implementa el motor matemático de reparto de limpieza y cierra el endpoint DELETE pendiente de la Fase 4. El algoritmo asigna zonas semanalmente de forma justa y asimétrica, respetando zonas fijas (baños asignados), priorizando bloques de mayor esfuerzo y corrigiendo desviaciones acumuladas mediante un sistema de balance (karma).

---

## Archivos

### `backend/src/services/limpieza.service.ts` (nuevo)

Servicio puro sin dependencia de Express. Exporta `generarTurnosSemanales(viviendaId)`.

#### Función auxiliar `getProximaSemana()`

Calcula el rango lunes–domingo de la próxima semana ISO:

```
diaSemana = hoy.getDay()   // 0=Dom, 1=Lun … 6=Sáb
diasHastaLunes = diaSemana === 0 ? 1 : 8 - diaSemana
```

Lunes a las 00:00:00 y domingo a las 23:59:59 — así `fecha_inicio` y `fecha_fin` cubren exactamente la semana completa sin solapamiento.

#### Guard anti-duplicados

Antes de ejecutar el algoritmo, cuenta `TurnoLimpieza` existentes para esa `vivienda_id` con la misma `fecha_inicio`. Si ya existen, lanza un error que el controlador devuelve como 400. Esto evita doble generación si el casero pulsa el botón dos veces.

---

#### Algoritmo de tres fases

**Datos de entrada:**
- `usuariosActivos`: inquilinos con `estado_presencia === ACTIVO` que tienen habitación en la vivienda.
- `zonas`: zonas con `activa === true`, ordenadas **desc por peso** (bloques grandes primero).
- `cargaSemanal`: `Map<usuario_id, number>` inicializado a 0 para cada usuario activo.

---

**Fase A — Zonas fijas**

Para cada zona con `AsignacionLimpiezaFija` cuyo `usuario_id` está en `activeUserIds`:
1. Crea un `TurnoData` directo sin participar en la rotación.
2. Suma el `peso` de la zona a `cargaSemanal[usuario_id]`.

Si el usuario asignado está **AUSENTE** (no está en `activeUserIds`), la zona pasa a Fase B. Esto garantiza que un piso con inquilino de vacaciones no quede sin limpiar.

---

**Fase B — Zonas rotativas (algoritmo greedy con karma)**

Las zonas sin asignación fija válida se procesan en orden de mayor a menor peso (ya viene de la query):

Para cada zona:
```
carga_efectiva(usuario) = cargaSemanal[usuario] + balance_limpieza_bd[usuario]
usuario_elegido = argmin(carga_efectiva)
```

El `balance_limpieza` de la BD aporta la "deuda histórica" de semanas anteriores. Un usuario que la semana pasada trabajó más de su cuota tiene un balance positivo (deuda), por lo que su `carga_efectiva` es mayor → se le asignan menos zonas esta semana. El efecto es una convergencia automática hacia la equidad a lo largo del tiempo.

El procesamiento de mayor a menor peso (greedy) garantiza que los bloques de mayor esfuerzo se asignen primero al usuario con más "margen", evitando que un usuario acumule varias zonas pesadas mientras otro solo tiene zonas ligeras.

---

**Fase C — Karma (actualización de balance)**

```
cuota_ideal = pesoTotal / numUsuariosActivos
nuevo_balance[u] = balance_anterior[u] + (carga_asignada[u] − cuota_ideal)
```

Ejemplo con 3 usuarios y pesos [10, 7, 3] (total = 20):
- `cuota_ideal` = 20 / 3 = 6.67
- Si a Ana le tocan zonas con peso 10 → `balance += 10 − 6.67 = +3.33` (tiene "deuda")
- Si a Luis le tocan zonas con peso 7 → `balance += 7 − 6.67 = +0.33`
- Si a Marta le tocan zonas con peso 3 → `balance += 3 − 6.67 = −3.67` (tiene "crédito")

La semana siguiente, la Fase B verá que Ana tiene el mayor balance acumulado y le asignará las zonas más ligeras para compensar.

---

#### Transacción atómica (`prisma.$transaction`)

```typescript
await prisma.$transaction([
  prisma.turnoLimpieza.createMany({ data: turnos }),
  ...actualizacionesBalance,   // un update por usuario activo
]);
```

**Por qué una transacción:** si el `createMany` tiene éxito pero algún `update` de balance falla (error de red, constraint, etc.), los turnos quedarían en BD sin que los balances reflejen la semana. El próximo intento generaría turnos duplicados (bloqueados por el guard) pero con balances incorrectos. La transacción garantiza que o se persiste todo o no se persiste nada — el estado de la BD queda siempre consistente.

---

### `backend/src/controllers/limpieza.controller.ts`

**`quitarAsignacionFija` (nuevo):**
- `DELETE /viviendas/:id/limpieza/zonas/:zonaId/asignacion`
- Verifica propiedad de vivienda y existencia de zona.
- Busca la `AsignacionLimpiezaFija` por `zona_id` (hay máximo una por zona).
- La elimina y responde 204. Si no existía, 404.

**`generarTurnos` (nuevo):**
- `POST /viviendas/:id/limpieza/generar`
- Verifica propiedad de vivienda.
- Delega en `generarTurnosSemanales`. Los errores de negocio (ya generados, sin inquilinos, sin zonas) se capturan y devuelven como 400 con el mensaje del `throw`.

---

### `backend/src/routes/limpieza.routes.ts`

Dos nuevas rutas:
```
DELETE /viviendas/:id/limpieza/zonas/:zonaId/asignacion  →  quitarAsignacionFija
POST   /viviendas/:id/limpieza/generar                   →  generarTurnos
```

---

## Decisiones técnicas

- **Servicio separado del controlador**: `limpieza.service.ts` contiene toda la lógica matemática, testeable de forma aislada sin montar Express. El controlador solo maneja auth, parsing de params y serialización HTTP.
- **Greedy de mayor a menor peso**: un greedy de menor a mayor dejaría las zonas pesadas para el final, cuando los usuarios ya tienen carga acumulada y la diferencia entre ellos es pequeña → peor distribución. Procesando de mayor a menor, los bloques grandes se "encajan" primero en el usuario con más espacio disponible.
- **`carga_efectiva = cargaSemanal + balance_bd`**: combinar la carga de esta semana con el balance histórico hace que el algoritmo corrija automáticamente injusticias de semanas pasadas sin necesidad de lógica adicional.
- **Guard de duplicados por `fecha_inicio`**: más robusto que comparar con "esta semana" porque funciona aunque el casero genere los turnos con antelación (ej. el jueves para la semana siguiente).


---

## Actualización — Motor incremental y paginación de calendario (2026-04-03)

### `backend/src/services/limpieza.service.ts`

**Eliminado**: el guard anti-duplicados (`if existentes > 0 throw Error`).

**Eliminado**: `getProximaSemana()` (siempre apuntaba a la semana siguiente a la actual).

**Añadido**: `getLunesDeSemana(fecha: Date)` — calcula el lunes 00:00 de la semana ISO que contiene `fecha`, usando `(getDay() + 6) % 7` para convertir el domingo-0 de JS al lunes-0 ISO.

**Nueva lógica de fecha objetivo** en `generarTurnosSemanales`:
1. Busca el turno más reciente de la vivienda (`findFirst orderBy fecha_inicio desc`).
2. Si no existe ninguno, o si `fecha_inicio < lunesHoy` (historial antiguo) → `inicio = lunesHoy` (semana actual).
3. Si existe y `fecha_inicio >= lunesHoy` → `inicio = lunesUltimo + 7 días` (semana siguiente al último bloque generado).

Resultado: el casero puede pulsar el botón N veces y genera N semanas consecutivas sin error, empezando siempre desde donde lo dejó.

### `backend/src/controllers/limpieza.controller.ts` — `obtenerTurnos`

Añadido soporte para `req.query.fecha` (formato `YYYY-MM-DD`). Si se envía, la semana objetivo (lunes–domingo) se calcula usando esa fecha como referencia. Si no se envía, se usa `new Date()` (semana actual). El cálculo es idéntico en ambos casos: `(base.getDay() + 6) % 7` para hallar el lunes.

### `frontend/app/casero/vivienda/[id]/(tabs)/limpieza.tsx`

**Estado añadido**: `fechaObjetivo: Date` — inicializado al lunes de la semana actual. Persiste entre cambios de vista.

**`navegar(direccion: -1 | 1)`**: suma/resta 7 días a `fechaObjetivo` con `setDate`. El `useEffect([vistaActual, fechaObjetivo])` reacciona y llama a `cargarTurnos(fechaObjetivo)`.

**`cargarTurnos(fecha?)`**: construye `?fecha=YYYY-MM-DD` a partir de `fecha.toISOString().split('T')[0]` y lo pasa al endpoint.

**Vista Calendario — nuevo header de navegación** (`semanaNav`): fila `‹ [etiqueta] ›` con `Pressable` en los extremos. `getSemanaLabel(base)` ahora recibe la fecha como argumento en lugar de calcularla internamente.

**Empty state en Calendario**: en lugar de ocultar la vista, muestra `"No hay turnos para esta semana"` + `<CustomButton>` "Generar turnos" inline para que el casero no tenga que cambiar de pestaña.

**Botón general renombrado**: `"Generar Turnos Semanales (Test)"` → `"Generar siguiente semana de turnos"`. Tras generar, muestra un Toast con éxito sin cambiar la vista ni la fecha objetivo, dejando al casero libre de navegar al calendario cuando quiera.

### Decisiones técnicas

- **Sin `throw` en el servicio por duplicados**: el motor incremental hace innecesario el guard — si ya existe la semana actual, calcula la siguiente automáticamente. Responsabilidad de detección de duplicados eliminada del dominio.
- **`getLunesDeSemana` en lugar de `getProximaSemana`**: una función pura y reutilizable que acepta cualquier `Date` es más testeable y flexible que una que siempre lee `new Date()` internamente.
- **`fechaObjetivo` en el frontend, no como string**: mantener la fecha como `Date` en el estado facilita `setDate(+7/-7)` sin parsing/formatting intermedio; solo se convierte a string en el momento de la llamada HTTP.
- **Toast en lugar de `Alert.alert` tras generar**: `Alert` requiere interacción del usuario (tap en "OK") lo que bloquea el flujo. Toast es no-bloqueante y coherente con el resto de notificaciones de la app.
