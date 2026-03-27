import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/ping', (_req, res) => {
  res.send('pong');
});

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
