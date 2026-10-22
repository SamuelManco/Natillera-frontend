import { client } from './client'

export const resumenApi = {
  // desde y hasta son opcionales (formato 2026-01-31)
  // Sin parámetros muestra el periodo actual (después del último cierre). todo=true muestra el historial completo.
  obtener: (desde, hasta, todo) =>
    client
      .get('/resumen', { params: { desde: desde || undefined, hasta: hasta || undefined, todo: todo ? true : undefined } })
      .then((res) => res.data),
}
