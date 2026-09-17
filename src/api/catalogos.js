import { client } from './client'

export const natillerasApi = {
  listar: () => client.get('/natillera').then((res) => res.data),
}

export const tipoMovimientoApi = {
  listar: () => client.get('/tipo-movimiento').then((res) => res.data),
}

export const estadoApi = {
  listar: () => client.get('/estado').then((res) => res.data),
}
