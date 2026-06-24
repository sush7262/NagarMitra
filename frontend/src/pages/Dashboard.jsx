import { useState, useEffect } from 'react'
import { BarChart2, TrendingUp, Award, MapPin, AlertTriangle } from 'lucide-react'
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts'
import { subscribeToAllIssues } from '../lib/issues'
import { useAuth } from '../context/AuthContext'

const COLORS = ['#1A56DB', '#7C3AED', '#D97706', '#166534', '#DC2626']
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'

export default function Dashboard() {
  const { userProfile } = useAuth()
  const isOfficer = userProfile?.is_officer === true
  const officerDept = userProfile?.department

  const [flaggedOfficers, setFlaggedOfficers] = useState([])
  const [stats, setStats] = useState({ reported: 0, resolved: 0, inProgress: 0, disputed: 0 })
  const [topIssues, setTopIssues] = useState([])
  const [deptLeaderboard, setDeptLeaderboard] = useState([])
  const [problematicZones, setProblematicZones] = useState([])
  const [issuesThisMonth, setIssuesThisMonth] = useState(0)

  const [insights, setInsights] = useState([])
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [insightError, setInsightError] = useState('')

  const fetchInsights = async () => {
    setLoadingInsights(true)
    setInsightError('')
    try {
      const res = await fetch(`${BACKEND_URL}/api/insights`)
      if (!res.ok) throw new Error('Failed to fetch insights')
      const data = await res.json()
      setInsights(data.insights || [])
    } catch (err) {
      setInsightError('Could not generate insights at this time.')
      console.error(err)
    } finally {
      setLoadingInsights(false)
    }
  }

  useEffect(() => {
    async function fetchFlagged() {
      try {
        const q = query(collection(db, 'officers'), where('fake_closure_count', '>=', 3))
        const snap = await getDocs(q)
        const officers = snap.docs.map(doc => {
          const data = doc.data()
          const total = data.total_resolutions || 0
          const fakes = data.fake_closure_count || 0
          const valid = total > fakes ? total - fakes : 0
          const score = total > 0 ? Math.round((valid / total) * 100) : 0
          return { id: doc.id, ...data, score }
        })
        officers.sort((a, b) => b.fake_closure_count - a.fake_closure_count)
        setFlaggedOfficers(officers)
      } catch (err) {
        console.error('Failed to fetch flagged officers:', err)
      }
    }
    fetchFlagged()

    const unsubscribe = subscribeToAllIssues((issues) => {
      let reported = 0, resolved = 0, inProgress = 0, disputed = 0
      let typesCount = {}
      let deptStats = {}
      let zonesCount = {}
      let thisMonth = 0

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      issues.forEach(data => {
        
        // Calculate deptStats for leaderboard regardless of officer's own department
        if (data.department && data.created_at && data.resolved_at && (data.status === 'resolved' || data.status === 'verified_resolved')) {
          const created = data.created_at.toDate()
          const resDate = data.resolved_at.toDate()
          const hours = (resDate - created) / (1000 * 60 * 60)
          
          if (!deptStats[data.department]) deptStats[data.department] = { resolved: 0, totalHours: 0 }
          deptStats[data.department].resolved++
          deptStats[data.department].totalHours += hours
        }

        // If officer, only count their department's issues for the main stats
        if (isOfficer && officerDept && data.department !== officerDept) {
          return
        }

        reported++

        if (data.status === 'resolved' || data.status === 'verified_resolved') resolved++
        else if (data.status === 'in_progress') inProgress++
        else if (data.status === 'disputed') disputed++

        if ((data.status === 'resolved' || data.status === 'verified_resolved') && data.resolved_at) {
          const resDate = data.resolved_at.toDate()
          if (resDate >= startOfMonth) thisMonth++
        }

        if (data.issue_type) typesCount[data.issue_type] = (typesCount[data.issue_type] || 0) + 1

        if (data.location?.address) {
          const parts = data.location.address.split(',')
          const zone = parts.length > 1 ? parts[parts.length - 2].trim() : data.location.address
          zonesCount[zone] = (zonesCount[zone] || 0) + 1
        }
      })

      setStats({ reported, resolved, inProgress, disputed })
      setIssuesThisMonth(thisMonth)

      const formattedTop = Object.keys(typesCount).map(type => ({
        name: type,
        value: typesCount[type]
      })).sort((a, b) => b.value - a.value).slice(0, 5)
      setTopIssues(formattedTop)

      const formattedDept = Object.keys(deptStats).map(dept => {
        const d = deptStats[dept]
        const avgDays = (d.totalHours / d.resolved / 24).toFixed(1)
        return { dept, resolved: d.resolved, avg: `${avgDays} days` }
      }).sort((a, b) => b.resolved - a.resolved)
      
      formattedDept.forEach((d, i) => d.rank = i + 1)
      setDeptLeaderboard(formattedDept.slice(0, 4))

      const formattedZones = Object.keys(zonesCount).map(zone => ({
        zone, count: zonesCount[zone]
      })).sort((a, b) => b.count - a.count).slice(0, 3)
      setProblematicZones(formattedZones)
    })

    return () => unsubscribe()
  }, [])

  const STATS_ARRAY = [
    { label: 'Total Reported', value: stats.reported, icon: '📊', color: 'var(--color-primary)' },
    { label: 'Resolved', value: stats.resolved, icon: '✅', color: 'var(--color-success)' },
    { label: 'In Progress', value: stats.inProgress, icon: '🔧', color: 'var(--color-warning)' },
    { label: 'Disputed', value: stats.disputed, icon: '⚠️', color: 'var(--color-danger)' },
  ]

  return (
    <div>
      <header className="app-bar">
        <span style={{ fontWeight: 800, fontSize: '1.0625rem' }}>
          {isOfficer ? `${officerDept} Dashboard` : 'City Dashboard'}
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Siliguri, WB</span>
      </header>

      <div className="page" style={{ paddingTop: 20 }}>

        {/* Live Banner */}
        <div style={{
          background: 'var(--color-success)',
          borderRadius: 8, padding: '12px 16px',
          marginBottom: 20, color: '#fff',
          fontWeight: 700, fontSize: '0.9375rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}>
          <span>🎉</span> {issuesThisMonth} issues resolved {isOfficer ? 'by your department' : 'in your city'} this month!
        </div>

        {/* AI Insights (Task 5.3) - Only for Officers/Admins */}
        {isOfficer && (
          <div style={{
            background: 'linear-gradient(135deg, #1A56DB, #7C3AED)',
            borderRadius: 14, padding: '18px',
            marginBottom: 20, color: '#fff',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.9 }}>🤖 AI PREDICTIVE INSIGHTS</div>
              <button 
                onClick={fetchInsights}
                disabled={loadingInsights}
                style={{ 
                  background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', 
                  padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' 
                }}
              >
                {loadingInsights ? 'Analyzing...' : 'Generate New'}
              </button>
            </div>
            
            {loadingInsights ? (
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Gemini is analyzing city data...</div>
            ) : insightError ? (
              <div style={{ fontSize: '0.875rem', color: '#FECACA' }}>{insightError}</div>
            ) : insights.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.875rem', lineHeight: 1.6 }}>
                {insights.map((insight, idx) => (
                  <li key={idx} style={{ marginBottom: 6 }}>{insight}</li>
                ))}
              </ul>
            ) : (
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                Click "Generate New" to analyze recent civic issues and discover patterns.
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
          {STATS_ARRAY.map(stat => (
            <div key={stat.label} className="card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Issue Types Breakdown (Recharts) */}
        <div className="card" style={{ padding: '16px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 16 }}>Top Issue Types</div>
          {topIssues.length > 0 ? (
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topIssues}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {topIssues.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Not enough data yet.</div>
          )}
        </div>

        {/* Department Leaderboard */}
        <div className="card" style={{ padding: '16px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 16 }}>🏆 Department Leaderboard</div>
          {deptLeaderboard.length > 0 ? deptLeaderboard.map(d => (
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
          )) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No resolutions yet.</div>
          )}
        </div>

        {/* Most Problematic Zones */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 16, color: '#B91C1C' }}>🔥 Most Problematic Zones</div>
          {problematicZones.length > 0 ? problematicZones.map((z, idx) => (
            <div key={idx} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: idx < problematicZones.length - 1 ? '1px solid var(--color-border)' : 'none'
            }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{z.zone}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#B91C1C' }}>{z.count} issues</div>
            </div>
          )) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Not enough data yet.</div>
          )}
        </div>

        {/* Task 4.4: Admin View - Flagged Officers */}
        <div className="card" style={{ padding: '16px', marginTop: 20, border: '1px solid #FECACA', background: '#FEF2F2' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 16, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={18} /> Flagged Officers (Admin View)
          </div>
          {flaggedOfficers.length === 0 ? (
            <div style={{ fontSize: '0.8125rem', color: '#166534', fontWeight: 600 }}>
              ✅ No officers are currently flagged for fake closures.
            </div>
          ) : (
            <div>
              {flaggedOfficers.map(officer => (
                <div key={officer.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#fff', border: '1px solid #FECACA', padding: '12px', borderRadius: 8, marginBottom: 8
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#991B1B' }}>{officer.name} 🚩</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{officer.department} · {officer.total_resolutions || 0} Total Res.</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#DC2626' }}>{officer.fake_closure_count} Fakes</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: officer.score < 50 ? '#DC2626' : '#D97706' }}>
                      {officer.score}% Quality Score
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
