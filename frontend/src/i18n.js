import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Basic Translations (We will map keys to UI elements)
const resources = {
  en: {
    translation: {
      "Home": "Home",
      "Analytics": "Analytics",
      "Map": "Map",
      "Profile": "Profile",
      "Select Language": "Select Language",
      "Continue": "Continue",
      "NagarMitra": "NagarMitra",
      "Siliguri Municipal Corporation": "Siliguri Municipal Corporation",
      "Active Reports": "Active Reports",
      "Real-time updates": "Real-time updates",
      "Search": "Search by keyword or ward..."
    }
  },
  hi: {
    translation: {
      "Home": "होम",
      "Analytics": "विश्लेषण",
      "Map": "नक्शा",
      "Profile": "प्रोफ़ाइल",
      "Select Language": "भाषा चुनें",
      "Continue": "आगे बढ़ें",
      "NagarMitra": "नगरमित्र",
      "Siliguri Municipal Corporation": "सिलीगुड़ी नगर निगम",
      "Active Reports": "सक्रिय रिपोर्ट",
      "Real-time updates": "रियल-टाइम अपडेट",
      "Search": "कीवर्ड या वार्ड से खोजें..."
    }
  },
  bn: {
    translation: {
      "Home": "হোম",
      "Analytics": "বিশ্লেষণ",
      "Map": "মানচিত্র",
      "Profile": "প্রোফাইল",
      "Select Language": "ভাষা নির্বাচন করুন",
      "Continue": "এগিয়ে যান",
      "NagarMitra": "নগরমিত্র",
      "Siliguri Municipal Corporation": "শিলিগুড়ি পৌরনিগম",
      "Active Reports": "সক্রিয় রিপোর্ট",
      "Real-time updates": "রিয়েল-টাইম আপডেট",
      "Search": "কীওয়ার্ড বা ওয়ার্ড দ্বারা খুঁজুন..."
    }
  },
  sat: { // Santhali (placeholder translations for demonstration)
    translation: {
      "Home": "ᱚᱲᱟᱜ",
      "Analytics": "ᱵᱤᱥᱞᱮᱥᱚᱱ",
      "Map": "ᱱᱚᱠᱥᱟ",
      "Profile": "ᱯᱨᱚᱯᱷᱟᱭᱤᱞ",
      "Select Language": "ᱯᱟᱹᱨᱥᱤ ᱵᱟᱪᱷᱟᱣ ᱢᱮ",
      "Continue": "ᱞᱟᱦᱟᱜ ᱢᱮ",
      "NagarMitra": "ᱱᱟᱜᱟᱨᱢᱤᱛᱨᱟ",
      "Siliguri Municipal Corporation": "ᱥᱤᱞᱤᱜᱩᱲᱤ ᱢᱩᱱᱤᱥᱤᱯᱟᱞ ᱠᱚᱨᱯᱚᱨᱮᱥᱚᱱ",
      "Active Reports": "ᱮᱠᱴᱤᱵᱷ ᱨᱤᱯᱚᱨᱴ",
      "Real-time updates": "ᱨᱤᱭᱮᱞ-ᱴᱟᱭᱤᱢ ᱟᱯᱰᱮᱴ",
      "Search": "ᱥᱮᱸᱫᱽᱨᱟ..."
    }
  },
  xnr: { // Nagpuri (placeholder translations for demonstration)
    translation: {
      "Home": "घर",
      "Analytics": "विश्लेषण",
      "Map": "नक्शा",
      "Profile": "प्रोफाइल",
      "Select Language": "भाषा चुनु",
      "Continue": "आगू बढ़ु",
      "NagarMitra": "नगरमित्र",
      "Siliguri Municipal Corporation": "सिलीगुड़ी नगर निगम",
      "Active Reports": "सक्रिय रिपोर्ट",
      "Real-time updates": "तुरंत अपडेट",
      "Search": "खोजु..."
    }
  }
};

// Retrieve saved language or default to 'en'
const savedLanguage = localStorage.getItem('language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
