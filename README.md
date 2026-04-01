# 🏠 Roomies

Aplicación integral para la gestión de alquiler de habitaciones y co-living. Conecta a caseros e inquilinos para facilitar la convivencia, centralizar el reporte de incidencias y automatizar la gestión del día a día.

## 🚀 Características (MVP)

La aplicación cuenta con dos perfiles de usuario bien diferenciados:

### 👑 Para el Casero / Gestor
* **Gestión Multipropiedad:** Creación y administración de diferentes viviendas y sus respectivas habitaciones.
* **Códigos de Invitación:** Generación de códigos únicos para vincular a los inquilinos con su habitación exacta.
* **Centro de Incidencias:** Panel de control para recibir, gestionar y cambiar el estado (Pendiente, En Proceso, Resuelto) de los problemas reportados en las viviendas.

### 🛋️ Para el Inquilino
* **Mi Espacio:** Vista rápida de la información de su vivienda y habitación.
* **Reporte Rápido:** Formulario ágil para reportar incidencias directamente al casero, evitando la fricción de los mensajes informales.
* **Seguimiento:** Visualización del estado de sus reportes en tiempo real.

## 🛠️ Stack Tecnológico

El proyecto está dividido en dos repositorios/carpetas principales:

* **Frontend (Mobile App):** React Native + Expo.
* **Backend (API REST):** Node.js + Express.
* **Base de Datos:** PostgreSQL (gestionada mediante Prisma ORM).

## 🗺️ Roadmap (Próximas versiones)
- [ ] Módulo de limpieza: Asignación de tareas semanales rotativas.
- [ ] Recordatorios de pago automáticos.
- [ ] Chat integrado Inquilino <-> Casero.
- [ ] Tablón de anuncios para la vivienda.

## ☁️ Despliegue en Producción (Railway)

El backend y la base de datos pueden desplegarse en [Railway](https://railway.app) sin servidor propio. Ver los pasos completos en [`docs/backend/setup.md → Despliegue en Railway`](docs/backend/setup.md#despliegue-en-railway).

Una vez obtenido el dominio público del backend, actualiza `frontend/.env`:

```env
EXPO_PUBLIC_API_URL=https://<tu-dominio>.up.railway.app/api
```

Y reinicia Metro desde `frontend/` para hornear la nueva URL en el bundle:

```bash
npx expo start --clear
```

---

## ⚙️ Levantar el entorno con Docker (recomendado)

La forma más rápida de tener todo funcionando es con Docker Compose.

### Prerrequisitos
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Pasos

1. Edita `docker-compose.yml` y reemplaza `<TU_IP_LOCAL>` en la variable `EXPO_PUBLIC_API_URL` del servicio `frontend` por la IP de tu máquina en la red local (ej: `192.168.1.50`).
   * Windows: `ipconfig` → IPv4 de tu adaptador de red
   * Mac/Linux: `ifconfig` o `ip addr`

2. Levanta todos los servicios:
   ```bash
   docker-compose up --build
   ```

Esto arrancará tres servicios:
| Servicio | Puerto | Descripción |
|---|---|---|
| `db` | 5432 | PostgreSQL 15 con volumen persistente |
| `backend` | 3000 | API Express — aplica el schema automáticamente al arrancar |
| `frontend` | 8081 | Metro bundler de Expo — escanea el QR con Expo Go |

> **Dispositivo físico:** el QR de Expo usará la IP de la red del contenedor. Si no conecta, establece la variable `REACT_NATIVE_PACKAGER_HOSTNAME=<TU_IP_LOCAL>` en el servicio `frontend` del compose.

### Seeder (usuarios de prueba)

Con el backend corriendo, ejecuta en otra terminal:
```bash
docker-compose exec backend npx prisma db seed
```

Credenciales creadas:
| Rol | Email | Contraseña |
|---|---|---|
| CASERO | `casero@test.com` | `casero123` |
| INQUILINO | `inquilino@test.com` | `inquilino123` |

---

## ⚙️ Instalación Manual (sin Docker)

### Prerrequisitos
* [Node.js](https://nodejs.org/) (v20 o superior)
* [Expo Go](https://expo.dev/go) en el móvil, o un emulador Android/iOS
* PostgreSQL accesible (local o Prisma Postgres via `npx prisma dev`)

### Backend (API)
1. `cd backend && npm install`
2. Copia `.env.example` a `.env` y configura `DATABASE_URL` con una URL estándar `postgresql://...`
3. `npx prisma db push`
4. `npm run dev`

### Frontend (App)
1. `cd frontend && npm install`
2. `npx expo start`
3. Escanea el código QR con **Expo Go** o pulsa `a` / `i` para el emulador.

---
*Desarrollado con ☕ y código.*

## 📋 Registro de Desarrollo

El historial de cambios por issue/épica está en [`docs/changelog/`](docs/changelog/).
