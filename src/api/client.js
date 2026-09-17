import axios from 'axios'

// Cambia esta URL si tu backend corre en otro puerto o host.
export const client = axios.create({
  baseURL: 'http://localhost:8080/api',
})
