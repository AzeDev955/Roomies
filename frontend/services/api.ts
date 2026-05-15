import axios from 'axios';
import { obtenerToken } from './auth.service';
import { getApiBaseUrl } from '@/utils/apiUrl';

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

api.interceptors.request.use(async (config) => {
  const token = await obtenerToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
