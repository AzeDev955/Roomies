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
- [ ] Formulario para envio a posible inquilino.
## ⚙️ Instalación y Configuración Local

*(Nota: Estas instrucciones se irán actualizando conforme el proyecto avance)*

### Prerrequisitos
* [Node.js](https://nodejs.org/) (v18 o superior)
* [Expo CLI](https://docs.expo.dev/)
* [PostgreSQL](https://www.postgresql.org/)

### Backend (API)
1. Navega a la carpeta del backend: `cd backend`
2. Instala las dependencias: `npm install`
3. Copia el archivo `.env.example` a `.env` y configura tu conexión a la base de datos.
4. Ejecuta las migraciones de Prisma: `npx prisma db push`
5. Inicia el servidor de desarrollo: `npm run dev`

### Frontend (App)
1. Navega a la carpeta del frontend: `cd frontend`
2. Instala las dependencias: `npm install`
3. Inicia la aplicación de Expo: `npx expo start`
4. Escanea el código QR con la app **Expo Go** en tu dispositivo físico o usa un emulador.

---
*Desarrollado con ☕ y código.*

## 📋 Registro de Desarrollo

El historial de cambios por issue/épica está en [`docs/changelog/`](docs/changelog/).
