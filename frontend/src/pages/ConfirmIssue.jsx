// ConfirmIssue — placeholder for Task 2.4 (Duplicate Detection) + Task 2.5 (Save to Firestore)
// Will be fully implemented in Task 2.4.
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, Send } from 'lucide-react'

export default function ConfirmIssue() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const draft = state?.draft
  const photos = state?.photos || []

  if (!draft) { navigate('/report', { replace: true }); return null }

  return (
    <div>
      <header className="app-bar">
        <button
          className="btn btn-ghost"
          style={{ padding: '8px 10px', minHeight: 'auto', marginLeft: -8 }}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={22} />
        </button>
        <span style={{ fontWeight: 800, fontSize: '1.0625rem' }}>Confirm & Submit</span>
        <div style={{ width: 40 }} />
      </header>

      <div className="page" style={{ paddingTop: 16, paddingBottom: 32 }}>
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 12 }}>📋 Issue Summary</div>
          <div style={{ fontSize: '0.875rem', lineHeight: 2, color: 'var(--color-text-muted)' }}>
            <div><strong style={{ color: 'var(--color-text)' }}>Title:</strong> {draft.title}</div>
            <div><strong style={{ color: 'var(--color-text)' }}>Type:</strong> {draft.issueType?.replace('_', ' ')}</div>
            <div><strong style={{ color: 'var(--color-text)' }}>Severity:</strong> {draft.severityLabel}</div>
            <div><strong style={{ color: 'var(--color-text)' }}>Department:</strong> {draft.department}</div>
            {draft.location && <div><strong style={{ color: 'var(--color-text)' }}>Location:</strong> {draft.location.address}</div>}
            <div><strong style={{ color: 'var(--color-text)' }}>Photos:</strong> {photos.length} attached</div>
          </div>
        </div>

        <div style={{
          padding: '12px 14px',
          background: '#FFFBEB', border: '1.5px solid #FDE68A',
          borderRadius: 10, marginBottom: 20,
          fontSize: '0.8rem', color: '#B45309',
        }}>
          ⚙️ <strong>Task 2.4 &amp; 2.5</strong> will wire up duplicate detection and Firestore save here.
        </div>

        <button
          className="btn btn-primary"
          style={{
            width: '100%', fontSize: '1rem', minHeight: 52, gap: 10,
            background: 'linear-gradient(135deg, #F97316, #EF4444)',
            borderColor: 'transparent',
          }}
          onClick={() => navigate('/', { replace: true })}
          id="btn-final-submit"
        >
          <Send size={20} /> Submit Issue
        </button>
      </div>
    </div>
  )
}
