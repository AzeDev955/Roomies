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

export const registroSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellidos: z.string().min(1, 'Los apellidos son obligatorios'),
  email: z.string().email('El email no tiene un formato válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  documento_identidad: z
    .string()
    .regex(/^[A-Z0-9]{6,15}$/i, 'El documento de identidad no tiene un formato válido')
    .refine(
      (val) => {
        if (DNI_RE.test(val)) {
          return esDniNieValido(val);
        }
        return true;
      },
      { message: 'El DNI o NIE introducido no es válido' }
    ),
  telefono: z.string().min(1, 'El teléfono es obligatorio'),
  rol: z.enum(['CASERO', 'INQUILINO'], { message: 'El rol debe ser CASERO o INQUILINO' }),
});
