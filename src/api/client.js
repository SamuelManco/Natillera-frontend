import axios from 'axios'

// En producción (Vercel) define la variable VITE_API_URL con la URL del backend,
// por ejemplo https://natillera-backend-1.onrender.com (sin "/" al final).
// En local, si no existe, usa http://localhost:8080.
const base = (import.meta.env.VITE_API_URL || 'http://localhost:8080')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '')

export const client = axios.create({
  baseURL: `${base}/api`,
})
