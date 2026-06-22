import { ArrowLeft, MapPin, ThumbsUp, Clock, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const MOCK_ISSUE = {
  id: '1',
  title: 'Large pothole on MG Road near bus stop',
  description: 'There is a large pothole near the bus stop on MG Road. It has been causing accidents and vehicle damage for over a week.',
  issue_type: 'pothole',
  severity_score: 9,
  severity_label: 'Critical',
  department: 'PWD',
  status: 'open',
  reporter_name: 'Rahul Sharma',
  location: { address: 'MG Road, Near Bus Stop No. 14, Bangalore, KA 560001' },
  upvote_count: 42,
  created_at: '2 hours ago',
  ai_confidence: 0.94,
}

const TIMELINE = [
  { icon: '📤', label: 'Issue Reported', time: '2 hrs ago', done: true },
  { icon: '🤖', label: 'AI Analysis Complete', time: '2 hrs ago (auto)', done: true },
  { icon: '📋', label: 'Routed to PWD', time: '2 hrs ago (auto)', done: true },
  { icon: '🔧', label: 'Officer Assigned', time: 'Pending', done: false },
  { icon: '✅', label: 'Marked Resolved', time: 'Pending', done: false },
  { icon: '🏁', label: 'Citizen Verified', time: 'Pending', done: false },
]

export default function IssueDetail() {
  const navigate = useNavigate()

  return (
    <div>
      <header className="app-bar">
        <button className="btn btn-ghost" style={{ padding: '8px', minHeight: 'auto' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <span style={{ fontWeight: 700, fontSize: '1rem' }}>Issue Detail</span>
        <div style={{ width: 38 }} />
      </header>

      <div className="page" style={{ paddingTop: 16 }}>
        {/* Photo placeholder */}
        <div style={{
          background: 'linear-gradient(135deg, #CBD5E1, #94A3B8)',
          borderRadius: 12, aspectRatio: '16/9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16, fontSize: '3rem',
        }}>
          🕳️
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          <span className="badge badge-critical">Critical</span>
          <span className="badge badge-open">Open</span>
          <span className="badge" style={{ background: '#F0FDF4', color: '#15803D' }}>PWD</span>
        </div>

        <h1 style={{ fontSize: '1.1875rem', fontWeight: 800, marginBottom: 8 }}>{MOCK_ISSUE.title}</h1>

        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start', color: 'var(--color-text-muted)', fontSize: '0.8375rem', marginBottom: 14 }}>
          <MapPin size={14} style={{ marginTop: 2, flexShrink: 0 }} />
          <span>{MOCK_ISSUE.location.address}</span>
        </div>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 16, lineHeight: 1.6 }}>
          {MOCK_ISSUE.description}
        </p>

        {/* AI Info Card */}
        <div className="card" style={{ padding: '12px 14px', marginBottom: 16, background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 6 }}>🤖 AI Analysis</div>
          <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            <div><strong>Type:</strong> Pothole</div>
            <div><strong>Severity:</strong> 9/10</div>
            <div><strong>Confidence:</strong> 94%</div>
          </div>
        </div>

        {/* Severity Health Bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>
            <span>Severity Score</span>
            <span style={{ color: 'var(--severity-critical)' }}>9/10 — Critical</span>
          </div>
          <div className="health-bar">
            <div className="health-bar-fill" style={{ width: '90%', background: 'var(--severity-critical)' }} />
          </div>
        </div>

        {/* Upvote */}
        <button className="btn btn-primary" style={{ width: '100%', marginBottom: 16 }} id="btn-upvote">
          <ThumbsUp size={18} />
          Support this Issue · {MOCK_ISSUE.upvote_count} citizens
        </button>

        {/* Timeline */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 16 }}>📋 Resolution Timeline</div>
          {TIMELINE.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < TIMELINE.length - 1 ? 16 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: step.done ? 'var(--color-primary-light)' : 'var(--color-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', flexShrink: 0,
                }}>
                  {step.icon}
                </div>
                {i < TIMELINE.length - 1 && (
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
    </div>
  )
}
