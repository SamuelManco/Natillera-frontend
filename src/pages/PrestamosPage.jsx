import { useEffect, useState } from 'react'
import { prestamosApi } from '../api/prestamos'
import { personasApi } from '../api/personas'
import { natillerasApi } from '../api/catalogos'

const emptyOtorgar = { idPersona: '', idNatillera: '', monto: '', tasaInteres: '', fecha: '' }
const emptyAbono = { montoAbonoCapital: '', fecha: '' }

export default function PrestamosPage() {
  const [activos, setActivos] = useState([])
  const [personas, setPersonas] = useState([])
  const [natilleras, setNatilleras] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyOtorgar)
  const [saving, setSaving] = useState(false)

  const [detalleId, setDetalleId] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [abonoForm, setAbonoForm] = useState(emptyAbono)
  const [abonando, setAbonando] = useState(false)

  async function cargarTodo() {
    setLoading(true)
    setError(null)
    try {
      const [act, pers, nats] = await Promise.all([
        prestamosApi.activos(),
        personasApi.listar(),
        natillerasApi.listar(),
      ])
      setActivos(act)
      setPersonas(pers)
      setNatilleras(nats)
    } catch (err) {
      setError('No se pudo conectar con el backend.')
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

  async function otorgar(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await prestamosApi.otorgar({
        idNatillera: Number(form.idNatillera),
        idPersona: Number(form.idPersona),
        monto: Number(form.monto),
        tasaInteres: Number(form.tasaInteres),
        fecha: form.fecha,
      })
      setShowForm(false)
      setForm(emptyOtorgar)
      await cargarTodo()
    } catch (err) {
      setError('No se pudo otorgar el préstamo. Revisa que exista el Tipo_Movimiento "Préstamo Otorgado".')
    } finally {
      setSaving(false)
    }
  }

  async function verDetalle(id) {
    setDetalleId(id)
    setAbonoForm(emptyAbono)
    try {
      const est = await prestamosApi.estado(id)
      setDetalle(est)
    } catch (err) {
      setError('No se pudo cargar el detalle del préstamo.')
    }
  }

  async function abonar(e) {
    e.preventDefault()
    setAbonando(true)
    setError(null)
    try {
      const est = await prestamosApi.abonar(detalleId, {
        montoAbonoCapital: Number(abonoForm.montoAbonoCapital),
        fecha: abonoForm.fecha,
      })
      setDetalle(est)
      setAbonoForm(emptyAbono)
      await cargarTodo()
    } catch (err) {
      setError('No se pudo registrar el abono. Revisa que existan los Tipo_Movimiento "Abono a Capital" e "Interés Préstamo".')
    } finally {
      setAbonando(false)
    }
  }

  return (
    <>
      <h1 className="page-title">Préstamos</h1>
      <p className="page-subtitle">Otorgar préstamos a los miembros y registrar sus abonos.</p>

      {error && <div className="banner error">{error}</div>}

      <div className="toolbar">
        <span className="banner loading">{loading ? 'Cargando...' : `${activos.length} préstamo(s) activo(s)`}</span>
        {!showForm && (
          <button className="btn" onClick={() => { setForm(emptyOtorgar); setShowForm(true) }}>
            + Otorgar préstamo
          </button>
        )}
      </div>

      {showForm && (
        <form className="panel" onSubmit={otorgar}>
          <h2>Otorgar préstamo</h2>
          <div className="field-row">
            <div className="field">
              <label>Natillera</label>
              <select required value={form.idNatillera} onChange={(e) => cambiarCampo('idNatillera', e.target.value)}>
                <option value="" disabled>Selecciona...</option>
                {natilleras.map((n) => <option key={n.id} value={n.id}>{n.nombre}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Persona</label>
              <select required value={form.idPersona} onChange={(e) => cambiarCampo('idPersona', e.target.value)}>
                <option value="" disabled>Selecciona...</option>
                {personas.map((p) => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
              </select>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Monto</label>
              <input type="number" min="0" required value={form.monto} onChange={(e) => cambiarCampo('monto', e.target.value)} />
            </div>
            <div className="field">
              <label>Tasa de interés mensual (%)</label>
              <input type="number" step="0.01" min="0" required value={form.tasaInteres} onChange={(e) => cambiarCampo('tasaInteres', e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Fecha</label>
            <input type="date" required value={form.fecha} onChange={(e) => cambiarCampo('fecha', e.target.value)} />
          </div>
          <div className="panel-actions">
            <button className="btn" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Otorgar'}</button>
            <button className="btn secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {!loading && activos.length === 0 && (
        <div className="empty-state">No hay préstamos activos.</div>
      )}

      {activos.length > 0 && (
        <table className="ledger">
          <thead>
            <tr>
              <th>Persona</th>
              <th>Monto original</th>
              <th>Saldo pendiente</th>
              <th>Tasa</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {activos.map((p) => (
              <tr key={p.id}>
                <td>{nombrePersona(p.idPersona)}</td>
                <td className="num">${p.monto?.toLocaleString('es-CO')}</td>
                <td className="num">${p.montoActual?.toLocaleString('es-CO')}</td>
                <td className="num">{p.tasaInteres}%</td>
                <td className="num">{p.fecha}</td>
                <td className="actions">
                  <button className="row-btn" onClick={() => verDetalle(p.id)}>Ver detalle</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {detalleId && detalle && (
        <div className="panel" style={{ maxWidth: 700, marginTop: 28 }}>
          <h2>Detalle del préstamo #{detalle.idPrestamo}</h2>
          <p className="page-subtitle" style={{ margin: '0 0 16px' }}>
            Original: ${detalle.montoOriginal?.toLocaleString('es-CO')} · Saldo: ${detalle.montoActual?.toLocaleString('es-CO')} ·
            Abonado: ${detalle.totalAbonadoCapital?.toLocaleString('es-CO')} · Interés pagado: ${detalle.totalInteresPagado?.toLocaleString('es-CO')}
            {detalle.pagadoCompleto ? ' · Pagado completo ✓' : ''}
          </p>

          {detalle.historial?.length > 0 && (
            <table className="ledger" style={{ marginBottom: 20 }}>
              <thead><tr><th>Tipo</th><th>Monto</th><th>Fecha</th></tr></thead>
              <tbody>
                {detalle.historial.map((h) => (
                  <tr key={h.id}>
                    <td>{h.descripcion}</td>
                    <td className="num">${h.monto?.toLocaleString('es-CO')}</td>
                    <td className="num">{h.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!detalle.pagadoCompleto && (
            <form onSubmit={abonar}>
              <div className="field-row">
                <div className="field">
                  <label>Monto del abono (capital)</label>
                  <input type="number" min="0" required value={abonoForm.montoAbonoCapital}
                    onChange={(e) => setAbonoForm((f) => ({ ...f, montoAbonoCapital: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Fecha</label>
                  <input type="date" required value={abonoForm.fecha}
                    onChange={(e) => setAbonoForm((f) => ({ ...f, fecha: e.target.value }))} />
                </div>
              </div>
              <div className="panel-actions">
                <button className="btn" type="submit" disabled={abonando}>{abonando ? 'Guardando...' : 'Registrar abono'}</button>
                <button className="btn secondary" type="button" onClick={() => setDetalleId(null)}>Cerrar</button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  )
}
