import axios from 'axios';

const api = axios.create({
  // O Vite exige o prefixo import.meta.env
  baseURL: import.meta.env.VITE_API_URL,
});

export default api;