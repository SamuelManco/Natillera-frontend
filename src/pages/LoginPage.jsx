import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/natillera" replace />
  }

  const handleSuccess = async (credentialResponse) => {
    setError('')
    setLoading(true)
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/google`,
        { credential: credentialResponse.credential }
      )
      login(data)
      navigate('/natillera', { replace: true })
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'No se pudo iniciar sesión. Verifica que tu correo esté registrado como administrador.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleError = () => {
    setError('No se pudo completar la ventana de Google.')
  }

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div style={{ maxWidth: 400, width: '100%', padding: '2rem', border: '1px solid #ddd', borderRadius: 12, textAlign: 'center' }}>
        <h1>Natillera</h1>
        <p>Acceso exclusivo para el administrador</p>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap={false}
          />
        </div>

        {loading && <p style={{ marginTop: '1rem' }}>Validando credenciales...</p>}
        {error && (
          <p style={{ marginTop: '1rem', color: '#b91c1c', fontSize: '0.9rem' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}