import { MapPin } from 'lucide-react'

export default function Login() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #1A56DB 0%, #7C3AED 60%, #0F172A 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
          border: '2px solid rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <MapPin size={36} color="#fff" strokeWidth={2.5} />
        </div>
        <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, marginBottom: 6 }}>NagarMitra</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9375rem', fontWeight: 500 }}>
          Aapki awaaz, aapka shehar
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: '#fff',
        borderRadius: 20, padding: '32px 24px',
        width: '100%', maxWidth: 400,
        boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
      }}>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: 6, textAlign: 'center' }}>
          Sign In
        </h2>
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', fontSize: '0.875rem', marginBottom: 28 }}>
          Report civic issues and hold officers accountable
        </p>

        {/* Google */}
        <button className="btn btn-outline" style={{ width: '100%', marginBottom: 16, gap: 12 }} id="btn-google-login">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={20} height={20} alt="Google" />
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <input className="input" type="email" placeholder="Email address" id="input-email" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <input className="input" type="password" placeholder="Password" id="input-password" />
        </div>

        <button className="btn btn-primary" style={{ width: '100%', fontSize: '1rem' }} id="btn-email-login">
          Sign In
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          New to NagarMitra?{' '}
          <span style={{ color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>Create account</span>
        </p>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: 24, textAlign: 'center' }}>
        Built with ❤️ for Vibe2Ship Hackathon 2026
      </p>
    </div>
  )
}
