import { BarChart2, TrendingUp, Award, MapPin } from 'lucide-react'

const STATS = [
  { label: 'Total Reported', value: '1,247', icon: '📊', color: 'var(--color-primary)' },
  { label: 'Resolved', value: '863', icon: '✅', color: 'var(--color-success)' },
  { label: 'In Progress', value: '284', icon: '🔧', color: 'var(--color-warning)' },
  { label: 'Disputed', value: '23', icon: '⚠️', color: 'var(--color-danger)' },
]

const TOP_ISSUES = [
  { type: 'Potholes', count: 412, pct: 33 },
  { type: 'Water Leakage', count: 287, pct: 23 },
  { type: 'Streetlights', count: 198, pct: 16 },
  { type: 'Garbage', count: 176, pct: 14 },
  { type: 'Other', count: 174, pct: 14 },
]

export default function Dashboard() {
  return (
    <div>
      <header className="app-bar">
        <span style={{ fontWeight: 800, fontSize: '1.0625rem' }}>City Dashboard</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Bangalore, KA</span>
      </header>

      <div className="page" style={{ paddingTop: 20 }}>

        {/* AI Insights */}
        <div style={{
          background: 'linear-gradient(135deg, #1A56DB, #7C3AED)',
          borderRadius: 14, padding: '18px',
          marginBottom: 20, color: '#fff',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.8, marginBottom: 6 }}>🤖 AI INSIGHTS</div>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
            Potholes spike 78% after rainfall
          </div>
          <div style={{ fontSize: '0.8125rem', opacity: 0.85 }}>
            Zone 3 reports 78% of pothole cases within 24hrs of rain. Ward 7 has highest unresolved rate at 34%.
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {STATS.map(stat => (
            <div key={stat.label} className="card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Issue Types Breakdown */}
        <div className="card" style={{ padding: '16px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 16 }}>Top Issue Types</div>
          {TOP_ISSUES.map(issue => (
            <div key={issue.type} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8375rem', marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>{issue.type}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>{issue.count} ({issue.pct}%)</span>
              </div>
              <div className="health-bar">
                <div className="health-bar-fill" style={{ width: `${issue.pct}%`, background: 'var(--color-primary)' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Department Leaderboard */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 16 }}>🏆 Department Leaderboard</div>
          {[
            { dept: 'PWD', resolved: 312, avg: '3.2 days', rank: 1 },
            { dept: 'Jal Board', resolved: 187, avg: '4.8 days', rank: 2 },
            { dept: 'Electricity Board', resolved: 156, avg: '2.1 days', rank: 3 },
            { dept: 'Municipal Corp', resolved: 208, avg: '6.5 days', rank: 4 },
          ].map(d => (
            <div key={d.dept} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0',
              borderBottom: '1px solid var(--color-border)',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: d.rank === 1 ? '#FEF3C7' : 'var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.8rem',
                color: d.rank === 1 ? '#D97706' : 'var(--color-text-muted)',
              }}>
                {d.rank}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{d.dept}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{d.resolved} resolved · avg {d.avg}</div>
              </div>
              {d.rank === 1 && <span>🏆</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
