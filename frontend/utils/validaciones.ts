const LETRAS_DNI = 'TRWAGMYFPDXBNJZSQVHLCKE';

export function validarDniNie(documento: string): boolean {
  const doc = documento.trim().toUpperCase();
  // DNI: 8 dígitos + letra
  const reDni = /^(\d{8})([A-Z])$/;
  // NIE: X/Y/Z + 7 dígitos + letra
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
}

export function validarPasaporte(documento: string): boolean {
  return /^[A-Z0-9]{6,15}$/i.test(documento.trim());
}

export function validarPassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}
