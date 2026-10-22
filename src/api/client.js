import axios from 'axios'

// URL del backend:
// 1. Si existe la variable VITE_API_URL (archivo .env o Vercel), se usa esa.
// 2. Si no, en la pagina desplegada (produccion) se usa el backend de Render.
// 3. Si no, en tu computador (npm run dev) se usa http://localhost:8080.
const BACKEND_PRODUCCION = 'https://natillera-backend-1.onrender.com'

const base = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? BACKEND_PRODUCCION : 'http://localhost:8080'))
  .replace(/\/+$/, '')
  .replace(/\/api$/, '')

export const client = axios.create({
  baseURL: `${base}/api`,
})
