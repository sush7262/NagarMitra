import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MapPin, List, Map, Loader, CheckCircle } from 'lucide-react'
import MapView from '../components/MapView'
import {
  subscribeToIssues,
  filterIssues,
  computeStats,
  formatTimeAgo,
} from '../lib/issues'

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
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const [statusFilter, setStatusFilter] = useState('All')
  const [successMsg, setSuccessMsg] = useState(location.state?.successMsg || '')

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

  const filtered = filterIssues(issues, statusFilter)
  const stats = computeStats(issues)

  return (
    <div>
      <header className="app-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MapPin size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>NagarMitra</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              {issues.length > 0 ? `${issues.length} issues nearby` : 'Your city'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className={`btn btn-ghost ${viewMode === 'list' ? 'active' : ''}`}
            style={{ padding: '8px 10px', minHeight: 'auto' }}
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <List size={18} />
          </button>
          <button
            className={`btn btn-ghost ${viewMode === 'map' ? 'active' : ''}`}
            style={{ padding: '8px 10px', minHeight: 'auto' }}
            onClick={() => setViewMode('map')}
            aria-label="Map view"
          >
            <Map size={18} />
          </button>
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

      <div style={{
        background: 'var(--color-primary)',
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 0,
      }}>
        {[
          { label: 'Reported', value: stats.reported },
          { label: 'In Progress', value: stats.inProgress },
          { label: 'Resolved', value: stats.resolved },
        ].map((stat, i) => (
          <div key={i} style={{
            textAlign: 'center',
            padding: '0 8px',
            borderRight: i < 2 ? '1px solid rgba(255,255,255,0.2)' : 'none',
          }}>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#fff' }}>{stat.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 16px',
        display: 'flex',
        gap: 4,
        overflowX: 'auto',
      }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            style={{
              padding: '12px 14px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: statusFilter === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
              background: 'none',
              border: 'none',
              borderBottom: statusFilter === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab}
          </button>
        ))}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map((issue, idx) => {
                const thumb = issue.photos?.before?.[0]
                return (
                  <div
                    key={issue.id}
                    className="card fade-in"
                    style={{ cursor: 'pointer', animationDelay: `${idx * 0.07}s`, overflow: 'hidden' }}
                    onClick={() => navigate(`/issue/${issue.id}`)}
                  >
                    <div style={{ height: 4, background: severityBarColor(issue.severity_label) }} />

                    {thumb && (
                      <img
                        src={thumb}
                        alt={issue.title}
                        style={{ width: '100%', height: 140, objectFit: 'cover' }}
                      />
                    )}

                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span className={severityClass(issue.severity_label)}>{issue.severity_label}</span>
                        <span className={statusClass(issue.status)}>{statusLabel(issue.status)}</span>
                      </div>

                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 6, color: 'var(--color-text)' }}>
                        {issue.title}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: 12 }}>
                        <MapPin size={13} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {issue.location?.address || 'Unknown location'}
                        </span>
                        <span style={{ flexShrink: 0 }}>· {formatTimeAgo(issue.created_at)}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: 'var(--color-primary-light)',
                          color: 'var(--color-primary)',
                          borderRadius: 20, padding: '6px 14px',
                          fontSize: '0.8125rem', fontWeight: 600,
                        }}>
                          👍 {issue.upvote_count ?? 0} Support
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                          {issue.issue_type?.replace('_', ' ')}
                        </span>
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
