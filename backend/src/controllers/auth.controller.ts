import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma';
import { RolUsuario } from '../generated/prisma/client';
import { getGoogleClientId, getJwtSecret } from '../config/env';

function firmarTokenAutenticacion(usuario: { id: number; rol: RolUsuario }): string {
  return jwt.sign({ id: usuario.id, rol: usuario.rol }, getJwtSecret(), { expiresIn: '7d' });
}

function serializarUsuarioSeguro<T extends { password_hash?: unknown; token_verificacion?: unknown }>(
  usuario: T
): Omit<T, 'password_hash' | 'token_verificacion'> {
  const { password_hash: _passwordHash, token_verificacion: _tokenVerificacion, ...usuarioSeguro } = usuario;
  return usuarioSeguro;
}

export const register: express.RequestHandler = async (req, res) => {
  const { nombre, apellidos, documento_identidad, email, password, telefono, rol } = req.body as {
    nombre: string;
    apellidos: string;
    documento_identidad: string;
    email: string;
    password: string;
    telefono: string;
    rol: RolUsuario;
  };

  const existing = await prisma.usuario.findFirst({
    where: { OR: [{ email }, { documento_identidad }] },
  });

  if (existing) {
    const campoDuplicado =
      existing.email === email ? 'email' : existing.documento_identidad === documento_identidad ? 'documento de identidad' : 'email o documento de identidad';
    res.status(400).json({ error: `El ${campoDuplicado} ya esta registrado.` });
    return;
  }

  const password_hash = await bcrypt.hash(password, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      apellidos,
      documento_identidad,
      email,
      password_hash,
      telefono,
      rol,
      correo_verificado: true,
    },
  });

  const token = firmarTokenAutenticacion(usuario);
  res.status(201).json({ token, usuario: serializarUsuarioSeguro(usuario) });
};

export const verificarEmail: express.RequestHandler = async (req, res) => {
  const { token } = req.params as { token: string };

  const usuario = await prisma.usuario.findFirst({
    where: { token_verificacion: token },
  });

  if (!usuario) {
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8"><title>Enlace invalido</title></head>
      <body style="font-family:Arial,sans-serif;text-align:center;padding:60px;color:#212529;">
        <h2 style="color:#FF3B30;">Enlace invalido o expirado</h2>
        <p>Este enlace de verificacion no existe o ya fue utilizado.</p>
      </body>
      </html>
    `);
    return;
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { correo_verificado: true, token_verificacion: null },
  });

  res.redirect('roomies://verificacion?status=success');
};

export const login: express.RequestHandler = async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  const usuario = await prisma.usuario.findUnique({
    where: { email },
  });

  if (!usuario) {
    res.status(401).json({ error: 'Credenciales invalidas.' });
    return;
  }

  if (!usuario.password_hash) {
    res.status(401).json({ error: 'Esta cuenta usa Google para iniciar sesion.' });
    return;
  }

  // Guard de correo_verificado deshabilitado temporalmente: decision documentada en Epica 16 issue 247.
  // if (!usuario.correo_verificado) {
  //   res.status(403).json({ error: 'Debes verificar tu correo antes de iniciar sesion.' });
  //   return;
  // }

  const passwordOk = await bcrypt.compare(password, usuario.password_hash);

  if (!passwordOk) {
    res.status(401).json({ error: 'Credenciales invalidas.' });
    return;
  }

  const token = firmarTokenAutenticacion(usuario);
  res.status(200).json({ token, usuario: serializarUsuarioSeguro(usuario) });
};

export const loginConGoogle: express.RequestHandler = async (req, res) => {
  const { idToken } = req.body as { idToken: string };
  const googleClientId = getGoogleClientId();
  const client = new OAuth2Client(googleClientId);

  const ticket = await client.verifyIdToken({
    idToken,
    audience: googleClientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.email) {
    res.status(401).json({ error: 'Token de Google invalido.' });
    return;
  }

  const { email, given_name, family_name, sub: googleId } = payload;

  let usuario = await prisma.usuario.findFirst({
    where: { OR: [{ google_id: googleId }, { email }] },
  });

  let esNuevo = false;

  if (!usuario) {
    esNuevo = true;
    usuario = await prisma.usuario.create({
      data: {
        nombre: given_name ?? email.split('@')[0],
        apellidos: family_name ?? null,
        email,
        google_id: googleId,
        rol: RolUsuario.INQUILINO,
        correo_verificado: true,
      },
    });
  } else if (!usuario.google_id) {
    usuario = await prisma.usuario.update({
      where: { id: usuario.id },
      data: { google_id: googleId, correo_verificado: true },
    });
  }

  const token = firmarTokenAutenticacion(usuario);
  res.status(200).json({ token, usuario: serializarUsuarioSeguro(usuario), esNuevo });
};

export const actualizarRol: express.RequestHandler = async (req, res) => {
  const { rol } = req.body as { rol: RolUsuario };

  if (!rol || !Object.values(RolUsuario).includes(rol)) {
    res.status(400).json({ error: 'rol debe ser CASERO o INQUILINO.' });
    return;
  }

  const usuario = await prisma.usuario.update({
    where: { id: req.usuario!.id },
    data: { rol },
  });

  const token = firmarTokenAutenticacion(usuario);
  res.status(200).json({ token, usuario: serializarUsuarioSeguro(usuario) });
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
