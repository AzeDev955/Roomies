import {
  PrismaClient,
  RolUsuario,
  TipoHabitacion,
  EstadoDeuda,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"]!,
});
const prisma = new PrismaClient({ adapter });

const LOCAL_CASERO_PASSWORD = process.env["SEED_CASERO_PASSWORD"];
const LOCAL_INQUILINO_PASSWORD = process.env["SEED_INQUILINO_PASSWORD"];
const DEMO_EMAIL_DOMAIN = process.env["SEED_DEMO_DOMAIN"];
const FORCE_DEMO_SEED = process.env["ROOMIES_ALLOW_PRODUCTION_SEED"] === "true";

type ParticipanteDeuda = {
  deudorId: number;
  importe: number;
  estado?: EstadoDeuda;
  justificanteUrl?: string | null;
};

const startOfMonth = (monthsAgo = 0) => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() - monthsAgo, 1, 10, 0, 0);
};

const dayOfMonth = (day: number, monthsAgo = 0) => {
  const date = startOfMonth(monthsAgo);
  date.setDate(day);
  return date;
};

const assertSeedSeguro = () => {
  const entorno = process.env["NODE_ENV"];
  const railwayEnvironment = (
    process.env["ROOMIES_APP_ENV"] ??
    process.env["RAILWAY_ENVIRONMENT_NAME"] ??
    process.env["RAILWAY_ENVIRONMENT"] ??
    ""
  ).toLowerCase();
  const isRailwayDevelopment = ["development", "dev", "desarrollo"].includes(
    railwayEnvironment,
  );
  const isRailwayNonDevelopment =
    Boolean(railwayEnvironment) && !isRailwayDevelopment;
  const isLocalProduction = entorno === "production" && !isRailwayDevelopment;

  if (!FORCE_DEMO_SEED && (isLocalProduction || isRailwayNonDevelopment)) {
    throw new Error(
      "Seed demo bloqueado fuera de entorno local o Railway development. Define ROOMIES_ALLOW_PRODUCTION_SEED=true solo para cargas controladas.",
    );
  }
};

async function crearGastoConDeudas({
  concepto,
  importe,
  fechaCreacion,
  pagadorId,
  viviendaId,
  deudas,
}: {
  concepto: string;
  importe: number;
  fechaCreacion: Date;
  pagadorId: number;
  viviendaId: number;
  deudas: ParticipanteDeuda[];
}) {
  return prisma.gasto.create({
    data: {
      concepto,
      importe,
      fecha_creacion: fechaCreacion,
      pagador_id: pagadorId,
      vivienda_id: viviendaId,
      deudas: {
        create: deudas.map((deuda) => ({
          deudor_id: deuda.deudorId,
          acreedor_id: pagadorId,
          importe: deuda.importe,
          estado: deuda.estado ?? EstadoDeuda.PENDIENTE,
          justificante_url: deuda.justificanteUrl ?? null,
        })),
      },
    },
  });
}

