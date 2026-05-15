import { z } from 'zod';

const LETRAS_DNI = 'TRWAGMYFPDXBNJZSQVHLCKE';

function esDniNieValido(doc: string): boolean {
  const val = doc.trim().toUpperCase();
  const reDni = /^(\d{8})([A-Z])$/;
  const reNie = /^([XYZ])(\d{7})([A-Z])$/;

  if (reDni.test(val)) {
    const [, num, letra] = val.match(reDni)!;
    return LETRAS_DNI[parseInt(num, 10) % 23] === letra;
  }

  if (reNie.test(val)) {
    const [, prefijo, num, letra] = val.match(reNie)!;
    const prefijoNum = prefijo === 'X' ? '0' : prefijo === 'Y' ? '1' : '2';
    return LETRAS_DNI[parseInt(prefijoNum + num, 10) % 23] === letra;
  }

  return false;
}

const DNI_RE = /^[0-9XYZ]/i;
const rolUsuarioSchema = z.enum(['CASERO', 'INQUILINO'], {
  message: 'El rol debe ser CASERO o INQUILINO',
});

export const registroSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  apellidos: z.string().trim().min(1, 'Los apellidos son obligatorios'),
  email: z.string().trim().toLowerCase().email('El email no tiene un formato valido'),
  password: z
    .string()
    .min(8, 'La contrasena debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contrasena debe contener al menos una letra mayuscula')
    .regex(/[0-9]/, 'La contrasena debe contener al menos un numero'),
  documento_identidad: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{6,15}$/i, 'El documento de identidad no tiene un formato valido')
    .refine(
      (val) => {
        if (DNI_RE.test(val)) {
          return esDniNieValido(val);
        }
        return true;
      },
      { message: 'El DNI o NIE introducido no es valido' }
    ),
  telefono: z.string().trim().min(1, 'El telefono es obligatorio'),
  rol: rolUsuarioSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('El email no tiene un formato valido'),
  password: z.string().min(1, 'La contrasena es obligatoria'),
});

export const googleLoginSchema = z.object({
  idToken: z.string().trim().min(1, 'Falta el idToken de Google'),
});

export const actualizarRolSchema = z.object({
  rol: rolUsuarioSchema,
});
