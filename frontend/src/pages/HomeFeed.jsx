import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, List, Map, Loader, CheckCircle, Search, Clock, ChevronLeft, ChevronRight, MessageCircle, ArrowUp } from 'lucide-react'
import MapView from '../components/MapView'
import {
  subscribeToIssues,
  filterIssues,
  computeStats,
  formatTimeAgo,
  haversineMeters,
  upvoteExistingIssue,
} from '../lib/issues'
import { useAuth } from '../context/AuthContext'

const STATUS_TABS = ['All', 'Open', 'In Progress', 'Resolved']

const severityClass = (label) => {
  const map = { Critical: 'critical', High: 'high', Medium: 'medium', Low: 'low' }
  return `badge badge-${map[label] || 'low'}`
}

const statusClass = (status) => {
  const map = {
    open: 'open',
    in_progress: 'in-progress',
    resolved: 'resolved',
    verified_resolved: 'verified',
    disputed: 'disputed',
  }
  return `badge badge-${map[status] || 'open'}`
}

const statusLabel = (status) => {
  const map = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    verified_resolved: 'Verified ✅',
    disputed: 'Disputed ❌',
  }
  return map[status] || status
}

const severityBarColor = (label) => {
  if (label === 'Critical') return 'var(--severity-critical)'
  if (label === 'High') return 'var(--severity-high)'
  if (label === 'Medium') return 'var(--severity-medium)'
  return 'var(--severity-low)'
}

