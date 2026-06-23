import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Shield, ArrowRight, Loader } from 'lucide-react'

export default function OfficerLogin() {
  const navigate = useNavigate()
  const [departments, setDepartments] = useState([])
  const [dept, setDept] = useState('PWD')
  const [officerId, setOfficerId] = useState('')
  const [password, setPassword] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Fetch departments for dropdown
    const fetchDepts = async () => {
      try {
        const snap = await getDocs(collection(db, 'departments'))
        const depts = snap.docs.map(doc => doc.id)
        if (depts.length > 0) {
          setDepartments(depts)
          setDept(depts[0])
        }
      } catch (err) {
        console.error("Failed to fetch departments", err)
      }
    }
    fetchDepts()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const q = query(
        collection(db, 'officers'),
        where('officer_id', '==', officerId),
        where('password', '==', password),
        where('department', '==', dept)
      )
      
      const snap = await getDocs(q)
      if (snap.empty) {
        setError('Invalid Department, Officer ID, or Password.')
        setLoading(false)
        return
      }
      
      const officerData = snap.docs[0].data()
      // Store in localStorage for AuthContext to pick up
      localStorage.setItem('officer_session', JSON.stringify(officerData))
      
      // Force reload to let AuthContext initialize with officer session
      window.location.href = '/'
      
    } catch (err) {
      console.error(err)
      setError('Login failed: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC' }}>
      <header className="app-bar" style={{ justifyContent: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={24} color="#16A34A" /> NagarMitra Departmental
        </span>
      </header>

      <main style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #E2E8F0', width: '100%', maxWidth: 400, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8, color: '#0F172A', textAlign: 'center' }}>
            Officer Login
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: 24, textAlign: 'center' }}>
            Authorized government personnel only.
          </p>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', padding: 12, borderRadius: 8, fontSize: '0.875rem', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 6 }}>Department</label>
              <select 
                value={dept} 
                onChange={(e) => setDept(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.9375rem', background: '#fff' }}
              >
                {departments.length > 0 ? (
                  departments.map(d => <option key={d} value={d}>{d}</option>)
                ) : (
                  <option value="PWD">PWD</option>
                )}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 6 }}>Officer ID</label>
              <input 
                type="text" 
                placeholder="e.g. PWD001"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.9375rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 6 }}>Password</label>
              <input 
                type="password" 
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.9375rem' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
              style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8, background: '#16A34A', border: 'none' }}
            >
              {loading ? <Loader size={20} className="spin" /> : (
                <>Login as Officer <ArrowRight size={18} /></>
              )}
            </button>
            
            <button 
              type="button"
              onClick={() => navigate('/login')}
              className="btn btn-ghost"
              style={{ color: '#64748B' }}
            >
              Back to Citizen Login
            </button>
          </form>
        </div>
      </main>
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
