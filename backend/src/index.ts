import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/ping', (_req, res) => {
  res.send('pong');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
