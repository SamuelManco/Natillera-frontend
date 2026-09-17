import axios from 'axios'

export const client = axios.create({
  baseURL: 'https://natillera-backend-1.onrender.com/api',
})