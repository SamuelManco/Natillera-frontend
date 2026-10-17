// Devuelve el mensaje que manda el backend (por ejemplo "El aporte de Ana debe ser de al menos $50.000")
// o, si no hay, un texto por defecto.
export function mensajeError(err, porDefecto) {
  const data = err?.response?.data
  if (data && typeof data === 'object') {
    const msg = data.mensaje || data.message
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  if (err && !err.response) {
    return 'No se pudo conectar con el backend. Si está en Render gratis puede estar despertando: espera un minuto y recarga.'
  }
  return porDefecto
}
