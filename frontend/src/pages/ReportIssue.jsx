import { Camera, MapPin, ArrowLeft, Loader } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ReportIssue() {
  const navigate = useNavigate()
  const [description, setDescription] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (file) setPhotoPreview(URL.createObjectURL(file))
  }

  return (
    <div>
      {/* App Bar */}
      <header className="app-bar">
        <button className="btn btn-ghost" style={{ padding: '8px', minHeight: 'auto' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <span style={{ fontWeight: 700, fontSize: '1rem' }}>Report an Issue</span>
        <div style={{ width: 38 }} />
      </header>

      <div className="page" style={{ paddingTop: 20 }}>
        {/* Photo Upload */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 8, color: 'var(--color-text)' }}>
            Photo <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>

          {photoPreview ? (
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9' }}>
              <img src={photoPreview} alt="Issue preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => setPhotoPreview(null)}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(0,0,0,0.6)', color: '#fff',
                  border: 'none', borderRadius: '50%',
                  width: 32, height: 32, cursor: 'pointer',
                  fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >×</button>
              <div style={{
                position: 'absolute', bottom: 10, left: 10,
                background: 'rgba(26,86,219,0.85)',
                color: '#fff', borderRadius: 20, padding: '4px 12px',
                fontSize: '0.75rem', fontWeight: 600,
              }}>
                🤖 AI Analysis will run on submit
              </div>
            </div>
          ) : (
            <label htmlFor="photo-input" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 10, aspectRatio: '16/9',
              border: '2px dashed var(--color-border)',
              borderRadius: 12, cursor: 'pointer',
              background: 'var(--color-primary-light)',
              transition: 'border-color 0.15s',
            }}>
              <Camera size={36} color="var(--color-primary)" />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Take Photo / Upload</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Tap to capture or select from gallery</div>
              </div>
              <input id="photo-input" type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handlePhoto} />
            </label>
          )}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 8 }}>
            Description <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <textarea
            className="input"
            style={{ minHeight: 100, resize: 'none' }}
            placeholder="Describe the issue briefly... (e.g. Large pothole near the bus stop, causing accidents)"
            maxLength={300}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            {description.length}/300
          </div>
        </div>

        {/* AI Auto-fill Notice */}
        <div style={{
          background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
          border: '1px solid #BFDBFE',
          borderRadius: 10, padding: '12px 14px',
          marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.25rem' }}>🤖</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-primary)', marginBottom: 2 }}>
              AI-Powered Auto-Fill
            </div>
            <div style={{ fontSize: '0.8rem', color: '#3B82F6' }}>
              Gemini AI will automatically detect issue type, severity, and suggested department from your photo.
            </div>
          </div>
        </div>

        {/* Location */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 8 }}>Location</label>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 8, padding: '12px 14px',
          }}>
            <MapPin size={18} color="var(--color-primary)" />
            <span style={{ flex: 1, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Tap to detect your location
            </span>
            <button className="btn btn-outline" style={{ minHeight: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}>
              Detect GPS
            </button>
          </div>
        </div>

        {/* Submit */}
        <button className="btn btn-action" style={{ width: '100%', fontSize: '1rem', minHeight: 52 }} id="btn-submit-report">
          <Camera size={20} />
          Submit Report
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 12 }}>
          Your report will be verified and routed to the correct department by AI.
        </p>
      </div>
    </div>
  )
}
