import { client } from './client'

export const movimientosApi = {
  listar: () => client.get('/movimiento').then((res) => res.data),
  crear: (movimiento) => client.post('/movimiento', movimiento).then((res) => res.data),
  eliminar: (id) => client.delete(`/movimiento/${id}`),
}
