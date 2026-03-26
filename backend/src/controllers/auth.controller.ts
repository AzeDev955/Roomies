import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { RolUsuario } from '../generated/prisma/client';

export const register: express.RequestHandler = async (req, res) => {
  const { nombre, apellidos, dni, email, password, telefono, rol } = req.body as {
    nombre: string;
    apellidos: string;
    dni: string;
    email: string;
    password: string;
    telefono?: string;
    rol: RolUsuario;
  };

  const existing = await prisma.usuario.findFirst({
    where: { OR: [{ email }, { dni }] },
  });

  if (existing) {
    res.status(400).json({ error: 'El email o DNI ya está registrado.' });
    return;
  }

  const password_hash = await bcrypt.hash(password, 10);

  const usuario = await prisma.usuario.create({
    data: { nombre, apellidos, dni, email, password_hash, telefono, rol },
  });

  const { password_hash: _omit, ...usuarioSinPassword } = usuario;
  res.status(201).json(usuarioSinPassword);
};
