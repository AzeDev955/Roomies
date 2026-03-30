import axios from 'axios';
import { obtenerToken } from './auth.service';

const api = axios.create({
  // En dispositivo físico cambia por la IP de tu máquina: http://192.168.1.X:3000/api
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api',
});

api.interceptors.request.use(async (config) => {
  const token = await obtenerToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