async function main() {
  assertSeedSeguro();

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  const casero = await prisma.usuario.upsert({
    where: { documento_identidad: "11111111A" },
    update: {
      email: `casero@${DEMO_EMAIL_DOMAIN}`,
      telefono: "600111111",
      rol: RolUsuario.CASERO,
    },
    create: {
      nombre: "Carlos",
      apellidos: "Garcia Lopez",
      documento_identidad: "11111111A",
      email: `casero@${DEMO_EMAIL_DOMAIN}`,
      password_hash: await hash(LOCAL_CASERO_PASSWORD),
      telefono: "600111111",
      rol: RolUsuario.CASERO,
    },
  });

  const inquilinosData = [
    {
      nombre: "Ana",
      apellidos: "Martinez Ruiz",
      documento_identidad: "22222222B",
      email: `ana@${DEMO_EMAIL_DOMAIN}`,
      tel: "600222222",
    },
    {
      nombre: "Bruno",
      apellidos: "Sanchez Vega",
      documento_identidad: "33333333C",
      email: `bruno@${DEMO_EMAIL_DOMAIN}`,
      tel: "600333333",
    },
    {
      nombre: "Carmen",
      apellidos: "Lopez Fuentes",
      documento_identidad: "44444444D",
      email: `carmen@${DEMO_EMAIL_DOMAIN}`,
      tel: "600444444",
    },
    {
      nombre: "Diego",
      apellidos: "Romero Iglesias",
      documento_identidad: "55555555E",
      email: `diego@${DEMO_EMAIL_DOMAIN}`,
      tel: "600555555",
    },
    {
      nombre: "Elena",
      apellidos: "Fernandez Castro",
      documento_identidad: "66666666F",
      email: `elena@${DEMO_EMAIL_DOMAIN}`,
      tel: "600666666",
    },
  ];

  const pw = await hash(LOCAL_INQUILINO_PASSWORD);
  const inquilinos = await Promise.all(
    inquilinosData.map((inquilino) =>
      prisma.usuario.upsert({
        where: { documento_identidad: inquilino.documento_identidad },
        update: {
          email: inquilino.email,
          telefono: inquilino.tel,
          rol: RolUsuario.INQUILINO,
        },
        create: {
          nombre: inquilino.nombre,
          apellidos: inquilino.apellidos,
          documento_identidad: inquilino.documento_identidad,
          email: inquilino.email,
          password_hash: pw,
          telefono: inquilino.tel,
          rol: RolUsuario.INQUILINO,
        },
      }),
    ),
  );

  const [ana, bruno, carmen, diego, elena] = inquilinos;

  const vivienda = await prisma.vivienda.upsert({
    where: { id: 1 },
    update: {},
    create: {
      casero_id: casero.id,
      alias_nombre: "Casa Testing",
      direccion: "Calle Falsa 123",
      codigo_postal: "28001",
      ciudad: "Madrid",
      provincia: "Madrid",
    },
  });

  const dormitorios = [
    {
      nombre: "Habitacion 1",
      metros: 12.0,
      inquilino: ana,
      codigo: "ROOM-TEST1",
    },
    {
      nombre: "Habitacion 2",
      metros: 10.5,
      inquilino: bruno,
      codigo: "ROOM-TEST2",
    },
    {
      nombre: "Habitacion 3",
      metros: 11.0,
      inquilino: carmen,
      codigo: "ROOM-TEST3",
    },
    {
      nombre: "Habitacion 4",
      metros: 9.5,
      inquilino: diego,
      codigo: "ROOM-TEST4",
    },
    {
      nombre: "Habitacion 5",
      metros: 13.0,
      inquilino: elena,
      codigo: "ROOM-TEST5",
    },
  ];

  for (const dormitorio of dormitorios) {
    const existing = await prisma.habitacion.findFirst({
      where: { vivienda_id: vivienda.id, nombre: dormitorio.nombre },
    });

    if (existing) {
      await prisma.habitacion.update({
        where: { id: existing.id },
        data: {
          inquilino_id: dormitorio.inquilino.id,
          tipo: TipoHabitacion.DORMITORIO,
          es_habitable: true,
          metros_cuadrados: dormitorio.metros,
          codigo_invitacion: dormitorio.codigo,
        },
      });
      continue;
    }

    await prisma.habitacion.create({
      data: {
        vivienda_id: vivienda.id,
        inquilino_id: dormitorio.inquilino.id,
        nombre: dormitorio.nombre,
        tipo: TipoHabitacion.DORMITORIO,
        es_habitable: true,
        metros_cuadrados: dormitorio.metros,
        codigo_invitacion: dormitorio.codigo,
      },
    });
  }

  const zonasComunes = [
    { nombre: "Bano 1", tipo: TipoHabitacion.BANO, metros: 5.0 },
    { nombre: "Bano 2", tipo: TipoHabitacion.BANO, metros: 4.5 },
    { nombre: "Cocina", tipo: TipoHabitacion.COCINA, metros: 14.0 },
    { nombre: "Salon", tipo: TipoHabitacion.SALON, metros: 18.0 },
  ];

  for (const zona of zonasComunes) {
    const existing = await prisma.habitacion.findFirst({
      where: { vivienda_id: vivienda.id, nombre: zona.nombre },
    });

    if (existing) {
      await prisma.habitacion.update({
        where: { id: existing.id },
        data: {
          tipo: zona.tipo,
          es_habitable: false,
          metros_cuadrados: zona.metros,
          inquilino_id: null,
          codigo_invitacion: null,
        },
      });
      continue;
    }

    await prisma.habitacion.create({
      data: {
        vivienda_id: vivienda.id,
        nombre: zona.nombre,
        tipo: zona.tipo,
        es_habitable: false,
        metros_cuadrados: zona.metros,
      },
    });
  }

  const gastosExistentes = await prisma.gasto.findMany({
    where: { vivienda_id: vivienda.id },
    select: { id: true },
  });
  const gastosIds = gastosExistentes.map((gasto) => gasto.id);

  if (gastosIds.length > 0) {
    await prisma.deuda.deleteMany({
      where: { gasto_id: { in: gastosIds } },
    });
  }

  await prisma.gasto.deleteMany({
    where: { vivienda_id: vivienda.id },
  });

  await prisma.gastoRecurrente.deleteMany({
    where: { vivienda_id: vivienda.id },
  });

  await crearGastoConDeudas({
    concepto: "Compra del supermercado",
    importe: 150,
    fechaCreacion: dayOfMonth(3),
    pagadorId: ana.id,
    viviendaId: vivienda.id,
    deudas: [
      { deudorId: bruno.id, importe: 30 },
      { deudorId: carmen.id, importe: 30, estado: EstadoDeuda.PAGADA },
      { deudorId: diego.id, importe: 30 },
      {
        deudorId: elena.id,
        importe: 30,
        estado: EstadoDeuda.PAGADA,
        justificanteUrl:
          "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      },
    ],
  });

  await crearGastoConDeudas({
    concepto: "Cena compartida del viernes",
    importe: 72,
    fechaCreacion: dayOfMonth(8),
    pagadorId: bruno.id,
    viviendaId: vivienda.id,
    deudas: [
      { deudorId: ana.id, importe: 18, estado: EstadoDeuda.PAGADA },
      { deudorId: carmen.id, importe: 18 },
      { deudorId: diego.id, importe: 18 },
    ],
  });

  await crearGastoConDeudas({
    concepto: "Internet fibra abril",
    importe: 60,
    fechaCreacion: dayOfMonth(5),
    pagadorId: casero.id,
    viviendaId: vivienda.id,
    deudas: [
      {
        deudorId: ana.id,
        importe: 12,
        estado: EstadoDeuda.PAGADA,
        justificanteUrl:
          "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      },
      { deudorId: bruno.id, importe: 12, estado: EstadoDeuda.PAGADA },
      { deudorId: carmen.id, importe: 12 },
      { deudorId: diego.id, importe: 12 },
      { deudorId: elena.id, importe: 12 },
    ],
  });

  await crearGastoConDeudas({
    concepto: "Electricidad abril",
    importe: 110,
    fechaCreacion: dayOfMonth(9),
    pagadorId: casero.id,
    viviendaId: vivienda.id,
    deudas: [
      { deudorId: ana.id, importe: 22 },
      { deudorId: bruno.id, importe: 22 },
      { deudorId: carmen.id, importe: 22, estado: EstadoDeuda.PAGADA },
      { deudorId: diego.id, importe: 22 },
      { deudorId: elena.id, importe: 22, estado: EstadoDeuda.PAGADA },
    ],
  });

  await crearGastoConDeudas({
    concepto: "Agua marzo",
    importe: 80,
    fechaCreacion: dayOfMonth(16, 1),
    pagadorId: casero.id,
    viviendaId: vivienda.id,
    deudas: [
      { deudorId: ana.id, importe: 16, estado: EstadoDeuda.PAGADA },
      { deudorId: bruno.id, importe: 16, estado: EstadoDeuda.PAGADA },
      { deudorId: carmen.id, importe: 16, estado: EstadoDeuda.PAGADA },
      { deudorId: diego.id, importe: 16, estado: EstadoDeuda.PAGADA },
      { deudorId: elena.id, importe: 16, estado: EstadoDeuda.PAGADA },
    ],
  });

  await prisma.gastoRecurrente.createMany({
    data: [
      {
        concepto: "Alquiler mensual",
        importe: 1800,
        dia_del_mes: 1,
        vivienda_id: vivienda.id,
        pagador_id: casero.id,
        activo: true,
      },
      {
        concepto: "Internet fibra",
        importe: 60,
        dia_del_mes: 5,
        vivienda_id: vivienda.id,
        pagador_id: casero.id,
        activo: true,
      },
      {
        concepto: "Cuota limpieza portal",
        importe: 35,
        dia_del_mes: 15,
        vivienda_id: vivienda.id,
        pagador_id: casero.id,
        activo: false,
      },
    ],
  });

  console.log(`
✅ Seed completado - Casa Testing (id: ${vivienda.id})

  Casero:
    casero@${DEMO_EMAIL_DOMAIN} / ${LOCAL_CASERO_PASSWORD}

  Inquilinos (password: ${LOCAL_INQUILINO_PASSWORD}):
    ana@${DEMO_EMAIL_DOMAIN}    -> Habitacion 1
    bruno@${DEMO_EMAIL_DOMAIN}  -> Habitacion 2
    carmen@${DEMO_EMAIL_DOMAIN} -> Habitacion 3
    diego@${DEMO_EMAIL_DOMAIN}  -> Habitacion 4
    elena@${DEMO_EMAIL_DOMAIN}  -> Habitacion 5

  Datos de prueba creados:
    - 5 gastos con deudas pendientes y pagadas
    - 3 mensualidades (2 activas y 1 inactiva)
    - deudas del casero para probar cobros y justificantes
    - deudas entre inquilinos para probar balance del piso
  `);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
