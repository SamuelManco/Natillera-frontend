import { useEffect, useState } from 'react'
import { resumenApi } from '../api/resumen'
import { prestamosApi } from '../api/prestamos'
import { mensajeError } from '../api/errores'

const pesos = (n) => '$' + Number(n ?? 0).toLocaleString('es-CO')

function Stat({ etiqueta, valor, nota, destacado }) {
  return (
    <div className={'stat' + (destacado ? ' stat-key' : '')}>
      <div className="stat-label">{etiqueta}</div>
      <div className="stat-value">{valor}</div>
      {nota && <div className="stat-note">{nota}</div>}
    </div>
  )
}

export default function NatilleraPage() {
  const [resumen, setResumen] = useState(null)
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  async function cargar(d, h) {
    setLoading(true)
    setError(null)
    try {
      setResumen(await resumenApi.obtener(d, h))
    } catch (err) {
      setError(mensajeError(err, 'No se pudo cargar el resumen de la natillera. ¿Ya existe una natillera creada?'))
    } finally {
      setLoading(false)
    }
    try {
      setAlertas(await prestamosApi.alertas())
    } catch (errAlertas) {
      setAlertas([]) // si las alertas fallan, el resumen igual se muestra
    }
  }

  useEffect(() => {
    cargar('', '')
  }, [])

  function aplicarFiltro(e) {
    e.preventDefault()
    cargar(desde, hasta)
  }

  function limpiarFiltro() {
    setDesde('')
    setHasta('')
    cargar('', '')
  }

  return (
    <>
      <h1 className="page-title">{resumen?.nombreNatillera || 'Natillera'}</h1>
      <p className="page-subtitle">
        Cuánto se ha ahorrado, cuántos intereses ha generado el fondo y cómo está el capital.
      </p>

      {error && <div className="banner error">{error}</div>}

      {alertas.map((a) => (
        <div key={a.idPrestamo} className={'banner ' + (a.nivel === 'VENCIDO' ? 'error' : 'warn')}>
          <strong>{a.nivel === 'VENCIDO' ? 'Plazo vencido: ' : 'Atención: '}</strong>
          {a.mensaje}
        </div>
      ))}

      <form className="filters" onSubmit={aplicarFiltro}>
        <div className="field">
          <label htmlFor="desde">Desde</label>
          <input id="desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="hasta">Hasta</label>
          <input id="hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <button className="btn" type="submit" disabled={loading}>Filtrar</button>
        {(desde || hasta) && (
          <button className="btn secondary" type="button" onClick={limpiarFiltro}>Quitar filtro</button>
        )}
      </form>

      {loading && !resumen && <span className="banner loading">Cargando...</span>}

      {resumen && (
        <>
          <div className="stats">
            <Stat destacado etiqueta="Total ahorrado" valor={pesos(resumen.totalAhorrado)}
              nota="Aportes + premios de rifa" />
            <Stat destacado etiqueta="Total de intereses generado" valor={pesos(resumen.totalIntereses)}
              nota="Fondo que se reparte al liquidar" />
            <Stat destacado etiqueta="Capital total" valor={pesos(resumen.totalCapital)}
              nota="Ahorro + intereses" />
            <Stat destacado etiqueta="Disponible en caja" valor={pesos(resumen.disponibleEnCaja)}
              nota="Capital menos préstamos por cobrar y pagos entregados" />
          </div>

          <h2 className="section-title">Detalle</h2>
          <div className="stats">
            <Stat etiqueta="Aportes de los socios" valor={pesos(resumen.totalAportes)} />
            <Stat etiqueta="Premios de rifa (suman al ahorro)" valor={pesos(resumen.totalPremiosRifa)} />
            <Stat etiqueta="Intereses de préstamos" valor={pesos(resumen.interesesPrestamos)} />
            <Stat etiqueta="Rifas sin ganador (van al capital)" valor={pesos(resumen.ingresosRifa)} />
            <Stat etiqueta="Préstamos por cobrar" valor={pesos(resumen.prestamosPorCobrar)}
              nota={`${resumen.prestamosActivos} préstamo(s) activo(s)`} />
            <Stat etiqueta="Pagos de liquidación entregados" valor={pesos(resumen.pagosLiquidacion)} />
          </div>

          <h2 className="section-title">Ahorro por socio ({resumen.numeroSocios})</h2>
          {resumen.ahorroPorSocio?.length > 0 ? (
            <table className="ledger">
              <thead>
                <tr>
                  <th>Socio</th>
                  <th>Cuota mínima</th>
                  <th>Ahorrado</th>
                </tr>
              </thead>
              <tbody>
                {resumen.ahorroPorSocio.map((s) => (
                  <tr key={s.idPersona}>
                    <td>{s.nombre}</td>
                    <td className="num">{s.cuotaMinima ? pesos(s.cuotaMinima) : '—'}</td>
                    <td className="num">{pesos(s.ahorrado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">Todavía no hay socios registrados.</div>
          )}

          <p className="footnote">
            El premio de una rifa cuenta como ahorro de quien la ganó. Si nadie gana, el dinero de la rifa queda
            en el capital y se reparte como intereses al liquidar.
            {(resumen.desde || resumen.hasta) && ' Los totales corresponden al rango de fechas filtrado; los préstamos por cobrar siempre son los de hoy.'}
          </p>
        </>
      )}
    </>
  )
}
