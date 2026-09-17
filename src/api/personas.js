import { client } from './client'

export const personasApi = {
  listar: () => client.get('/persona').then((res) => res.data),
  crear: (persona) => client.post('/persona', persona).then((res) => res.data),
  actualizar: (id, persona) => client.put(`/persona/${id}`, persona).then((res) => res.data),
  eliminar: (id) => client.delete(`/persona/${id}`),
}

export const rolesApi = {
  listar: () => client.get('/rol').then((res) => res.data),
}

export const tiposDocumentoApi = {
  listar: () => client.get('/tipo-documento').then((res) => res.data),
}
