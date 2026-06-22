import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera, Upload, X, MapPin, Locate, ChevronLeft,
  FileImage, AlertCircle, Loader
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

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

const MAX_CHARS = 300
const MAX_PHOTOS = 3

export default function ReportIssue() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // Form state
  const [photos, setPhotos] = useState([]) // { file, preview }
  const [description, setDescription] = useState('')
  const [issueType, setIssueType] = useState('')
  const [location, setLocation] = useState(null) // { lat, lng, address }
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // ── Photo handlers ─────────────────────────────────────────────────────────
  const addPhotos = useCallback((files) => {
    const remaining = MAX_PHOTOS - photos.length
    const toAdd = Array.from(files).slice(0, remaining)
    const newPhotos = toAdd.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setPhotos(prev => [...prev, ...newPhotos])
  }, [photos.length])

  const removePhoto = (idx) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  // ── GPS Location ───────────────────────────────────────────────────────────
  const detectLocation = () => {
    setLocError('')
    setLocLoading(true)
    if (!navigator.geolocation) {
      setLocError('GPS not supported on this device.')
      setLocLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        // Reverse geocode via Google Maps API
        const address = await reverseGeocode(lat, lng)
        setLocation({ lat, lng, address })
        setLocLoading(false)
      },
      (err) => {
        setLocError('Could not get location. Please allow GPS access.')
        setLocLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // ── Form validation ────────────────────────────────────────────────────────
  const validate = () => {
    if (photos.length === 0) return 'Please add at least one photo.'
    if (!issueType) return 'Please select an issue type.'
    if (description.trim().length < 10) return 'Description must be at least 10 characters.'
    if (!location) return 'Please set your location using GPS.'
    return null
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setFormError(err); return }
    setFormError('')
    setSubmitting(true)

    try {
      // Task 2.3 will call analyze-issue here. For now, store locally and navigate.
      // We pass state to IssueDetail for confirmation.
      const selectedType = ISSUE_TYPES.find(t => t.value === issueType)
      const draftIssue = {
        description: description.trim(),
        issueType,
        department: selectedType?.dept || 'Municipal',
        location,
        photoCount: photos.length,
        reporter_uid: user?.uid,
        reporter_name: user?.displayName || 'Citizen',
      }
      // Navigate to AI analysis step (Task 2.3 will process this)
      navigate('/report/analyze', { state: { draft: draftIssue, photos } })
    } catch (err) {
      setFormError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const selectedTypeObj = ISSUE_TYPES.find(t => t.value === issueType)
  const charsLeft = MAX_CHARS - description.length

  return (
    <div>
      <header className="app-bar">
        <button
          className="btn btn-ghost"
          style={{ padding: '8px 10px', minHeight: 'auto', marginLeft: -8 }}
          onClick={() => navigate(-1)}
          id="btn-back"
        >
          <ChevronLeft size={22} />
        </button>
        <span style={{ fontWeight: 800, fontSize: '1.0625rem' }}>Report Issue</span>
        <div style={{ width: 40 }} />
      </header>

      <form className="page" style={{ paddingTop: 16, paddingBottom: 32 }} onSubmit={handleSubmit}>

        {/* ── Photo Capture ───────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 10 }}>
            📷 Photos <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>({photos.length}/{MAX_PHOTOS})</span>
          </div>

          {/* Photo Previews */}
          {photos.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              {photos.map((p, idx) => (
                <div key={idx} style={{ position: 'relative', width: 96, height: 96 }}>
                  <img
                    src={p.preview}
                    alt={`Photo ${idx + 1}`}
                    style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 10, border: '2px solid var(--color-border)' }}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 22, height: 22, borderRadius: '50%',
                      background: '#EF4444', border: '2px solid #fff',
                      color: '#fff', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload buttons */}
          {photos.length < MAX_PHOTOS && (
            <div style={{ display: 'flex', gap: 10 }}>
              {/* Camera (mobile) */}
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, gap: 8 }}
                id="btn-camera-capture"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera size={18} /> Camera
              </button>
              {/* File upload */}
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, gap: 8 }}
                id="btn-file-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileImage size={18} /> Gallery
              </button>
            </div>
          )}

          {/* Hidden inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={e => e.target.files && addPhotos(e.target.files)}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={e => e.target.files && addPhotos(e.target.files)}
          />
        </div>

        {/* ── Issue Type ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 10 }}>
            🏷️ Issue Type
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {ISSUE_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setIssueType(type.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `2px solid ${issueType === type.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: issueType === type.value ? 'var(--color-primary-light)' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.8125rem',
                  fontWeight: issueType === type.value ? 700 : 500,
                  color: issueType === type.value ? 'var(--color-primary)' : 'var(--color-text)',
                  transition: 'all 0.15s',
                }}
                id={`btn-type-${type.value}`}
              >
                {type.label}
              </button>
            ))}
          </div>
          {issueType && (
            <div style={{
              marginTop: 8, fontSize: '0.8rem', color: 'var(--color-text-muted)',
              padding: '6px 10px', background: '#F8FAFC', borderRadius: 8,
            }}>
              Department: <strong>{selectedTypeObj?.dept}</strong>
            </div>
          )}
        </div>

        {/* ── Description ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 10 }}>
            📝 Description
          </div>
          <div style={{ position: 'relative' }}>
            <textarea
              className="input"
              style={{ resize: 'none', minHeight: 100, paddingBottom: 28 }}
              placeholder="Describe the issue in detail — location landmark, how long it's been there, safety risk, etc."
              maxLength={MAX_CHARS}
              value={description}
              onChange={e => setDescription(e.target.value)}
              id="input-description"
            />
            <span style={{
              position: 'absolute', bottom: 10, right: 12,
              fontSize: '0.75rem', color: charsLeft < 30 ? '#EF4444' : 'var(--color-text-muted)',
              fontWeight: 500,
            }}>
              {charsLeft}
            </span>
          </div>
        </div>

        {/* ── Location ───────────────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 10 }}>
            📍 Location
          </div>

          {location ? (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '12px 14px',
              background: '#F0FDF4', border: '1.5px solid #86EFAC',
              borderRadius: 10,
            }}>
              <MapPin size={18} color="#16A34A" style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8125rem', color: '#15803D', fontWeight: 600, marginBottom: 2 }}>
                  Location Detected ✓
                </div>
                <div style={{ fontSize: '0.8rem', color: '#166534' }}>{location.address}</div>
                <div style={{ fontSize: '0.72rem', color: '#4ADE80', marginTop: 2 }}>
                  {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </div>
              </div>
              <button
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16A34A', padding: 2 }}
                onClick={() => setLocation(null)}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', gap: 10 }}
              onClick={detectLocation}
              disabled={locLoading}
              id="btn-detect-location"
            >
              {locLoading
                ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                : <Locate size={18} />
              }
              {locLoading ? 'Detecting…' : 'Detect My Location (GPS)'}
            </button>
          )}

          {locError && (
            <div style={{
              marginTop: 8, fontSize: '0.8rem', color: 'var(--color-danger)',
              display: 'flex', gap: 6, alignItems: 'center',
            }}>
              <AlertCircle size={14} /> {locError}
            </div>
          )}
        </div>

        {/* ── Error ──────────────────────────────────────────────────── */}
        {formError && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 10, padding: '12px 14px',
            fontSize: '0.8125rem', color: '#B91C1C',
            display: 'flex', gap: 8, alignItems: 'center',
            marginBottom: 16,
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            {formError}
          </div>
        )}

        {/* ── Submit ─────────────────────────────────────────────────── */}
        <button
          type="submit"
          className="btn btn-primary"
          style={{
            width: '100%',
            fontSize: '1rem',
            minHeight: 52,
            gap: 10,
            background: 'linear-gradient(135deg, #F97316, #EF4444)',
            borderColor: 'transparent',
          }}
          disabled={submitting}
          id="btn-submit-report"
        >
          {submitting
            ? <><Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing…</>
            : '🚀 Submit Report'
          }
        </button>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// Reverse geocode using Google Maps Geocoding API
async function reverseGeocode(lat, lng) {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!key) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`
    )
    const data = await res.json()
    if (data.results?.[0]) {
      return data.results[0].formatted_address
    }
  } catch {}
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
}
