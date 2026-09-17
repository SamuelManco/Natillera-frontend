import axios from 'axios'

// Lee la variable de entorno o usa Render como respaldo
const API_URL = 
  import.meta.env?.VITE_API_URL || 
  process.env?.REACT_APP_API_URL || 
  'https://natillera-backend-1.onrender.com/api';

export const client = axios.create({
  baseURL: API_URL,
})