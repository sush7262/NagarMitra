import { useCallback, useState } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { MapPin, Loader } from 'lucide-react'

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
}

// Default center: India
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }
const DEFAULT_ZOOM = 5

// Severity color map for markers
const SEVERITY_COLORS = {
  Critical: '#DC2626',
  High: '#F97316',
  Medium: '#D97706',
  Low: '#16A34A',
}

const MAP_STYLES = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
]

/**
 * MapView — Google Maps component for NagarMitra
 * Props:
 *   issues: array of issue objects with location: { lat, lng, address }
 *   center: { lat, lng } — optional, defaults to India center
 *   zoom: number — optional
 *   onIssueClick: (issue) => void — optional callback when marker clicked
 *   height: string — CSS height, default '400px'
 */
export default function MapView({
  issues = [],
  center,
  zoom = 12,
  onIssueClick,
  height = '400px',
}) {
  const [selectedIssue, setSelectedIssue] = useState(null)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    id: 'nagarmitra-map',
  })

  const onLoad = useCallback((map) => {
    // Fit bounds to all markers if we have issues
    if (issues.length > 1) {
      const bounds = new window.google.maps.LatLngBounds()
      issues.forEach(issue => {
        if (issue.location?.lat && issue.location?.lng) {
          bounds.extend({ lat: issue.location.lat, lng: issue.location.lng })
        }
      })
      map.fitBounds(bounds)
    }
  }, [issues])

  const handleMarkerClick = (issue) => {
    setSelectedIssue(issue)
    onIssueClick?.(issue)
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div style={{
        height,
        background: '#F1F5F9',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
        color: 'var(--color-text-muted)',
      }}>
        <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} color="var(--color-primary)" />
        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Loading map…</span>
      </div>
    )
  }

  // Error state
  if (loadError) {
    return (
      <div style={{
        height,
        background: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 8,
        color: 'var(--color-danger)',
        padding: 16,
      }}>
        <MapPin size={28} />
        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Map failed to load</div>
        <div style={{ fontSize: '0.8rem', textAlign: 'center', opacity: 0.8 }}>
          Check your Google Maps API key in .env
        </div>
      </div>
    )
  }

  return (
    <div style={{ height, borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center || (issues[0]?.location?.lat ? { lat: issues[0].location.lat, lng: issues[0].location.lng } : DEFAULT_CENTER)}
        zoom={issues.length === 0 ? DEFAULT_ZOOM : zoom}
        onLoad={onLoad}
        options={{
          styles: MAP_STYLES,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {/* Issue markers */}
        {issues.map(issue => {
          if (!issue.location?.lat || !issue.location?.lng) return null
          const color = SEVERITY_COLORS[issue.severity_label] || '#1A56DB'
          return (
            <Marker
              key={issue.id}
              position={{ lat: issue.location.lat, lng: issue.location.lng }}
              onClick={() => handleMarkerClick(issue)}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: color,
                fillOpacity: 0.9,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
            />
          )
        })}

        {/* Info window on marker click */}
        {selectedIssue && selectedIssue.location?.lat && (
          <InfoWindow
            position={{ lat: selectedIssue.location.lat, lng: selectedIssue.location.lng }}
            onCloseClick={() => setSelectedIssue(null)}
          >
            <div style={{ maxWidth: 200, fontFamily: 'Inter, sans-serif' }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: SEVERITY_COLORS[selectedIssue.severity_label] || '#1A56DB',
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                {selectedIssue.severity_label} · {selectedIssue.issue_type?.replace('_', ' ')}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                {selectedIssue.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                {selectedIssue.location.address}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}
