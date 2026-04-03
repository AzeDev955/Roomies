import { PrismaClient, RolUsuario, TipoHabitacion } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // ── Casero ───────────────────────────────────────────────────────────────────
  const casero = await prisma.usuario.upsert({
    where: { email: 'casero@test.com' },
    update: {},
    create: {
      nombre: 'Carlos',
      apellidos: 'García López',
      dni: '11111111A',
      email: 'casero@test.com',
      password_hash: await hash('casero123'),
      telefono: '600111111',
      rol: RolUsuario.CASERO,
    },
  });

  // ── Inquilinos ───────────────────────────────────────────────────────────────
  const inquilinosData = [
    { nombre: 'Ana',    apellidos: 'Martínez Ruiz',    dni: '22222222B', email: 'ana@test.com',    tel: '600222222' },
    { nombre: 'Bruno',  apellidos: 'Sánchez Vega',     dni: '33333333C', email: 'bruno@test.com',  tel: '600333333' },
    { nombre: 'Carmen', apellidos: 'López Fuentes',    dni: '44444444D', email: 'carmen@test.com', tel: '600444444' },
    { nombre: 'Diego',  apellidos: 'Romero Iglesias',  dni: '55555555E', email: 'diego@test.com',  tel: '600555555' },
    { nombre: 'Elena',  apellidos: 'Fernández Castro', dni: '66666666F', email: 'elena@test.com',  tel: '600666666' },
  ];

  const pw = await hash('inquilino123');
  const inquilinos = await Promise.all(
    inquilinosData.map((i) =>
      prisma.usuario.upsert({
        where: { email: i.email },
        update: {},
        create: {
          nombre: i.nombre,
          apellidos: i.apellidos,
          dni: i.dni,
          email: i.email,
          password_hash: pw,
          telefono: i.tel,
          rol: RolUsuario.INQUILINO,
        },
      })
    )
  );

  // ── Vivienda ─────────────────────────────────────────────────────────────────
  const vivienda = await prisma.vivienda.upsert({
    where: { id: 1 },
    update: {},
    create: {
      casero_id: casero.id,
      alias_nombre: 'Casa Testing',
      direccion: 'Calle Falsa 123',
      codigo_postal: '28001',
      ciudad: 'Madrid',
      provincia: 'Madrid',
    },
  });

  // ── Habitaciones habitables (5 dormitorios, uno por inquilino) ───────────────
  const dormitorios = [
    { nombre: 'Habitación 1', metros: 12.0, inquilino: inquilinos[0] },
    { nombre: 'Habitación 2', metros: 10.5, inquilino: inquilinos[1] },
    { nombre: 'Habitación 3', metros: 11.0, inquilino: inquilinos[2] },
    { nombre: 'Habitación 4', metros: 9.5,  inquilino: inquilinos[3] },
    { nombre: 'Habitación 5', metros: 13.0, inquilino: inquilinos[4] },
  ];

  for (const d of dormitorios) {
    const existing = await prisma.habitacion.findFirst({
      where: { vivienda_id: vivienda.id, nombre: d.nombre },
    });
    if (!existing) {
      await prisma.habitacion.create({
        data: {
          vivienda_id: vivienda.id,
          inquilino_id: d.inquilino.id,
          nombre: d.nombre,
          tipo: TipoHabitacion.DORMITORIO,
          es_habitable: true,
          metros_cuadrados: d.metros,
          codigo_invitacion: `ROOM-TEST${dormitorios.indexOf(d) + 1}`,
        },
      });
    }
  }

  // ── Zonas comunes (no habitables) ────────────────────────────────────────────
  const zonesComunes = [
    { nombre: 'Baño 1',  tipo: TipoHabitacion.BANO,   metros: 5.0  },
    { nombre: 'Baño 2',  tipo: TipoHabitacion.BANO,   metros: 4.5  },
    { nombre: 'Cocina',  tipo: TipoHabitacion.COCINA,  metros: 14.0 },
  ];

  for (const z of zonesComunes) {
    const existing = await prisma.habitacion.findFirst({
      where: { vivienda_id: vivienda.id, nombre: z.nombre },
    });
    if (!existing) {
      await prisma.habitacion.create({
        data: {
          vivienda_id: vivienda.id,
          nombre: z.nombre,
          tipo: z.tipo,
          es_habitable: false,
          metros_cuadrados: z.metros,
        },
      });
    }
  }

  console.log(`
✅ Seed completado — Casa Testing (id: ${vivienda.id})

  Casero:
    casero@test.com / casero123

  Inquilinos (password: inquilino123):
    ana@test.com    → Habitación 1
    bruno@test.com  → Habitación 2
    carmen@test.com → Habitación 3
    diego@test.com  → Habitación 4
    elena@test.com  → Habitación 5
  `);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