export default function HomeFeed() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState(location.pathname === '/map' ? 'map' : 'list')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [successMsg, setSuccessMsg] = useState(location.state?.successMsg || '')

  useEffect(() => {
    setViewMode(location.pathname === '/map' ? 'map' : 'list')
  }, [location.pathname])
  const [userLocation, setUserLocation] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('Location disabled or error:', err)
      )
    }
  }, [])

  useEffect(() => {
    if (location.state?.successMsg) {
      setSuccessMsg(location.state.successMsg)
      navigate('.', { replace: true, state: {} })
    }
  }, [location.state?.successMsg, navigate])

  useEffect(() => {
    const unsub = subscribeToIssues(
      (data) => {
        setIssues(data)
        setLoading(false)
        setError('')
      },
      (err) => {
        setError(err.message || 'Could not load issues.')
        setLoading(false)
      }
    )
    return unsub
  }, [])

  const filtered = filterIssues(issues, statusFilter).filter(i =>
    typeFilter === 'All' ? true : i.issue_type === typeFilter
  )
  const stats = computeStats(issues)

  const handleUpvote = async (e, issue) => {
    e.stopPropagation() // Prevent navigating to detail page
    if (!user) {
      navigate('/login')
      return
    }
    // Optimistic UI could be added here, but for now just call the DB
    if (!issue.supporters?.includes(user.uid)) {
      try {
        await upvoteExistingIssue(issue.id, user.uid)
      } catch (err) {
        console.error('Upvote failed:', err)
      }
    }
  }

  return (
    <div>
      <header style={{ padding: '16px 16px 12px', background: '#FFFFFF', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#16A34A', margin: 0 }}>{t('NagarMitra')}</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>{t('Siliguri Municipal Corporation')}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#16A34A', margin: 0 }}>5 {t('Active Reports')}</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>{t('Real-time updates')}</p>
          </div>
        </div>

        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder={t('Search')}
            style={{
              width: '100%',
              padding: '10px 10px 10px 38px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              fontSize: '0.875rem',
              outline: 'none',
              background: '#F8FAFC'
            }}
          />
        </div>


      </header>

      {successMsg && (
        <div style={{
          margin: '12px 16px 0',
          padding: '12px 14px',
          background: '#F0FDF4', border: '1.5px solid #86EFAC',
          borderRadius: 10, fontSize: '0.85rem', color: '#166534',
          display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <CheckCircle size={18} color="#16A34A" />
          {successMsg}
        </div>
      )}



      <div className="my-6 py-3 border-y border-slate-800/50" style={{
        background: 'var(--color-surface)',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        overflowX: 'auto',
      }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            style={{
              padding: '6px 10px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: statusFilter === tab ? '#fff' : 'var(--color-text-muted)',
              background: statusFilter === tab ? 'var(--color-primary)' : '#F1F5F9',
              border: 'none',
              borderRadius: 20,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab}
          </button>
        ))}

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            marginLeft: 'auto',
            padding: '6px 10px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            borderRadius: 20,
            border: '1px solid var(--color-border)',
            background: '#fff',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="All">All Types</option>
          <option value="pothole">Pothole</option>
          <option value="water_leak">Water Leak</option>
          <option value="waste">Garbage</option>
          <option value="streetlight">Streetlight</option>
        </select>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
          <Loader size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          Loading issues…
        </div>
      )}

      {error && !loading && (
        <div style={{
          margin: 16, padding: 14, background: '#FEF2F2',
          border: '1px solid #FECACA', borderRadius: 10,
          fontSize: '0.85rem', color: '#B91C1C',
        }}>
          {error}
        </div>
      )}

      {!loading && !error && viewMode === 'map' && (
        <div style={{ padding: '16px 16px 0' }}>
          <MapView
            issues={filtered}
            height="420px"
            onIssueClick={(issue) => navigate(`/issue/${issue.id}`)}
          />
        </div>
      )}

      {!loading && !error && viewMode === 'list' && (
        <div className="page" style={{ paddingTop: 16 }}>
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '48px 24px',
              color: 'var(--color-text-muted)',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏙️</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6, color: 'var(--color-text)' }}>
                No issues found
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                {statusFilter === 'All'
                  ? 'Be the first to report a civic issue in your area!'
                  : `No ${statusFilter.toLowerCase()} issues right now.`}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {filtered.map((issue, idx) => {
                const thumb = issue.photos?.before?.[0]
                return (
                  <div key={issue.id} style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    {/* Location Header */}
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <MapPin size={16} color="#64748B" />
                        <span style={{ fontWeight: '800', fontSize: '1.00rem', color: '#0F172A' }}>
                          {issue.location?.address?.split(',')[0] || 'Unknown Location'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem', fontWeight: '700', color: '#475569', paddingLeft: '24px' }}>
                        <span>
                          {issue.location?.address?.split(',')[1]?.trim() || 'Siliguri'} •
                          {(() => {
                            if (userLocation && issue.location?.lat) {
                              const dist = haversineMeters(userLocation.lat, userLocation.lng, issue.location.lat, issue.location.lng)
                              return ` ${(dist / 1000).toFixed(1)}km away`
                            }
                            return ' 0.3km away' // fallback
                          })()}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {formatTimeAgo(issue.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '16px', cursor: 'pointer' }} onClick={() => navigate(`/issue/${issue.id}`)}>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: '600', color: '#0F172A' }}>
                        {issue.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: '1.5' }}>
                        {issue.description || 'Deep pothole near Mahabirsthan causing severe traffic disruption and vehicle damage.'}
                      </p>
                    </div>

                    {/* Image with Carousel */}
                    {thumb && (
                      <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                        <img src={thumb} alt={issue.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <ChevronLeft size={20} />
                        </button>
                        <button style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div style={{ padding: '16px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <button
                        onClick={(e) => handleUpvote(e, issue)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#475569', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}
                      >
                        <ArrowUp size={16} /> {issue.upvote_count ?? 0}
                      </button>

                      <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#475569', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
                        <MessageCircle size={16} /> {issue.comment_count ?? 3}
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: '#FEF2F2', fontSize: '0.8125rem', fontWeight: '600', color: '#0F172A', marginLeft: 'auto' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444' }} />
                        {issue.severity_label || 'High'}
                      </div>

                      <div style={{ padding: '4px 10px', borderRadius: '8px', background: '#FEE2E2', color: '#B91C1C', fontSize: '0.8125rem', fontWeight: '600' }}>
                        Status: {issue.status === 'in_progress' ? 'In Progress' : issue.status === 'resolved' ? 'Resolved' : 'Pending'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {!loading && !error && viewMode === 'map' && filtered.length > 0 && (
        <div className="page" style={{ paddingTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 10, color: 'var(--color-text-muted)' }}>
            {filtered.length} issue{filtered.length !== 1 ? 's' : ''} on map
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.slice(0, 5).map(issue => (
              <button
                key={issue.id}
                type="button"
                onClick={() => navigate(`/issue/${issue.id}`)}
                style={{
                  textAlign: 'left', background: '#fff', border: '1px solid var(--color-border)',
                  borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{issue.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {issue.severity_label} · {issue.location?.address}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
