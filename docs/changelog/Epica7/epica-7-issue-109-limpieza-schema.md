# Épica 7 — Schema: Sistema de Reparto de Limpieza Semanal

**Fecha:** 2026-04-03  
**Rama:** dev  
**Archivos modificados:** 1 (`backend/prisma/schema.prisma`)

---

## Resumen

Añade al schema de Prisma la capa de datos completa para soportar un algoritmo de reparto de limpieza asimétrico y justo entre los inquilinos de una vivienda. Ningún endpoint ni migración se aplica en esta iteración — solo el modelo de datos.

---

## Nuevos modelos

### `ZonaLimpieza`

Representa un área limpiable dentro de una vivienda (Cocina, Baño 1, Pasillo, etc.).

| Campo        | Tipo    | Notas                                                        |
|--------------|---------|--------------------------------------------------------------|
| `id`         | Int PK  | autoincrement                                                |
| `vivienda_id`| FK      | La zona pertenece a la vivienda, no a una habitación concreta |
| `nombre`     | String  | Nombre libre: "Cocina", "Baño compartido", "Pasillo"        |
| `peso`       | Float   | Esfuerzo relativo (ej. Cocina = 10, Pasillo = 3)            |
| `activa`     | Boolean | `true` por defecto. `false` excluye la zona del reparto      |

**Decisión de diseño — FK a `Vivienda` (no a `Habitacion`):** las zonas de limpieza son áreas funcionales del piso compartido, no habitaciones del modelo de datos. Vincularlas a `Vivienda` evita ambigüedad: una zona "Cocina" no es la misma entidad que la `Habitacion` tipo `COCINA`, que existe por razones de invitación/incidencias.

---

### `AsignacionLimpiezaFija`

Tabla relacional para los "Baños Asignados": una zona que **siempre** limpia el mismo inquilino, al margen de la rotación global.

| Campo       | Tipo | Notas                                                                |
|-------------|------|----------------------------------------------------------------------|
| `zona_id`   | FK   | La zona fijada                                                       |
| `usuario_id`| FK   | El inquilino responsable permanente                                  |
| `@@unique`  | —    | Constraint `(zona_id, usuario_id)` — no puede existir el mismo par dos veces |

**Cómo resuelve los "Baños Asignados":** el algoritmo de reparto consultará esta tabla antes de generar los `TurnoLimpieza`. Si una zona tiene una `AsignacionLimpiezaFija`, se genera directamente el turno para ese usuario sin entrar en la rotación. Su `peso` **sí** se suma al `balance_limpieza` del usuario para garantizar equidad matemática global.

---

### `TurnoLimpieza`

Registro semanal del reparto. El algoritmo genera un `TurnoLimpieza` por zona activa al inicio de cada semana.

| Campo         | Tipo        | Notas                                           |
|---------------|-------------|-------------------------------------------------|
| `usuario_id`  | FK          | A quién le toca                                 |
| `zona_id`     | FK          | Qué zona                                        |
| `fecha_inicio`| DateTime    | Lunes de la semana                              |
| `fecha_fin`   | DateTime    | Domingo de la semana                            |
| `estado`      | EstadoTurno | `PENDIENTE` → `HECHO` / `NO_HECHO`              |

**`EstadoTurno` y penalizaciones:** si la semana termina con estado `PENDIENTE`, el proceso de cierre semanal lo marcará `NO_HECHO`. Esto alimenta un sistema de penalizaciones futuro (deuda de balance adicional).

---

## Campos añadidos a modelos existentes

### `Usuario`

| Campo              | Tipo           | Valor por defecto | Propósito                                                                                      |
|--------------------|----------------|-------------------|-----------------------------------------------------------------------------------------------|
| `balance_limpieza` | Float          | `0`               | Acumula deuda (+) o crédito (−) de esfuerzo cuando los pesos no son divisibles equitativamente |
| `estado_presencia` | EstadoPresencia| `ACTIVO`          | El algoritmo excluye del reparto a usuarios en `AUSENTE_VACACIONES`                           |

**Cómo resuelve el "Descuadre Matemático":** supongamos 3 inquilinos y zonas con pesos [10, 7, 3] = 20 puntos totales. 20 / 3 = 6.67. El algoritmo asigna teniendo en cuenta `balance_limpieza`: al usuario con crédito acumulado se le asigna más trabajo la semana siguiente; al usuario con deuda, menos. El balance se actualiza al final de cada semana sumando `(peso_asignado − cuota_ideal)` a cada usuario. A largo plazo converge a 0 para todos.

### `Vivienda`

Añadida la relación inversa `zonas_limpieza ZonaLimpieza[]`.

---

## Nuevos enums

| Enum              | Valores                         |
|-------------------|---------------------------------|
| `EstadoPresencia` | `ACTIVO`, `AUSENTE_VACACIONES`  |
| `EstadoTurno`     | `PENDIENTE`, `HECHO`, `NO_HECHO`|

---

## Diagrama de interacción

```
Vivienda
  └─ ZonaLimpieza (peso, activa)
       ├─ AsignacionLimpiezaFija → Usuario   [zona fija: bypass rotación]
       └─ TurnoLimpieza → Usuario            [semana concreta]

Usuario
  ├─ balance_limpieza: Float                 [deuda/crédito acumulado]
  └─ estado_presencia: ACTIVO | AUSENTE_VACACIONES
```

**Flujo del algoritmo (futuro):**
1. Obtener zonas activas de la vivienda.
2. Para cada zona con `AsignacionLimpiezaFija` → crear `TurnoLimpieza` directo para ese usuario.
3. Para el resto de zonas → ordenar inquilinos por `balance_limpieza` (mayor deuda = más turno esta semana) y asignar.
4. Al cerrar la semana → actualizar `balance_limpieza` de cada usuario con `peso_asignado − cuota_ideal`.
5. Los usuarios `AUSENTE_VACACIONES` no reciben turno; su cuota se redistribuye proporcionalmente.
