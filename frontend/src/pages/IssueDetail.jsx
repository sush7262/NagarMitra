import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, ThumbsUp, Loader, AlertTriangle } from 'lucide-react'
import { fetchIssueById, formatTimeAgo } from '../lib/issues'

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

function buildTimeline(issue) {
  const reported = formatTimeAgo(issue.created_at)
  const isResolved = ['resolved', 'verified_resolved'].includes(issue.status)
  const isVerified = issue.status === 'verified_resolved'
  const isInProgress = issue.status === 'in_progress'

  return [
    { icon: '📤', label: 'Issue Reported', time: reported || 'Recently', done: true },
    { icon: '🤖', label: 'AI Analysis Complete', time: `${reported} (auto)`, done: true },
    { icon: '📋', label: `Routed to ${issue.department || 'Department'}`, time: `${reported} (auto)`, done: true },
    { icon: '🔧', label: 'Officer Assigned', time: isInProgress || isResolved ? 'In progress' : 'Pending', done: isInProgress || isResolved },
    { icon: '✅', label: 'Marked Resolved', time: isResolved ? formatTimeAgo(issue.resolved_at) || 'Done' : 'Pending', done: isResolved },
    { icon: '🏁', label: 'Citizen Verified', time: isVerified ? 'Verified' : 'Pending', done: isVerified },
  ]
}

export default function IssueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchIssueById(id)
      .then((data) => {
        if (!data) setError('Issue not found.')
        else setIssue(data)
      })
      .catch((err) => setError(err.message || 'Could not load issue.'))
      .finally(() => setLoading(false))
  }, [id])

  const photoUrl = issue?.photos?.before?.[0]
  const severityPct = issue ? Math.min(100, (issue.severity_score ?? 5) * 10) : 0
  const timeline = issue ? buildTimeline(issue) : []

  return (
    <div>
      <header className="app-bar">
        <button className="btn btn-ghost" style={{ padding: '8px', minHeight: 'auto' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <span style={{ fontWeight: 700, fontSize: '1rem' }}>Issue Detail</span>
        <div style={{ width: 38 }} />
      </header>

      {loading && (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
          <Loader size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          Loading issue…
        </div>
      )}

      {error && !loading && (
        <div style={{
          margin: 16, padding: 14, background: '#FEF2F2',
          border: '1px solid #FECACA', borderRadius: 10,
          fontSize: '0.85rem', color: '#B91C1C',
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {issue && !loading && (
        <div className="page" style={{ paddingTop: 16 }}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={issue.title}
              style={{ width: '100%', borderRadius: 12, aspectRatio: '16/9', objectFit: 'cover', marginBottom: 16 }}
            />
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, #CBD5E1, #94A3B8)',
              borderRadius: 12, aspectRatio: '16/9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16, fontSize: '3rem',
            }}>
              🏙️
            </div>
          )}

          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            <span className={severityClass(issue.severity_label)}>{issue.severity_label}</span>
            <span className={statusClass(issue.status)}>{statusLabel(issue.status)}</span>
            {issue.department && (
              <span className="badge" style={{ background: '#F0FDF4', color: '#15803D' }}>{issue.department}</span>
            )}
          </div>

          <h1 style={{ fontSize: '1.1875rem', fontWeight: 800, marginBottom: 8 }}>{issue.title}</h1>

          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start', color: 'var(--color-text-muted)', fontSize: '0.8375rem', marginBottom: 14 }}>
            <MapPin size={14} style={{ marginTop: 2, flexShrink: 0 }} />
            <span>{issue.location?.address || 'Unknown location'}</span>
          </div>

          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 16, lineHeight: 1.6 }}>
            {issue.description}
          </p>

          {issue.ai_confidence != null && (
            <div className="card" style={{ padding: '12px 14px', marginBottom: 16, background: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 6 }}>🤖 AI Analysis</div>
              <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                <div><strong>Type:</strong> {issue.issue_type?.replace('_', ' ')}</div>
                <div><strong>Severity:</strong> {issue.severity_score}/10</div>
                <div><strong>Confidence:</strong> {Math.round((issue.ai_confidence ?? 0) * 100)}%</div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>
              <span>Severity Score</span>
              <span style={{ color: `var(--severity-${issue.severity_label?.toLowerCase() || 'medium'})` }}>
                {issue.severity_score}/10 — {issue.severity_label}
              </span>
            </div>
            <div className="health-bar">
              <div
                className="health-bar-fill"
                style={{
                  width: `${severityPct}%`,
                  background: `var(--severity-${issue.severity_label?.toLowerCase() || 'medium'})`,
                }}
              />
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 16 }}>
            Reported by <strong>{issue.reporter_name || 'Citizen'}</strong> · {formatTimeAgo(issue.created_at)}
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginBottom: 16 }} id="btn-upvote">
            <ThumbsUp size={18} />
            Support this Issue · {issue.upvote_count ?? 0} citizens
          </button>

          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 16 }}>📋 Resolution Timeline</div>
            {timeline.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < timeline.length - 1 ? 16 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: step.done ? 'var(--color-primary-light)' : 'var(--color-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', flexShrink: 0,
                  }}>
                    {step.icon}
                  </div>
                  {i < timeline.length - 1 && (
                    <div style={{ width: 2, flex: 1, background: step.done ? 'var(--color-primary)' : 'var(--color-border)', marginTop: 4, minHeight: 16 }} />
                  )}
                </div>
                <div style={{ paddingBottom: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: step.done ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{step.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
