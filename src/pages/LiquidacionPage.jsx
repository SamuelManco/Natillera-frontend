import { useEffect, useState } from 'react'
import { liquidacionesApi, liquidacionOperacionesApi } from '../api/liquidaciones'
import { personasApi } from '../api/personas'
import { natillerasApi, estadoApi } from '../api/catalogos'

const emptyCierre = { idNatillera: '', fechaInicio: '', fechaFin: '' }

export default function LiquidacionPage() {
  const [liquidaciones, setLiquidaciones] = useState([])
  const [personas, setPersonas] = useState([])
  const [natilleras, setNatilleras] = useState([])
  const [estados, setEstados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyCierre)
  const [cerrando, setCerrando] = useState(false)

  const [resumen, setResumen] = useState(null)
  const [pagandoId, setPagandoId] = useState(null)

  async function cargarTodo() {
    setLoading(true)
    setError(null)
    try {
      const [liq, pers, nats, ests] = await Promise.all([
        liquidacionesApi.listar(), personasApi.listar(), natillerasApi.listar(), estadoApi.listar(),
      ])
      setLiquidaciones(liq); setPersonas(pers); setNatilleras(nats); setEstados(ests)
    } catch (err) {
      setError('No se pudo conectar con el backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarTodo() }, [])

  function nombrePersona(id) {
    const p = personas.find((x) => x.id === id)
    return p ? `${p.nombre} ${p.apellido}` : id
  }
  function nombreEstado(id) {
    return estados.find((e) => e.id === id)?.nombre ?? id
  }

  async function cerrar(e) {
    e.preventDefault()
    setCerrando(true)
    setError(null)
    try {
      const res = await liquidacionOperacionesApi.cerrar(Number(form.idNatillera), {
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
      })
      setResumen(res)
      setShowForm(false)
      setForm(emptyCierre)
      await cargarTodo()
    } catch (err) {
      setError('No se pudo cerrar la liquidación. Revisa que haya aportes registrados en ese rango de fechas y que existan los Estado "Cerrada" y "Pendiente".')
    } finally {
      setCerrando(false)
    }
  }

  async function verResumen(idLiquidacion) {
    setError(null)
    try {
      const res = await liquidacionOperacionesApi.resumen(idLiquidacion)
      setResumen(res)
    } catch (err) {
      setError('No se pudo cargar el resumen.')
    }
  }

  async function pagar(idDetalle) {
    setPagandoId(idDetalle)
    setError(null)
    try {
      const fecha = new Date().toISOString().slice(0, 10)
      await liquidacionOperacionesApi.pagar(idDetalle, { fecha })
      if (resumen) await verResumen(resumen.liquidacion.id)
    } catch (err) {
      setError('No se pudo registrar el pago. Revisa que exista el Tipo_Movimiento "Pago Liquidación".')
    } finally {
      setPagandoId(null)
    }
  }

  return (
    <>
      <h1 className="page-title">Liquidación</h1>
      <p className="page-subtitle">Cerrar un periodo, repartir los intereses y pagar a cada persona.</p>

      {error && <div className="banner error">{error}</div>}

      <div className="toolbar">
        <span className="banner loading">{loading ? 'Cargando...' : `${liquidaciones.length} liquidación(es)`}</span>
        {!showForm && (
          <button className="btn" onClick={() => { setForm(emptyCierre); setShowForm(true) }}>+ Cerrar periodo</button>
        )}
      </div>

      {showForm && (
        <form className="panel" onSubmit={cerrar}>
          <h2>Cerrar liquidación de un periodo</h2>
          <div className="field">
            <label>Natillera</label>
            <select required value={form.idNatillera} onChange={(e) => setForm((f) => ({ ...f, idNatillera: e.target.value }))}>
              <option value="" disabled>Selecciona...</option>
              {natilleras.map((n) => <option key={n.id} value={n.id}>{n.nombre}</option>)}
            </select>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Fecha inicio del periodo</label>
              <input type="date" required value={form.fechaInicio} onChange={(e) => setForm((f) => ({ ...f, fechaInicio: e.target.value }))} />
            </div>
            <div className="field">
              <label>Fecha fin del periodo</label>
              <input type="date" required value={form.fechaFin} onChange={(e) => setForm((f) => ({ ...f, fechaFin: e.target.value }))} />
            </div>
          </div>
          <div className="panel-actions">
            <button className="btn" type="submit" disabled={cerrando}>{cerrando ? 'Calculando...' : 'Cerrar y repartir'}</button>
            <button className="btn secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {!loading && liquidaciones.length === 0 && <div className="empty-state">No hay liquidaciones todavía.</div>}

      {liquidaciones.length > 0 && (
        <table className="ledger" style={{ marginBottom: 28 }}>
          <thead><tr><th>Periodo</th><th>Total intereses</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {liquidaciones.map((l) => (
              <tr key={l.id}>
                <td>{l.fechaInicio} — {l.fechaFin}</td>
                <td className="num">${l.totalIntereses?.toLocaleString('es-CO') ?? '—'}</td>
                <td>{nombreEstado(l.idEstado)}</td>
                <td className="actions"><button className="row-btn" onClick={() => verResumen(l.id)}>Ver reparto</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {resumen && (
        <div className="panel" style={{ maxWidth: 760 }}>
          <h2>Reparto del periodo {resumen.liquidacion.fechaInicio} — {resumen.liquidacion.fechaFin}</h2>
          <p className="page-subtitle" style={{ margin: '0 0 16px' }}>
            Total a repartir: ${resumen.liquidacion.totalIntereses?.toLocaleString('es-CO')}
            {' '}(rifas: ${resumen.liquidacion.totalIngresoRifa?.toLocaleString('es-CO')}, préstamos: ${resumen.liquidacion.totalInteresesPrestamos?.toLocaleString('es-CO')})
          </p>

          <table className="ledger">
            <thead><tr><th>Persona</th><th>Ahorrado</th><th>Interés</th><th>Total</th><th>%</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {resumen.detalle.map((d) => (
                <tr key={d.id}>
                  <td>{nombrePersona(d.idPersona)}</td>
                  <td className="num">${d.montoAhorrado?.toLocaleString('es-CO')}</td>
                  <td className="num">${d.montoIntereses?.toLocaleString('es-CO')}</td>
                  <td className="num">${d.montoTotal?.toLocaleString('es-CO')}</td>
                  <td className="num">{d.porcentaje}%</td>
                  <td>{nombreEstado(d.idEstado)}</td>
                  <td className="actions">
                    {nombreEstado(d.idEstado) !== 'Pagada' && (
                      <button className="row-btn" disabled={pagandoId === d.id} onClick={() => pagar(d.id)}>
                        {pagandoId === d.id ? 'Pagando...' : 'Pagar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="panel-actions">
            <button className="btn secondary" type="button" onClick={() => setResumen(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  )
}
