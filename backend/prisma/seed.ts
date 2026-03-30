import { PrismaClient, RolUsuario } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 10);

  await prisma.usuario.upsert({
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

  await prisma.usuario.upsert({
    where: { email: 'inquilino@test.com' },
    update: {},
    create: {
      nombre: 'Ana',
      apellidos: 'Martínez Ruiz',
      dni: '22222222B',
      email: 'inquilino@test.com',
      password_hash: await hash('inquilino123'),
      telefono: '600222222',
      rol: RolUsuario.INQUILINO,
    },
  });

  console.log('Seed completado: casero@test.com / inquilino@test.com');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
