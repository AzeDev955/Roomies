import express from 'express';
import cors from 'cors';
import multer from 'multer';
import authRoutes from './routes/auth.routes';
import viviendaRoutes from './routes/vivienda.routes';
import inquilinoRoutes from './routes/inquilino.routes';
import incidenciaRoutes from './routes/incidencia.routes';
import anuncioRoutes from './routes/anuncio.routes';
import limpiezaRoutes from './routes/limpieza.routes';
import gastoRoutes from './routes/gasto.routes';
import gastoRecurrenteRoutes from './routes/gasto-recurrente.routes';
import deudaRoutes from './routes/deuda.routes';
import userRoutes from './routes/user.routes';
import inventarioRoutes from './routes/inventario.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/ping', (_req, res) => {
  res.send('pong');
});

app.use('/api/auth', authRoutes);
app.use('/api/viviendas', viviendaRoutes);
app.use('/api/inquilino', inquilinoRoutes);
app.use('/api/incidencias', incidenciaRoutes);
app.use('/api/anuncios', anuncioRoutes);
app.use('/api/viviendas', limpiezaRoutes);
app.use('/api/viviendas', gastoRoutes);
app.use('/api/viviendas', gastoRecurrenteRoutes);
app.use('/api', deudaRoutes);
app.use('/api', inventarioRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/users', userRoutes);

const uploadErrorHandler: express.ErrorRequestHandler = (error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    res.status(status).json({
      error:
        error.code === 'LIMIT_FILE_SIZE'
          ? 'El archivo supera el tamano maximo permitido.'
          : error.message,
    });
    return;
  }

  if (error instanceof Error && error.message.startsWith('Solo se permiten')) {
    res.status(400).json({ error: error.message });
    return;
  }

  next(error);
};

app.use(uploadErrorHandler);

export default app;
