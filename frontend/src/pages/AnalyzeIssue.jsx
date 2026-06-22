import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, CheckCircle, AlertTriangle, Edit3, Loader, Zap } from 'lucide-react'

const ISSUE_TYPES = [
  { value: 'pothole', label: '🕳️ Pothole', dept: 'PWD' },
  { value: 'water_leakage', label: '💧 Water Leakage', dept: 'Jal Board' },
  { value: 'streetlight', label: '💡 Streetlight', dept: 'Electricity Board' },
  { value: 'waste', label: '🗑️ Waste / Garbage', dept: 'Municipal' },
  { value: 'encroachment', label: '🚧 Encroachment', dept: 'Municipal' },
  { value: 'road_damage', label: '🛣️ Road Damage', dept: 'PWD' },
  { value: 'drainage', label: '🌊 Drainage / Flooding', dept: 'Jal Board' },
  { value: 'other', label: '📋 Other', dept: 'Municipal' },
]

const SEVERITY_COLORS = {
  Critical: { bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C', dot: '#EF4444' },
  High: { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C', dot: '#F97316' },
  Medium: { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', dot: '#D97706' },
  Low: { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', dot: '#22C55E' },
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function AnalyzeIssue() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const draft = state?.draft
  const photos = state?.photos || []

  const [analyzing, setAnalyzing] = useState(true)
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState('')

  // Editable fields (user can override AI)
  const [title, setTitle] = useState('')
  const [issueType, setIssueType] = useState('')
  const [department, setDepartment] = useState('')
  const [severityLabel, setSeverityLabel] = useState('')
  const [description, setDescription] = useState('')
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!draft) { navigate('/report', { replace: true }); return }
    runAnalysis()
  }, [])

  const runAnalysis = async () => {
    setAnalyzing(true)
    setAiError('')
    try {
      // Convert first photo to base64
      const photo = photos[0]
      if (!photo?.file) throw new Error('No photo available')

      const base64 = await fileToBase64(photo.file)
      const mime = photo.file.type || 'image/jpeg'

      const res = await fetch(`${BACKEND_URL}/api/analyze-issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: base64,
          mime_type: mime,
          description: draft.description || '',
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Analysis failed')
      }

      const data = await res.json()
      setAiResult(data)

      // Pre-fill editable fields from AI
      setTitle(data.suggested_title)
      setIssueType(data.issue_type)
      setDepartment(data.department)
      setSeverityLabel(data.severity_label)
      setDescription(draft.description || data.summary)

    } catch (err) {
      setAiError(err.message || 'Could not analyze image.')
      // Fall back to user-entered data
      setTitle(draft.description?.slice(0, 50) || 'Civic Issue')
      setIssueType(draft.issueType || 'other')
      setDepartment(draft.department || 'Municipal')
      setSeverityLabel('Medium')
      setDescription(draft.description || '')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleContinue = () => {
    const finalDraft = {
      ...draft,
      title,
      issueType,
      department,
      severityLabel,
      description,
      aiConfidence: aiResult?.confidence || 0,
      severityScore: aiResult?.severity_score || 5,
    }
    navigate('/report/confirm', { state: { draft: finalDraft, photos } })
  }

  const severityColors = SEVERITY_COLORS[severityLabel] || SEVERITY_COLORS.Medium
  const selectedType = ISSUE_TYPES.find(t => t.value === issueType)

  if (!draft) return null

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
        <span style={{ fontWeight: 800, fontSize: '1.0625rem' }}>
          {analyzing ? 'Analyzing…' : 'AI Result'}
        </span>
        {!analyzing && (
          <button
            className="btn btn-ghost"
            style={{ padding: '8px 10px', minHeight: 'auto', gap: 6, fontSize: '0.8125rem' }}
            onClick={() => setEditing(e => !e)}
          >
            <Edit3 size={15} /> {editing ? 'Done' : 'Edit'}
          </button>
        )}
      </header>

      <div className="page" style={{ paddingTop: 16, paddingBottom: 32 }}>

        {/* ── Analyzing state ─────────────────────────────────────── */}
        {analyzing && (
          <div style={{ textAlign: 'center', paddingTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--color-primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Loader size={36} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: 8 }}>🤖 Gemini is analyzing…</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Classifying issue type, severity, and responsible department.
              </div>
            </div>
            {/* Photo preview */}
            {photos[0] && (
              <img
                src={photos[0].preview}
                alt="Uploaded"
                style={{ width: '100%', maxWidth: 320, borderRadius: 12, objectFit: 'cover', maxHeight: 200 }}
              />
            )}
          </div>
        )}

        {/* ── Result ─────────────────────────────────────────────── */}
        {!analyzing && (
          <>
            {/* Photo */}
            {photos[0] && (
              <img
                src={photos[0].preview}
                alt="Uploaded"
                style={{ width: '100%', borderRadius: 12, objectFit: 'cover', maxHeight: 200, marginBottom: 16 }}
              />
            )}

            {/* AI confidence banner */}
            {aiResult && !aiError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                background: '#F0FDF4', border: '1.5px solid #86EFAC',
                borderRadius: 10, marginBottom: 16,
              }}>
                <Zap size={16} color="#16A34A" />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#15803D' }}>
                    AI Confidence: {Math.round(aiResult.confidence * 100)}%
                  </span>
                  <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: 2 }}>
                    {aiResult.summary}
                  </div>
                </div>
              </div>
            )}

            {aiError && (
              <div style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                padding: '10px 14px',
                background: '#FFF7ED', border: '1.5px solid #FED7AA',
                borderRadius: 10, marginBottom: 16,
                fontSize: '0.8125rem', color: '#C2410C',
              }}>
                <AlertTriangle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <strong>AI Notice:</strong> {aiError}
                  <br />Please review and correct the fields below.
                </div>
              </div>
            )}

            {/* Severity badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 20,
              background: severityColors.bg,
              border: `1.5px solid ${severityColors.border}`,
              marginBottom: 16,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: severityColors.dot }} />
              <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: severityColors.text }}>
                {severityLabel} Severity
              </span>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 6 }}>Title</div>
              {editing ? (
                <input className="input" value={title} onChange={e => setTitle(e.target.value)} maxLength={80} />
              ) : (
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{title}</div>
              )}
            </div>

            {/* Issue Type */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 6 }}>Issue Type</div>
              {editing ? (
                <select
                  className="input"
                  value={issueType}
                  onChange={e => {
                    setIssueType(e.target.value)
                    const t = ISSUE_TYPES.find(t => t.value === e.target.value)
                    if (t) setDepartment(t.dept)
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {ISSUE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label} — {t.dept}</option>)}
                </select>
              ) : (
                <div style={{ fontSize: '0.9375rem' }}>
                  {selectedType?.label || issueType}
                  <span style={{ color: 'var(--color-text-muted)', marginLeft: 8, fontSize: '0.8rem' }}>→ {department}</span>
                </div>
              )}
            </div>

            {/* Severity override */}
            {editing && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 6 }}>Severity</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Low', 'Medium', 'High', 'Critical'].map(s => {
                    const col = SEVERITY_COLORS[s]
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSeverityLabel(s)}
                        style={{
                          flex: 1, padding: '8px 4px', borderRadius: 8, border: `2px solid ${severityLabel === s ? col.dot : 'var(--color-border)'}`,
                          background: severityLabel === s ? col.bg : '#fff',
                          color: severityLabel === s ? col.text : 'var(--color-text-muted)',
                          fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
                        }}
                      >{s}</button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 6 }}>Description</div>
              {editing ? (
                <textarea
                  className="input"
                  style={{ resize: 'none', minHeight: 80 }}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  maxLength={300}
                />
              ) : (
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{description}</div>
              )}
            </div>

            {/* Location */}
            {draft.location && (
              <div style={{
                display: 'flex', gap: 8, alignItems: 'flex-start',
                padding: '10px 12px',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 10, marginBottom: 20,
                fontSize: '0.8125rem',
              }}>
                <span>📍</span>
                <div>
                  <div style={{ fontWeight: 600 }}>Location</div>
                  <div style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>{draft.location.address}</div>
                </div>
              </div>
            )}

            {/* Continue CTA */}
            <button
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '1rem', minHeight: 52, gap: 10 }}
              onClick={handleContinue}
              id="btn-continue-submit"
            >
              <CheckCircle size={20} /> Looks Good — Continue
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              style={{ width: '100%', marginTop: 10 }}
              onClick={runAnalysis}
            >
              🔄 Re-analyze with AI
            </button>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// Convert File to base64 string (without data: prefix)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      // Strip "data:image/...;base64," prefix
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
