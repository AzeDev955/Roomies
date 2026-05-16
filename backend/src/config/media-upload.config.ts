import multer from 'multer';

const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function getPositiveIntegerFromEnv(name: string, fallback: number): number {
  const rawValue = process.env[name];
  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const imageMaxSizeBytes = getPositiveIntegerFromEnv('MEDIA_IMAGE_MAX_SIZE_BYTES', DEFAULT_MAX_FILE_SIZE_BYTES);
const documentMaxSizeBytes = getPositiveIntegerFromEnv('MEDIA_DOCUMENT_MAX_SIZE_BYTES', DEFAULT_MAX_FILE_SIZE_BYTES);

const crearUploaderImagen = () =>
  multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: imageMaxSizeBytes,
      files: 1,
    },
    fileFilter: (_req, file, cb) => {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.mimetype)) {
        cb(new Error('Solo se permiten imagenes jpg, jpeg, png o webp.'));
        return;
      }

      cb(null, true);
    },
  });

const crearUploaderDocumento = () =>
  multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: documentMaxSizeBytes,
      files: 1,
    },
    fileFilter: (_req, file, cb) => {
      const esImagen = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.mimetype);
      const esPdf = file.mimetype === 'application/pdf';

      if (!esImagen && !esPdf) {
        cb(new Error('Solo se permiten imagenes jpg, jpeg, png, webp o archivos PDF.'));
        return;
      }

      cb(null, true);
    },
  });

export const uploadInventarioFoto = crearUploaderImagen();
export const uploadViviendaFoto = crearUploaderImagen();
export const uploadJustificanteFoto = crearUploaderImagen();
export const uploadFacturaGasto = crearUploaderDocumento();
export const uploadFacturaFoto = crearUploaderImagen();
export const uploadContratoAlquiler = crearUploaderDocumento();
