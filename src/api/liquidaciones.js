import { client } from './client'

export const liquidacionesApi = {
  listar: () => client.get('/liquidacion').then((res) => res.data),
}

export const liquidacionOperacionesApi = {
  cerrar: (idNatillera, payload) => client.post(`/liquidaciones/natillera/${idNatillera}/cerrar`, payload).then((res) => res.data),
  resumen: (idLiquidacion) => client.get(`/liquidaciones/${idLiquidacion}/resumen`).then((res) => res.data),
  pagar: (idLiquidacionxPersona, payload) => client.post(`/liquidaciones/detalle/${idLiquidacionxPersona}/pagar`, payload).then((res) => res.data),
}
