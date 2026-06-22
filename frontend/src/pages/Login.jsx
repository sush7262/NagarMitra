import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MapPin, Mail, Lock, User, Eye, EyeOff, Loader } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, error, setError } = useAuth()

  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState('')

  const from = location.state?.from?.pathname || '/'

  const handleGoogleSignIn = async () => {
    setLocalError('')
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate(from, { replace: true })
    } catch (err) {
      setLocalError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setLocalError('')
    setError(null)

    if (mode === 'signup' && name.trim().length < 2) {
      setLocalError('Please enter your full name.')
      return
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password, name.trim())
      }
      navigate(from, { replace: true })
    } catch (err) {
      setLocalError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const displayError = localError || error

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #1A56DB 0%, #7C3AED 55%, #0F172A 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          width: 68, height: 68, borderRadius: 18,
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          border: '2px solid rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}>
          <MapPin size={34} color="#fff" strokeWidth={2.5} />
        </div>
        <h1 style={{ color: '#fff', fontSize: '1.875rem', fontWeight: 800, marginBottom: 4 }}>NagarMitra</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', fontWeight: 500 }}>
          Aapki awaaz, aapka shehar
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '28px 24px',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
      }}>
        {/* Mode tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--color-bg)',
          borderRadius: 10,
          padding: 4,
          marginBottom: 24,
        }}>
          {['signin', 'signup'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setLocalError('') }}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.15s',
                background: mode === m ? '#fff' : 'transparent',
                color: mode === m ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Google Sign In */}
        <button
          className="btn btn-outline"
          style={{ width: '100%', marginBottom: 16, gap: 10 }}
          id="btn-google-login"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : (
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={18} height={18} alt="Google" />
          )}
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailAuth}>
          {mode === 'signup' && (
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                className="input"
                style={{ paddingLeft: 38 }}
                type="text"
                placeholder="Full name"
                id="input-name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              className="input"
              style={{ paddingLeft: 38 }}
              type="email"
              placeholder="Email address"
              id="input-email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div style={{ position: 'relative', marginBottom: 20 }}>
            <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              className="input"
              style={{ paddingLeft: 38, paddingRight: 42 }}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              id="input-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-muted)', padding: 2,
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Error */}
          {displayError && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 8, padding: '10px 12px',
              fontSize: '0.8125rem', color: '#B91C1C',
              marginBottom: 14,
            }}>
              {displayError}
            </div>
          )}

          <button
            className="btn btn-primary"
            type="submit"
            style={{ width: '100%', fontSize: '0.9375rem', minHeight: 48 }}
            disabled={loading}
            id="btn-email-submit"
          >
            {loading ? (
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', marginTop: 24, textAlign: 'center' }}>
        Built for Vibe2Ship Hackathon 2026 · NagarMitra
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// Convert Firebase error codes to friendly messages
function friendlyError(code) {
  const map = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/invalid-credential': 'Invalid email or password.',
  }
  return map[code] || 'Something went wrong. Please try again.'
}
