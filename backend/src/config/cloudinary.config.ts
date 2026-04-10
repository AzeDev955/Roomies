import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

export const cloudinaryEstaConfigurado = Boolean(
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET,
);

if (cloudinaryEstaConfigurado) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

const crearUploaderImagen = (folder: string) =>
  multer({
    storage: cloudinaryEstaConfigurado
      ? new CloudinaryStorage({
          cloudinary,
          params: async () => ({
            folder,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            resource_type: 'image',
          }),
        })
      : multer.memoryStorage(),
    limits: {
      fileSize: 8 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        cb(new Error('Solo se permiten archivos de imagen.'));
        return;
      }

      cb(null, true);
    },
  });

export const uploadInventarioFoto = crearUploaderImagen('roomies-inventario');
export const uploadJustificanteFoto = crearUploaderImagen('roomies-justificantes');
export const uploadFacturaFoto = crearUploaderImagen('roomies-facturas');

export { cloudinary };
