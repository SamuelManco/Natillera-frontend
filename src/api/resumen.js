import { client } from './client'

export const resumenApi = {
  // desde y hasta son opcionales (formato 2026-01-31)
  obtener: (desde, hasta) =>
    client
      .get('/resumen', { params: { desde: desde || undefined, hasta: hasta || undefined } })
      .then((res) => res.data),
}
