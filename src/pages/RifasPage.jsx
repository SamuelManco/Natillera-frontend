import { useEffect, useState } from 'react'
import { rifasApi, rifaOperacionesApi } from '../api/rifas'
import { personasApi } from '../api/personas'
import { natillerasApi, estadoApi } from '../api/catalogos'

const emptyRifa = { idNatillera: '', nombre: '', descripcion: '', fechaInicio: '', precioBoleta: '', cantidadBoletas: '', idEstado: '' }
const emptyBoleta = { numero: '', idPersona: '', fecha: '' }
const emptySorteo = { numeroGanador: '', fecha: '' }

export default function RifasPage() {
  const [rifas, setRifas] = useState([])
  const [personas, setPersonas] = useState([])
  const [natilleras, setNatilleras] = useState([])
  const [estados, setEstados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyRifa)
  const [saving, setSaving] = useState(false)

  const [detalleId, setDetalleId] = useState(null)
  const [estadoRifa, setEstadoRifa] = useState(null)
  const [boletas, setBoletas] = useState([])
  const [boletaForm, setBoletaForm] = useState(emptyBoleta)
  const [sorteoForm, setSorteoForm] = useState(emptySorteo)
  const [resultadoSorteo, setResultadoSorteo] = useState(null)
  const [accionando, setAccionando] = useState(false)

  async function cargarTodo() {
    setLoading(true)
    setError(null)
    try {
      const [r, p, n, e] = await Promise.all([
        rifasApi.listar(), personasApi.listar(), natillerasApi.listar(), estadoApi.listar(),
      ])
      setRifas(r); setPersonas(p); setNatilleras(n); setEstados(e)
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

  function cambiarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  async function crearRifa(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await rifasApi.crear({
        idNatillera: Number(form.idNatillera),
        nombre: form.nombre,
        descripcion: form.descripcion,
        fechaInicio: form.fechaInicio,
        precioBoleta: Number(form.precioBoleta),
        cantidadBoletas: Number(form.cantidadBoletas),
        idEstado: Number(form.idEstado),
      })
      setShowForm(false)
      setForm(emptyRifa)
      await cargarTodo()
    } catch (err) {
      setError('No se pudo crear la rifa.')
    } finally {
      setSaving(false)
    }
  }

  async function abrirDetalle(idRifa) {
    setDetalleId(idRifa)
    setResultadoSorteo(null)
    setBoletaForm(emptyBoleta)
    setSorteoForm(emptySorteo)
    try {
      const [est, bol] = await Promise.all([rifaOperacionesApi.estado(idRifa), rifaOperacionesApi.boletas(idRifa)])
      setEstadoRifa(est)
      setBoletas(bol)
    } catch (err) {
      setError('No se pudo cargar el detalle de la rifa.')
    }
  }

  async function venderBoleta(e) {
    e.preventDefault()
    setAccionando(true)
    setError(null)
    try {
      await rifaOperacionesApi.venderBoleta(detalleId, {
        numero: boletaForm.numero,
        idPersona: Number(boletaForm.idPersona),
        fecha: boletaForm.fecha,
      })
      setBoletaForm(emptyBoleta)
      await abrirDetalle(detalleId)
    } catch (err) {
      setError('No se pudo vender la boleta (¿número repetido, o ya no quedan disponibles?).')
    } finally {
      setAccionando(false)
    }
  }

  async function sortear(e) {
    e.preventDefault()
    setAccionando(true)
    setError(null)
    try {
      const resultado = await rifaOperacionesApi.sortear(detalleId, {
        numeroGanador: sorteoForm.numeroGanador,
        fecha: sorteoForm.fecha,
      })
      setResultadoSorteo(resultado)
      await abrirDetalle(detalleId)
      await cargarTodo()
    } catch (err) {
      setError('No se pudo sortear la rifa. Revisa que existan los Tipo_Movimiento "Premio Rifa" e "Ingreso Rifa".')
    } finally {
      setAccionando(false)
    }
  }

  return (
    <>
      <h1 className="page-title">Rifas</h1>
      <p className="page-subtitle">Crear rifas, vender boletas y sortear con el número de la Lotería de Medellín.</p>

      {error && <div className="banner error">{error}</div>}

      <div className="toolbar">
        <span className="banner loading">{loading ? 'Cargando...' : `${rifas.length} rifa(s)`}</span>
        {!showForm && (
          <button className="btn" onClick={() => { setForm(emptyRifa); setShowForm(true) }}>+ Nueva rifa</button>
        )}
      </div>

      {showForm && (
        <form className="panel" onSubmit={crearRifa}>
          <h2>Nueva rifa</h2>
          <div className="field-row">
            <div className="field">
              <label>Natillera</label>
              <select required value={form.idNatillera} onChange={(e) => cambiarCampo('idNatillera', e.target.value)}>
                <option value="" disabled>Selecciona...</option>
                {natilleras.map((n) => <option key={n.id} value={n.id}>{n.nombre}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Estado inicial</label>
              <select required value={form.idEstado} onChange={(e) => cambiarCampo('idEstado', e.target.value)}>
                <option value="" disabled>Selecciona (ej. "Abierta")...</option>
                {estados.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Nombre</label>
            <input required value={form.nombre} onChange={(e) => cambiarCampo('nombre', e.target.value)} />
          </div>
          <div className="field">
            <label>Descripción</label>
            <input value={form.descripcion} onChange={(e) => cambiarCampo('descripcion', e.target.value)} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Fecha de inicio</label>
              <input type="date" required value={form.fechaInicio} onChange={(e) => cambiarCampo('fechaInicio', e.target.value)} />
            </div>
            <div className="field">
              <label>Precio boleta</label>
              <input type="number" min="0" required value={form.precioBoleta} onChange={(e) => cambiarCampo('precioBoleta', e.target.value)} />
            </div>
            <div className="field">
              <label>Cantidad de boletas</label>
              <input type="number" min="1" required value={form.cantidadBoletas} onChange={(e) => cambiarCampo('cantidadBoletas', e.target.value)} />
            </div>
          </div>
          <div className="panel-actions">
            <button className="btn" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear rifa'}</button>
            <button className="btn secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {!loading && rifas.length === 0 && <div className="empty-state">No hay rifas creadas.</div>}

      {rifas.length > 0 && (
        <table className="ledger">
          <thead><tr><th>Nombre</th><th>Precio boleta</th><th>Boletas</th><th>Número ganador</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {rifas.map((r) => (
              <tr key={r.id}>
                <td>{r.nombre}</td>
                <td className="num">${r.precioBoleta?.toLocaleString('es-CO')}</td>
                <td className="num">{r.cantidadBoletas}</td>
                <td className="num">{r.numeroGanador ?? '—'}</td>
                <td>{nombreEstado(r.idEstado)}</td>
                <td className="actions"><button className="row-btn" onClick={() => abrirDetalle(r.id)}>Ver detalle</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {detalleId && estadoRifa && (
        <div className="panel" style={{ maxWidth: 700, marginTop: 28 }}>
          <h2>Rifa #{estadoRifa.idRifa}</h2>
          <p className="page-subtitle" style={{ margin: '0 0 16px' }}>
            Vendidas: {estadoRifa.boletasVendidas} · Disponibles: {estadoRifa.boletasDisponibles} ·
            Recaudado: ${estadoRifa.totalRecaudado?.toLocaleString('es-CO')}
            {estadoRifa.finalizada ? ` · Finalizada, ganó el ${estadoRifa.numeroGanador}` : ''}
          </p>

          {resultadoSorteo && (
            <div className="banner" style={{ background: 'rgba(51,84,74,0.1)', color: 'var(--green-deep)' }}>
              {resultadoSorteo.idPersonaGanadora
                ? `¡Ganó ${nombrePersona(resultadoSorteo.idPersonaGanadora)} con el número ${resultadoSorteo.numeroGanador}! Premio: $${resultadoSorteo.totalRecaudado?.toLocaleString('es-CO')}`
                : `Nadie tenía el número ${resultadoSorteo.numeroGanador} — los $${resultadoSorteo.totalRecaudado?.toLocaleString('es-CO')} quedaron en el fondo común.`}
            </div>
          )}

          {boletas.length > 0 && (
            <table className="ledger" style={{ marginBottom: 20 }}>
              <thead><tr><th>Número</th><th>Persona</th><th>Fecha compra</th></tr></thead>
              <tbody>
                {boletas.map((b) => (
                  <tr key={b.id}><td className="num">{b.numero}</td><td>{nombrePersona(b.idPersona)}</td><td className="num">{b.fechaCompra}</td></tr>
                ))}
              </tbody>
            </table>
          )}

          {!estadoRifa.finalizada && (
            <>
              <h2 style={{ fontSize: 16 }}>Vender boleta</h2>
              <form onSubmit={venderBoleta} style={{ marginBottom: 24 }}>
                <div className="field-row">
                  <div className="field">
                    <label>Número</label>
                    <input required value={boletaForm.numero} onChange={(e) => setBoletaForm((f) => ({ ...f, numero: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label>Persona</label>
                    <select required value={boletaForm.idPersona} onChange={(e) => setBoletaForm((f) => ({ ...f, idPersona: e.target.value }))}>
                      <option value="" disabled>Selecciona...</option>
                      {personas.map((p) => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Fecha</label>
                    <input type="date" required value={boletaForm.fecha} onChange={(e) => setBoletaForm((f) => ({ ...f, fecha: e.target.value }))} />
                  </div>
                </div>
                <button className="btn" type="submit" disabled={accionando}>Vender</button>
              </form>

              <h2 style={{ fontSize: 16 }}>Sortear (número de la Lotería de Medellín)</h2>
              <form onSubmit={sortear}>
                <div className="field-row">
                  <div className="field">
                    <label>Número ganador</label>
                    <input required value={sorteoForm.numeroGanador} onChange={(e) => setSorteoForm((f) => ({ ...f, numeroGanador: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label>Fecha del sorteo</label>
                    <input type="date" required value={sorteoForm.fecha} onChange={(e) => setSorteoForm((f) => ({ ...f, fecha: e.target.value }))} />
                  </div>
                </div>
                <button className="btn" type="submit" disabled={accionando}>Sortear</button>
              </form>
            </>
          )}

          <div className="panel-actions">
            <button className="btn secondary" type="button" onClick={() => setDetalleId(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  )
}
