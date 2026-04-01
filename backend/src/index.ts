import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import viviendaRoutes from './routes/vivienda.routes';
import inquilinoRoutes from './routes/inquilino.routes';
import incidenciaRoutes from './routes/incidencia.routes';
import anuncioRoutes from './routes/anuncio.routes';

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});