import { client } from './client'

export const rifasApi = {
  listar: () => client.get('/rifa').then((res) => res.data),
  crear: (rifa) => client.post('/rifa', rifa).then((res) => res.data),
}

export const rifaOperacionesApi = {
  venderBoleta: (idRifa, payload) => client.post(`/rifas/${idRifa}/vender-boleta`, payload).then((res) => res.data),
  sortear: (idRifa, payload) => client.post(`/rifas/${idRifa}/sortear`, payload).then((res) => res.data),
  estado: (idRifa) => client.get(`/rifas/${idRifa}/estado`).then((res) => res.data),
  boletas: (idRifa) => client.get(`/rifas/${idRifa}/boletas`).then((res) => res.data),
}
