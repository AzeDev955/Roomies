import { z } from 'zod';

const LETRAS_DNI = 'TRWAGMYFPDXBNJZSQVHLCKE';

export const dniNieSchema = z.string().refine(
  (val) => {
    const doc = val.trim().toUpperCase();
    const reDni = /^(\d{8})([A-Z])$/;
    const reNie = /^([XYZ])(\d{7})([A-Z])$/;

    if (reDni.test(doc)) {
      const [, num, letra] = doc.match(reDni)!;
      return LETRAS_DNI[parseInt(num, 10) % 23] === letra;
    }

    if (reNie.test(doc)) {
      const [, prefijo, num, letra] = doc.match(reNie)!;
      const prefijoNum = prefijo === 'X' ? '0' : prefijo === 'Y' ? '1' : '2';
      return LETRAS_DNI[parseInt(prefijoNum + num, 10) % 23] === letra;
    }

    return false;
  },
  { message: 'El DNI o NIE introducido no es válido' }
);

export const pasaporteSchema = z
  .string()
  .regex(/^[A-Z0-9]{6,15}$/i, 'Formato de pasaporte inválido');

export const passwordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
  .regex(/[0-9]/, 'La contraseña debe contener al menos un número');
