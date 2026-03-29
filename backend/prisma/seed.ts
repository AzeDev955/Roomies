import { PrismaClient, RolUsuario } from '../src/generated/prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
      rol: RolUsuario.INQUILINO,
    },
  });

  console.log('Seed completado: casero@test.com / inquilino@test.com');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
