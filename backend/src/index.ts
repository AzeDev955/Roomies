import 'dotenv/config';
import app from './app';
import './services/cron.service';
import { iniciarCronMensualidades } from './cron/mensualidades.cron';
import { iniciarCronRecordatoriosMorosos } from './cron/recordatorios.cron';

const PORT = 3000;

iniciarCronMensualidades();
iniciarCronRecordatoriosMorosos();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
