import { Star, Shield, Search, Award, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const BADGES = [
  { icon: '🏆', label: 'First Report', earned: true },
  { icon: '🔍', label: 'Issue Hunter', earned: true },
  { icon: '🛡️', label: 'Truth Keeper', earned: false },
  { icon: '⭐', label: 'Community Champion', earned: false },
]

export default function Profile() {
  const { user, userProfile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const displayName = user?.displayName || userProfile?.name || 'Citizen'
  const displayEmail = user?.email || ''
  const photoURL = user?.photoURL
  const citizenScore = userProfile?.citizenScore ?? 0
  return (
    <div>
      <header className="app-bar">
        <span style={{ fontWeight: 800, fontSize: '1.0625rem' }}>My Profile</span>
        <button
          className="btn btn-ghost"
          style={{ padding: '8px 10px', minHeight: 'auto', gap: 6, fontSize: '0.8125rem' }}
          onClick={handleLogout}
          id="btn-logout"
        >
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div className="page" style={{ paddingTop: 20 }}>
        {/* Profile Card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary), #7C3AED)',
          borderRadius: 16, padding: '24px', marginBottom: 20, color: '#fff', textAlign: 'center',
        }}>
          {/* Avatar */}
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              style={{
                width: 72, height: 72, borderRadius: '50%',
                border: '3px solid rgba(255,255,255,0.4)',
                margin: '0 auto 12px', display: 'block', objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', margin: '0 auto 12px',
              border: '3px solid rgba(255,255,255,0.4)',
            }}>
              {displayName[0]?.toUpperCase() || '👤'}
            </div>
          )}
          <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{displayName}</div>
          <div style={{ opacity: 0.8, fontSize: '0.85rem', marginBottom: 16 }}>{displayEmail}</div>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 12, padding: '12px 20px',
            display: 'inline-block',
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{citizenScore}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 600 }}>⭐ CITIZEN SCORE</div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Reported', value: '12' },
            { label: 'Resolved', value: '8' },
            { label: 'Upvoted', value: '24' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="card" style={{ padding: '16px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 16 }}>🏅 Badges</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {BADGES.map(badge => (
              <div key={badge.label} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px',
                borderRadius: 10,
                background: badge.earned ? 'var(--color-primary-light)' : '#F8FAFC',
                border: `1.5px solid ${badge.earned ? '#BFDBFE' : 'var(--color-border)'}`,
                opacity: badge.earned ? 1 : 0.5,
              }}>
                <span style={{ fontSize: '1.5rem' }}>{badge.icon}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: badge.earned ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Points breakdown */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 14 }}>📈 How to Earn Points</div>
          {[
            { action: 'Report valid issue', pts: '+10' },
            { action: 'Issue gets resolved', pts: '+20' },
            { action: 'Upvote an issue', pts: '+2' },
            { action: 'Successful dispute', pts: '+30' },
            { action: 'Verify resolution', pts: '+5' },
          ].map(row => (
            <div key={row.action} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '8px 0', borderBottom: '1px solid var(--color-border)',
              fontSize: '0.875rem',
            }}>
              <span style={{ color: 'var(--color-text-muted)' }}>{row.action}</span>
              <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>{row.pts}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
