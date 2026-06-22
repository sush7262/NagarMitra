import { MapPin, Filter, ChevronDown } from 'lucide-react'

const MOCK_ISSUES = [
  {
    id: '1',
    title: 'Large pothole on MG Road',
    issue_type: 'pothole',
    severity_label: 'Critical',
    status: 'open',
    location: { address: 'MG Road, Bangalore, KA' },
    upvote_count: 42,
    created_at: '2 hrs ago',
  },
  {
    id: '2',
    title: 'Water pipeline leakage near park',
    issue_type: 'water_leakage',
    severity_label: 'High',
    status: 'in_progress',
    location: { address: 'Cubbon Park Road, Bangalore' },
    upvote_count: 18,
    created_at: '5 hrs ago',
  },
  {
    id: '3',
    title: 'Streetlight not working for 3 days',
    issue_type: 'streetlight',
    severity_label: 'Medium',
    status: 'open',
    location: { address: 'Koramangala 4th Block, Bangalore' },
    upvote_count: 9,
    created_at: '1 day ago',
  },
]

const severityClass = (label) => {
  const map = { Critical: 'critical', High: 'high', Medium: 'medium', Low: 'low' }
  return `badge badge-${map[label] || 'low'}`
}

const statusClass = (status) => {
  const map = { open: 'open', in_progress: 'in-progress', resolved: 'resolved', verified_resolved: 'verified', disputed: 'disputed' }
  return `badge badge-${map[status] || 'open'}`
}

const statusLabel = (status) => {
  const map = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', verified_resolved: 'Verified ✅', disputed: 'Disputed ❌' }
  return map[status] || status
}

export default function HomeFeed() {
  return (
    <div>
      {/* App Bar */}
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
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Bangalore, KA</div>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ padding: '8px 12px', minHeight: 'auto' }}>
          <Filter size={18} />
        </button>
      </header>

      {/* Hero Stats Bar */}
      <div style={{
        background: 'var(--color-primary)',
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 0,
      }}>
        {[
          { label: 'Reported', value: '1,247' },
          { label: 'In Progress', value: '384' },
          { label: 'Resolved', value: '863' },
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

      {/* Filter Tabs */}
      <div style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 16px',
        display: 'flex',
        gap: 4,
        overflowX: 'auto',
      }}>
        {['All', 'Open', 'In Progress', 'Resolved'].map((tab, i) => (
          <button key={tab} style={{
            padding: '12px 14px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: i === 0 ? 'var(--color-primary)' : 'var(--color-text-muted)',
            background: 'none',
            border: 'none',
            borderBottom: i === 0 ? '2px solid var(--color-primary)' : '2px solid transparent',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Issue List */}
      <div className="page" style={{ paddingTop: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MOCK_ISSUES.map((issue, idx) => (
            <div
              key={issue.id}
              className="card fade-in"
              style={{ cursor: 'pointer', animationDelay: `${idx * 0.07}s` }}
            >
              {/* Severity bar */}
              <div style={{
                height: 4,
                background: issue.severity_label === 'Critical' ? 'var(--severity-critical)'
                  : issue.severity_label === 'High' ? 'var(--severity-high)'
                  : issue.severity_label === 'Medium' ? 'var(--severity-medium)'
                  : 'var(--severity-low)',
              }} />

              <div style={{ padding: '14px 16px' }}>
                {/* Badges row */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span className={severityClass(issue.severity_label)}>{issue.severity_label}</span>
                  <span className={statusClass(issue.status)}>{statusLabel(issue.status)}</span>
                </div>

                {/* Title */}
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 6, color: 'var(--color-text)' }}>
                  {issue.title}
                </div>

                {/* Location + time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: 12 }}>
                  <MapPin size={13} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {issue.location.address}
                  </span>
                  <span style={{ flexShrink: 0 }}>· {issue.created_at}</span>
                </div>

                {/* Footer: upvotes */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    border: 'none', borderRadius: 20,
                    padding: '6px 14px',
                    fontSize: '0.8125rem', fontWeight: 600,
                    cursor: 'pointer',
                  }}>
                    👍 {issue.upvote_count} Support
                  </button>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                    {issue.issue_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
