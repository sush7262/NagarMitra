import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { haversineMeters } from '../lib/issues' // Not needed here but maybe we need reverse geocoding

export default function LocationRequest() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRequestLocation = () => {
    setLoading(true)
    setError('')

    if (!navigator.geolocation) {
      setError(t('Geolocation is not supported by your browser'))
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        // Save to localStorage
        localStorage.setItem('locationPermission', 'granted')
        localStorage.setItem('userLat', latitude)
        localStorage.setItem('userLng', longitude)

        // Sync with backend if user is logged in
        if (user) {
          try {
            await fetch('http://localhost:8000/api/users/profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                uid: user.uid,
                location: {
                  lat: latitude,
                  lng: longitude,
                  address: 'Current Location' // Could use a reverse geocoding API here
                }
              })
            })
          } catch (err) {
            console.error('Failed to sync location to backend:', err)
          }
        }

        setLoading(false)
        navigate('/', { replace: true })
      },
      (error) => {
        console.error('Error getting location:', error)
        setError(t('Failed to get location. Please allow location access.'))
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return (
    <div className="min-h-screen bg-[#F4FBFA] flex flex-col items-center justify-center px-6 py-12 font-sans relative">
      
      {/* Content Wrapper */}
      <div className="flex flex-col items-center w-full max-w-sm mt-[-10vh]">
        
        {/* Logo */}
        <div className="w-28 h-28 rounded-full bg-white shadow-sm flex flex-col items-center justify-center mb-8 border border-slate-100">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-orange-400" />
            <MapPin size={28} className="text-[#059669]" />
            <div className="w-4 h-4 rounded-full bg-[#059669]" />
          </div>
          <span className="text-[0.65rem] font-bold text-slate-700 mt-2">{t('NagarMitra')}</span>
        </div>

        {/* App Title */}
        <h1 className="text-3xl font-bold text-[#059669] tracking-tight mb-2">{t('NagarMitra')}</h1>
        <p className="text-slate-500 text-sm mb-16 text-center">{t('Digital Civic Reporting Platform')}</p>

        {/* Permission Info */}
        <h2 className="text-2xl font-medium text-slate-800 mb-4 text-center">
          {t('Request Location Permission')}
        </h2>
        <p className="text-slate-500 text-center text-base mb-12 leading-relaxed px-4">
          {t('Allow location access to detect your municipal area automatically')}
        </p>

        {error && (
          <div className="w-full bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleRequestLocation}
          disabled={loading}
          className="w-full py-4 px-4 rounded-xl bg-[#059669] text-white font-semibold text-lg hover:bg-emerald-700 transition-colors shadow-md flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <MapPin size={22} />
              {t('Request Location Permission')}
            </>
          )}
        </button>
      </div>

    </div>
  )
}
