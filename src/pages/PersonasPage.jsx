import { useEffect, useState } from 'react'
import { personasApi, rolesApi, tiposDocumentoApi } from '../api/personas'

const emptyForm = {
  nombre: '',
  apellido: '',
  numeroDocumento: '',
  idTipoDocumento: '',
  idRol: '',
  correo: '',
  telefono: '',
  fechaRegistro: '',
  cuotaMinima: '',
}

export default function PersonasPage() {
  const [personas, setPersonas] = useState([])
  const [roles, setRoles] = useState([])
  const [tiposDocumento, setTiposDocumento] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function cargarTodo() {
    setLoading(true)
    setError(null)
    try {
      const [p, r, td] = await Promise.all([
        personasApi.listar(),
        rolesApi.listar(),
        tiposDocumentoApi.listar(),
      ])
      setPersonas(p)
      setRoles(r)
      setTiposDocumento(td)
    } catch (err) {
      setError(
        'No se pudo conectar con el backend. Revisa que esté corriendo en el puerto 8080 y que tenga CORS habilitado.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarTodo()
  }, [])

  function nombreRol(idRol) {
    return roles.find((r) => r.id === idRol)?.nombre ?? idRol
  }

  function nombreTipoDocumento(idTipoDocumento) {
    return tiposDocumento.find((t) => t.id === idTipoDocumento)?.nombre ?? idTipoDocumento
  }

  function abrirNuevo() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  function abrirEditar(persona) {
    setForm({
      nombre: persona.nombre ?? '',
      apellido: persona.apellido ?? '',
      numeroDocumento: persona.numeroDocumento ?? '',
      idTipoDocumento: persona.idTipoDocumento ?? '',
      idRol: persona.idRol ?? '',
      correo: persona.correo ?? '',
      telefono: persona.telefono ?? '',
      fechaRegistro: persona.fechaRegistro ?? '',
      cuotaMinima: persona.cuotaMinima ?? '',
    })
    setEditingId(persona.id)
    setShowForm(true)
  }

  function cerrarForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  function cambiarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  async function guardar(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = {
      ...form,
      idTipoDocumento: Number(form.idTipoDocumento),
      idRol: Number(form.idRol),
      cuotaMinima: form.cuotaMinima === '' ? null : Number(form.cuotaMinima),
    }
    try {
      if (editingId) {
        await personasApi.actualizar(editingId, payload)
      } else {
        await personasApi.crear(payload)
      }
      cerrarForm()
      await cargarTodo()
    } catch (err) {
      setError('No se pudo guardar la persona. Revisa que todos los campos requeridos estén completos.')
    } finally {
      setSaving(false)
    }
  }

  async function eliminar(persona) {
    const confirmar = window.confirm(`¿Eliminar a ${persona.nombre} ${persona.apellido}?`)
    if (!confirmar) return
    try {
      await personasApi.eliminar(persona.id)
      await cargarTodo()
    } catch (err) {
      setError('No se pudo eliminar. Puede que esta persona ya tenga movimientos asociados.')
    }
  }

  return (
    <>
      <h1 className="page-title">Personas</h1>
      <p className="page-subtitle">
        Los integrantes de la natillera. Cada uno necesita un tipo de documento y un rol ya
        creados de antemano.
      </p>

      {error && <div className="banner error">{error}</div>}

      <div className="toolbar">
        <span className="banner loading">{loading ? 'Cargando...' : `${personas.length} persona(s)`}</span>
        {!showForm && (
          <button className="btn" onClick={abrirNuevo}>
            + Nueva persona
          </button>
        )}
      </div>

      {showForm && (
        <form className="panel" onSubmit={guardar}>
          <h2>{editingId ? 'Editar persona' : 'Nueva persona'}</h2>

          <div className="field-row">
            <div className="field">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                required
                value={form.nombre}
                onChange={(e) => cambiarCampo('nombre', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="apellido">Apellido</label>
              <input
                id="apellido"
                required
                value={form.apellido}
                onChange={(e) => cambiarCampo('apellido', e.target.value)}
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="tipoDocumento">Tipo de documento</label>
              <select
                id="tipoDocumento"
                required
                value={form.idTipoDocumento}
                onChange={(e) => cambiarCampo('idTipoDocumento', e.target.value)}
              >
                <option value="" disabled>
                  Selecciona...
                </option>
                {tiposDocumento.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="numeroDocumento">Número de documento</label>
              <input
                id="numeroDocumento"
                required
                value={form.numeroDocumento}
                onChange={(e) => cambiarCampo('numeroDocumento', e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="rol">Rol</label>
            <select
              id="rol"
              required
              value={form.idRol}
              onChange={(e) => cambiarCampo('idRol', e.target.value)}
            >
              <option value="" disabled>
                Selecciona...
              </option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="correo">Correo</label>
              <input
                id="correo"
                type="email"
                value={form.correo}
                onChange={(e) => cambiarCampo('correo', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                value={form.telefono}
                onChange={(e) => cambiarCampo('telefono', e.target.value)}
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="fechaRegistro">Fecha de registro</label>
              <input
                id="fechaRegistro"
                type="date"
                required
                value={form.fechaRegistro}
                onChange={(e) => cambiarCampo('fechaRegistro', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="cuotaMinima">Cuota mínima</label>
              <input
                id="cuotaMinima"
                type="number"
                min="0"
                value={form.cuotaMinima}
                onChange={(e) => cambiarCampo('cuotaMinima', e.target.value)}
              />
            </div>
          </div>

          <div className="panel-actions">
            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear persona'}
            </button>
            <button className="btn secondary" type="button" onClick={cerrarForm}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {!loading && personas.length === 0 && !error && (
        <div className="empty-state">Todavía no hay personas registradas.</div>
      )}

      {personas.length > 0 && (
        <table className="ledger">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Rol</th>
              <th>Correo</th>
              <th>Cuota mínima</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {personas.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.nombre} {p.apellido}
                </td>
                <td className="num">
                  {nombreTipoDocumento(p.idTipoDocumento)} {p.numeroDocumento}
                </td>
                <td>{nombreRol(p.idRol)}</td>
                <td>{p.correo || '—'}</td>
                <td className="num">{p.cuotaMinima != null ? `$${p.cuotaMinima}` : '—'}</td>
                <td className="actions">
                  <button className="row-btn" onClick={() => abrirEditar(p)}>
                    Editar
                  </button>
                  <button className="row-btn danger" onClick={() => eliminar(p)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
