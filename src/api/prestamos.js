import { client } from './client'

export const prestamosApi = {
  otorgar: (payload) => client.post('/prestamos/otorgar', payload).then((res) => res.data),
  abonar: (id, payload) => client.post(`/prestamos/${id}/abonar`, payload).then((res) => res.data),
  estado: (id) => client.get(`/prestamos/${id}/estado`).then((res) => res.data),
  activos: () => client.get('/prestamos/activos').then((res) => res.data),
}
