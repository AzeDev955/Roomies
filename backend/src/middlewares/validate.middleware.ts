import { RequestHandler } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema, mensaje = 'Datos invalidos.'): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errores = result.error.issues.map((issue) => ({
        campo: issue.path.join('.'),
        mensaje: issue.message,
      }));
      res.status(400).json({ error: mensaje, errores });
      return;
    }

    req.body = result.data;
    next();
  };
}
