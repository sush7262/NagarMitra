import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, ThumbsUp, Loader, AlertTriangle, Send } from 'lucide-react'
import { 
  fetchIssueById, formatTimeAgo, upvoteExistingIssue,
  markIssueVerified, submitDispute, addComment, subscribeToComments, resolveIssueByOfficer,
  triggerAIVerification
} from '../lib/issues'
import { useAuth } from '../context/AuthContext'

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
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dispute form state
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [disputeDesc, setDisputeDesc] = useState('')
  const [disputeFile, setDisputeFile] = useState(null)
  const [isDisputing, setIsDisputing] = useState(false)

  // Officer form state
  const [afterPhoto, setAfterPhoto] = useState(null)
  const [isResolving, setIsResolving] = useState(false)

  // AI Verification state
  const [isVerifying, setIsVerifying] = useState(false)

  const { user, userProfile } = useAuth()

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

    const unsubComments = subscribeToComments(id, (data) => setComments(data))
    return () => unsubComments()
  }, [id])

  const handleUpvote = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!issue.supporters?.includes(user.uid)) {
      try {
        await upvoteExistingIssue(issue.id, user.uid)
        setIssue(prev => ({ ...prev, upvote_count: (prev.upvote_count || 0) + 1, supporters: [...(prev.supporters || []), user.uid] }))
      } catch (err) {
        console.error('Upvote failed:', err)
      }
    }
  }

  const handleVerify = async () => {
    if (!user) return navigate('/login')
    try {
      await markIssueVerified(issue.id, user)
      setIssue(prev => ({ ...prev, status: 'verified_resolved' }))
    } catch (err) {
      console.error(err)
    }
  }

  const handleDisputeSubmit = async (e) => {
    e.preventDefault()
    if (!disputeDesc.trim() || !disputeFile) return
    setIsDisputing(true)
    try {
      await submitDispute(issue.id, user, disputeDesc, disputeFile)
      setIssue(prev => ({ ...prev, status: 'disputed' }))
      setShowDisputeForm(false)
    } catch (err) {
      console.error(err)
      setError('Failed to submit dispute. Try again.')
    } finally {
      setIsDisputing(false)
    }
  }

  const handleOfficerResolve = async () => {
    if (!afterPhoto) return
    setIsResolving(true)
    try {
      await resolveIssueByOfficer(issue.id, user, afterPhoto)
      setIssue(prev => ({ ...prev, status: 'resolved' }))
    } catch (err) {
      console.error(err)
      setError('Failed to mark as resolved: ' + err.message)
    } finally {
      setIsResolving(false)
    }
  }

  const handleAIVerification = async () => {
    setIsVerifying(true)
    setError('')
    try {
      const res = await triggerAIVerification(issue.id)
      // We don't necessarily update issue.status directly, we rely on Firebase snapshot to update it if the backend changed it.
      // But we can trigger a refetch or rely on live listeners if we had them for the issue document.
      // Since fetchIssueById is one-time in useEffect, let's fetch it again to get the latest status.
      const updated = await fetchIssueById(issue.id)
      setIssue(updated)
      alert(`AI Verdict: ${res.verdict}\n\n${res.explanation}`)
    } catch (err) {
      console.error(err)
      setError('AI Verification Failed: ' + err.message)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!user) return navigate('/login')
    if (!newComment.trim()) return
    setIsSubmitting(true)
    try {
      await addComment(issue.id, user, newComment.trim())
      setNewComment('')
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

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
            Reported by <strong>{issue.reporter_name || 'Citizen'}</strong> <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>(Score: 120)</span> · {formatTimeAgo(issue.created_at)}
          </div>

          <button 
            className="btn btn-primary" 
            style={{ 
              width: '100%', marginBottom: 16,
              background: issue.supporters?.includes(user?.uid) ? 'var(--color-primary-dark)' : 'var(--color-primary)'
            }} 
            onClick={handleUpvote}
          >
            <ThumbsUp size={18} />
            {issue.supporters?.includes(user?.uid) ? 'You Supported This' : 'Support this Issue'} · {issue.upvote_count ?? 0} citizens
          </button>

          {userProfile?.is_officer && (issue.status === 'open' || issue.status === 'in_progress') && (
            <div className="card" style={{ padding: '16px', marginBottom: 16, border: '1px solid var(--color-primary)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 8, color: 'var(--color-primary)' }}>
                🛡️ Officer Action: Resolve Issue
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
                As an officer, you can mark this issue as resolved. You MUST upload an after-photo as proof of completion.
              </p>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>After-Photo Proof (Required)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setAfterPhoto(e.target.files[0])}
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }} 
                disabled={!afterPhoto || isResolving}
                onClick={handleOfficerResolve}
              >
                {isResolving ? 'Resolving...' : '✅ Mark as Resolved'}
              </button>
            </div>
          )}

          {/* AI Verification Tool (for Testing & Admins) */}
          {(issue.status === 'resolved' || issue.status === 'disputed') && (
            <div className="card" style={{ padding: '16px', marginBottom: 16, border: '1px dashed #7C3AED', background: '#F5F3FF' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 8, color: '#6D28D9' }}>
                🤖 Task 4.3: AI Verification Agent
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#5B21B6', marginBottom: 12 }}>
                Trigger Gemini Vision to compare before & after photos and detect fake closures.
              </p>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', background: '#7C3AED' }} 
                disabled={isVerifying}
                onClick={handleAIVerification}
              >
                {isVerifying ? 'Running AI Vision Analysis...' : '🔍 Run AI Verification'}
              </button>
            </div>
          )}

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

          {(issue.status === 'resolved' && (user?.uid === issue.reporter_uid || issue.supporters?.includes(user?.uid))) && (
            <div className="card" style={{ padding: '16px', marginTop: 16, background: '#F0FDF4', border: '1px solid #86EFAC' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 8, color: '#166534' }}>Has this issue been fixed?</div>
              <p style={{ fontSize: '0.8125rem', color: '#15803D', marginBottom: 16 }}>
                The assigned officer has marked this issue as resolved. Please verify if the problem is fixed in reality.
              </p>
              
              {!showDisputeForm ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" style={{ flex: 1, background: '#16A34A', borderColor: '#16A34A' }} onClick={handleVerify}>
                    ✅ Approve Resolution
                  </button>
                  {user?.uid === issue.reporter_uid && (
                    <button className="btn btn-ghost" style={{ color: '#DC2626', background: '#FEF2F2' }} onClick={() => setShowDisputeForm(true)}>
                      ❌ Dispute
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleDisputeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, background: '#fff', padding: 12, borderRadius: 8, border: '1px solid #FECACA' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#B91C1C' }}>Submit a Dispute</div>
                  <textarea 
                    placeholder="Explain why this issue is not fixed..."
                    value={disputeDesc}
                    onChange={e => setDisputeDesc(e.target.value)}
                    style={{ padding: 10, borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.875rem', minHeight: 60, outline: 'none' }}
                  />
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Upload Photo Proof (Required)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => setDisputeFile(e.target.files[0])}
                      style={{ fontSize: '0.8rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button type="submit" className="btn btn-primary" disabled={isDisputing || !disputeDesc.trim() || !disputeFile} style={{ flex: 1, background: '#DC2626', borderColor: '#DC2626' }}>
                      {isDisputing ? 'Submitting...' : 'Submit Dispute'}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowDisputeForm(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="card" style={{ padding: '16px', marginTop: 16, marginBottom: 32 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 16 }}>💬 Comments & Updates</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {comments.length === 0 ? (
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px 0' }}>
                  No comments yet. Be the first to add an update!
                </div>
              ) : (
                comments.map(c => (
                  <div key={c.id} style={{ background: c.is_dispute ? '#FEF2F2' : (c.is_official_resolution ? '#F0FDF4' : '#F8FAFC'), border: c.is_dispute ? '1px solid #FECACA' : (c.is_official_resolution ? '1px solid #86EFAC' : 'none'), padding: '10px 12px', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: c.is_dispute ? '#B91C1C' : (c.is_official_resolution ? '#166534' : 'var(--color-text)') }}>
                        {c.user_name} {c.is_dispute && '(Disputed)'} {c.is_official_resolution && '(Official)'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{formatTimeAgo(c.created_at)}</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>{c.text}</div>
                    {c.photo_url && (
                      <img src={c.photo_url} alt="Proof" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
                    )}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 8 }}>
              <input 
                type="text" 
                placeholder="Add an update..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ 
                  flex: 1, padding: '10px 12px', borderRadius: 8, 
                  border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.875rem' 
                }}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSubmitting || !newComment.trim()}
                style={{ padding: '0 14px' }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
