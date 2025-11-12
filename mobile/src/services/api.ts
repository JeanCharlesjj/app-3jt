import axios from 'axios';
import { API_URL } from '@env'; 

if (!API_URL) {
  throw new Error('Variável de ambiente API_URL não está definida.');
}

const api = axios.create({
  baseURL: API_URL,
});

export default api;