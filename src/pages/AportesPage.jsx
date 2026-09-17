import { useEffect, useState } from 'react'
import { movimientosApi } from '../api/movimientos'
import { personasApi } from '../api/personas'
import { natillerasApi, tipoMovimientoApi } from '../api/catalogos'

const emptyForm = { idPersona: '', idNatillera: '', monto: '', fecha: '', descripcion: '' }

export default function AportesPage() {
  const [aportes, setAportes] = useState([])
  const [personas, setPersonas] = useState([])
  const [natilleras, setNatilleras] = useState([])
  const [tipoAporteId, setTipoAporteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function cargarTodo() {
    setLoading(true)
    setError(null)
    try {
      const [movs, pers, nats, tipos] = await Promise.all([
        movimientosApi.listar(),
        personasApi.listar(),
        natillerasApi.listar(),
        tipoMovimientoApi.listar(),
      ])
      const tipoAporte = tipos.find((t) => t.nombre === 'Aporte')
      setTipoAporteId(tipoAporte ? tipoAporte.id : null)
      setAportes(tipoAporte ? movs.filter((m) => m.idTipoMovimiento === tipoAporte.id) : [])
      setPersonas(pers)
      setNatilleras(nats)
    } catch (err) {
      setError('No se pudo conectar con el backend. Revisa que esté corriendo y que tenga CORS habilitado.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarTodo()
  }, [])

  function nombrePersona(id) {
    const p = personas.find((x) => x.id === id)
    return p ? `${p.nombre} ${p.apellido}` : id
  }

  function cambiarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function abrirNuevo() {
    setForm(emptyForm)
    setShowForm(true)
  }

  async function guardar(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await movimientosApi.crear({
        idNatillera: Number(form.idNatillera),
        idPersona: Number(form.idPersona),
        idTipoMovimiento: tipoAporteId,
        monto: Number(form.monto),
        fecha: form.fecha,
        descripcion: form.descripcion || 'Aporte mensual',
      })
      setShowForm(false)
      setForm(emptyForm)
      await cargarTodo()
    } catch (err) {
      setError('No se pudo registrar el aporte. Revisa que los campos estén completos.')
    } finally {
      setSaving(false)
    }
  }

  async function eliminar(aporte) {
    const confirmar = window.confirm(`¿Eliminar este aporte de ${nombrePersona(aporte.idPersona)}?`)
    if (!confirmar) return
    try {
      await movimientosApi.eliminar(aporte.id)
      await cargarTodo()
    } catch (err) {
      setError('No se pudo eliminar el aporte.')
    }
  }

  const faltaCatalogo = !loading && (tipoAporteId === null || personas.length === 0 || natilleras.length === 0)

  return (
    <>
      <h1 className="page-title">Aportes</h1>
      <p className="page-subtitle">Registro del ahorro mensual de cada integrante de la natillera.</p>

      {error && <div className="banner error">{error}</div>}

      {faltaCatalogo && (
        <div className="banner error">
          {tipoAporteId === null && "Falta crear el Tipo_Movimiento 'Aporte' (créalo desde Postman: POST /api/tipo-movimiento). "}
          {personas.length === 0 && 'No hay personas registradas todavía — crea al menos una en la sección Personas. '}
          {natilleras.length === 0 && 'No hay ninguna Natillera creada — créala desde Postman: POST /api/natillera.'}
        </div>
      )}

      <div className="toolbar">
        <span className="banner loading">{loading ? 'Cargando...' : `${aportes.length} aporte(s)`}</span>
        {!showForm && !faltaCatalogo && (
          <button className="btn" onClick={abrirNuevo}>
            + Registrar aporte
          </button>
        )}
      </div>

      {showForm && (
        <form className="panel" onSubmit={guardar}>
          <h2>Registrar aporte</h2>

          <div className="field-row">
            <div className="field">
              <label htmlFor="natillera">Natillera</label>
              <select id="natillera" required value={form.idNatillera} onChange={(e) => cambiarCampo('idNatillera', e.target.value)}>
                <option value="" disabled>Selecciona...</option>
                {natilleras.map((n) => (
                  <option key={n.id} value={n.id}>{n.nombre}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="persona">Persona</label>
              <select id="persona" required value={form.idPersona} onChange={(e) => cambiarCampo('idPersona', e.target.value)}>
                <option value="" disabled>Selecciona...</option>
                {personas.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="monto">Monto</label>
              <input id="monto" type="number" min="0" required value={form.monto} onChange={(e) => cambiarCampo('monto', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="fecha">Fecha</label>
              <input id="fecha" type="date" required value={form.fecha} onChange={(e) => cambiarCampo('fecha', e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="descripcion">Descripción (opcional)</label>
            <input id="descripcion" value={form.descripcion} onChange={(e) => cambiarCampo('descripcion', e.target.value)} />
          </div>

          <div className="panel-actions">
            <button className="btn" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Registrar'}</button>
            <button className="btn secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {!loading && aportes.length === 0 && !faltaCatalogo && (
        <div className="empty-state">Todavía no hay aportes registrados.</div>
      )}

      {aportes.length > 0 && (
        <table className="ledger">
          <thead>
            <tr>
              <th>Persona</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Descripción</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {aportes.map((a) => (
              <tr key={a.id}>
                <td>{nombrePersona(a.idPersona)}</td>
                <td className="num">${a.monto?.toLocaleString('es-CO')}</td>
                <td className="num">{a.fecha}</td>
                <td>{a.descripcion || '—'}</td>
                <td className="actions">
                  <button className="row-btn danger" onClick={() => eliminar(a)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
