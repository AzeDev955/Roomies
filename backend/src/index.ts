import 'dotenv/config';
import express from 'express';
import cors from 'cors';
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
import './services/cron.service';
import { iniciarCronMensualidades } from './cron/mensualidades.cron';

const app = express();
const PORT = 3000;

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
app.use('/api/users', userRoutes);

iniciarCronMensualidades();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
