import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'ur', label: 'اردو (Urdu)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'as', label: 'অসমীয়া (Assamese)' },
  { code: 'sat', label: 'ᱥᱟᱱᱛᱟᱲᱤ (Santhali)' },
  { code: 'xnr', label: 'नागपुरी (Nagpuri)' },
]

export default function LanguageSelect() {
  const { i18n, t } = useTranslation()
  const navigate = useNavigate()
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en')

  const handleContinue = () => {
    i18n.changeLanguage(selectedLang)
    localStorage.setItem('language', selectedLang)
    // Navigate to home after selecting language
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#F4FBFA] flex flex-col items-center px-6 py-12 font-sans">
      
      {/* Logo Area */}
      <div className="flex flex-col items-center mt-8 mb-6">
        <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 border border-slate-100">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-orange-400" />
            <MapPin size={24} className="text-blue-600" />
            <div className="w-4 h-4 rounded-full bg-green-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#059669] tracking-tight">{t('NagarMitra')}</h1>
        <p className="text-slate-500 mt-1 text-sm">{t('Select Language')}</p>
      </div>

      {/* Language List */}
      <div className="w-full max-w-sm flex flex-col gap-3 mb-8">
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLang === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`w-full py-4 px-6 rounded-xl text-left font-medium transition-colors border ${
                isSelected 
                  ? 'bg-[#059669] text-white border-[#059669]' 
                  : 'bg-white text-slate-800 border-slate-200 hover:border-[#059669]'
              }`}
            >
              {lang.label}
            </button>
          )
        })}
      </div>

      {/* Continue Button */}
      <div className="w-full max-w-sm mt-auto mb-8">
        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-xl bg-[#059669] text-white font-bold text-lg hover:bg-emerald-700 transition-colors shadow-md"
        >
          {t('Continue')}
        </button>
      </div>

    </div>
  )
}
