import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, Send, Loader, AlertTriangle, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { uploadImage } from '../lib/storage'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'

export default function ConfirmIssue() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const draft = state?.draft
  const photos = state?.photos || []

  const [submitting, setSubmitting] = useState(false)
  const [duplicateMessage, setDuplicateMessage] = useState('')
  const [error, setError] = useState('')

  if (!draft) { navigate('/report', { replace: true }); return null }

  const handleFinalSubmit = async () => {
    setSubmitting(true)
    setError('')
    setDuplicateMessage('')

    try {
      // 1. Check duplicates
      const checkRes = await fetch(`${BACKEND_URL}/api/check-duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue_type: draft.issueType,
          location: draft.location,
          reporter_uid: user?.uid || 'anonymous',
        }),
      })

      if (!checkRes.ok) {
        const err = await checkRes.json()
        if (checkRes.status === 503) {
           setError('Firebase service account not configured yet (Task 2.5 dependency). Duplicate check skipped.')
           setSubmitting(false)
           return
        }
        throw new Error(err.detail || 'Duplicate check failed')
      }

      const checkData = await checkRes.json()

      if (checkData.is_duplicate) {
        setDuplicateMessage(checkData.message)
        setSubmitting(false)
        return
      }

      // 2. Upload photos
      const uploadedUrls = []
      for (const photo of photos) {
        if (!photo.file) continue
        const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}`
        const path = `issues/${user?.uid || 'anonymous'}/${filename}`
        const url = await uploadImage(photo.file, path)
        uploadedUrls.push(url)
      }

      // 3. Save to backend
      const submitRes = await fetch(`${BACKEND_URL}/api/submit-issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title,
          description: draft.description,
          issue_type: draft.issueType,
          severity_score: draft.severityScore || 5,
          severity_label: draft.severityLabel || 'Medium',
          department: draft.department || 'Municipal',
          reporter_uid: user?.uid || 'anonymous',
          reporter_name: user?.displayName || 'Citizen',
          location: draft.location,
          photos: { before: uploadedUrls },
          ai_confidence: draft.aiConfidence || 0
        }),
      })

      if (!submitRes.ok) {
        const err = await submitRes.json()
        throw new Error(err.detail || 'Submit failed')
      }

      const submitData = await submitRes.json()
      
      navigate('/', { replace: true, state: { successMsg: submitData.message } })
      
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        setError('Could not connect to backend server. Make sure FastAPI is running on port 8000.')
      } else {
        setError(err.message || 'Something went wrong.')
      }
    } finally {
      setSubmitting(false)
    }
  }

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

        {duplicateMessage && (
          <div style={{
            padding: '12px 14px',
            background: '#F0FDF4', border: '1.5px solid #86EFAC',
            borderRadius: 10, marginBottom: 20,
            fontSize: '0.85rem', color: '#166534',
            display: 'flex', gap: 10, alignItems: 'flex-start'
          }}>
            <CheckCircle size={18} color="#16A34A" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Report Logged as Support!</div>
              {duplicateMessage}
            </div>
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px 14px',
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 10, marginBottom: 20,
            fontSize: '0.85rem', color: '#B91C1C',
            display: 'flex', gap: 10, alignItems: 'flex-start'
          }}>
            <AlertTriangle size={18} color="#EF4444" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>{error}</div>
          </div>
        )}

        {!duplicateMessage && (
          <button
            className="btn btn-primary"
            style={{
              width: '100%', fontSize: '1rem', minHeight: 52, gap: 10,
              background: 'linear-gradient(135deg, #F97316, #EF4444)',
              borderColor: 'transparent',
            }}
            onClick={handleFinalSubmit}
            disabled={submitting}
            id="btn-final-submit"
          >
            {submitting ? (
              <><Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
            ) : (
              <><Send size={20} /> Submit Issue</>
            )}
          </button>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
