import { useState, useEffect } from 'react'
import { Star, Shield, Search, Award, LogOut, Settings, Clock, MapPin, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { doc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { subscribeToUserIssues } from '../lib/issues'

const BADGE_DEFS = [
  { id: 'first_report', icon: '🏆', label: 'First Report', condition: (stats) => stats.reports > 0 },
  { id: 'issue_hunter', icon: '🔍', label: 'Issue Hunter', condition: (stats) => stats.reports >= 10 },
  { id: 'truth_keeper', icon: '🛡️', label: 'Truth Keeper', condition: (stats) => stats.disputes >= 3 },
  { id: 'champion', icon: '⭐', label: 'Community Champion', condition: (stats) => stats.score >= 100 },
]

export default function Profile() {
  const { user, userProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [reportedIssues, setReportedIssues] = useState([])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const displayName = user?.displayName || userProfile?.name || 'Citizen'
  const displayEmail = user?.email || ''
  const photoURL = user?.photoURL
  
  // Real stats from user profile
  const citizenScore = userProfile?.citizenScore ?? 0
  const reportsCount = userProfile?.reports_count ?? 0
  const disputesCount = userProfile?.disputes_count ?? 0
  
  const statsObj = { score: citizenScore, reports: reportsCount, disputes: disputesCount }
  const badges = BADGE_DEFS.map(b => ({ ...b, earned: b.condition(statsObj) }))
  
  const isOfficer = userProfile?.is_officer === true

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToUserIssues(user.uid, (issues) => {
      issues.sort((a, b) => (b.created_at?.toMillis() || 0) - (a.created_at?.toMillis() || 0))
      setReportedIssues(issues)
    }, console.error)
    return () => unsub()
  }, [user])

  const goToOfficerLogin = () => {
    navigate('/officer-login')
  }

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total Reported', value: reportsCount },
            { label: 'Disputes Filed', value: disputesCount },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badges - Hidden for officers */}
        {!isOfficer && (
          <div className="card" style={{ padding: '16px', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 16 }}>🏅 Badges</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              {badges.map(badge => (
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
        )}

        {/* Points breakdown - Hidden for officers */}
        {!isOfficer && (
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
        )}

        {/* Reported Issues History - Hidden for officers */}
        {!isOfficer && (
          <div style={{ marginTop: 24, marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 12 }}>My Reported Issues</div>
            {reportedIssues.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem', background: '#F8FAFC', borderRadius: 12 }}>
                You haven't reported any issues yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reportedIssues.map(issue => (
                  <Link key={issue.id} to={`/issue/${issue.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card" style={{ padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center' }}>
                      {issue.photos?.before?.[0] ? (
                        <img src={issue.photos.before[0]} alt="issue" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 60, height: 60, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          📷
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{issue.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                          <MapPin size={12} /> {issue.location?.address?.split(',')[0] || 'Unknown location'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ 
                            fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                            background: issue.status.includes('resolved') ? '#DCFCE7' : '#FEF9C3',
                            color: issue.status.includes('resolved') ? '#166534' : '#854D0E'
                          }}>
                            {issue.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Departmental Login Section */}
        <div style={{ marginTop: 32, padding: 24, background: '#F8FAFC', borderRadius: 16, textAlign: 'center' }}>
          <Shield size={32} color="#64748B" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: 8 }}>Authorized Personnel</h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: 16 }}>Login to manage issues and resolutions for your department.</p>
          <button 
            className="btn btn-ghost" 
            onClick={goToOfficerLogin}
            style={{ border: '1px solid #CBD5E1', color: '#475569', background: '#fff' }}
          >
            Departmental Login
          </button>
        </div>
      </div>
    </div>
  )
}
