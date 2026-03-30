import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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

export const obtenerMiPerfil: express.RequestHandler = async (req, res) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.usuario!.id },
    select: { id: true, nombre: true, apellidos: true, email: true, rol: true, telefono: true },
  });
  if (!usuario) {
    res.status(404).json({ error: 'Usuario no encontrado.' });
    return;
  }
  res.status(200).json(usuario);
};

export const login: express.RequestHandler = async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  const usuario = await prisma.usuario.findUnique({
    where: { email },
  });

  if (!usuario) {
    res.status(401).json({ error: 'Credenciales inválidas.' });
    return;
  }

  const passwordOk = await bcrypt.compare(password, usuario.password_hash);

  if (!passwordOk) {
    res.status(401).json({ error: 'Credenciales inválidas.' });
    return;
  }

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env['JWT_SECRET']!,
    { expiresIn: '7d' }
  );

  const { password_hash: _omit, ...usuarioSinPassword } = usuario;
  res.status(200).json({ token, usuario: usuarioSinPassword });
};
