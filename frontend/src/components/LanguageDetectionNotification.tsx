import React, { useEffect, useState } from 'react';
import { CheckCircle, Globe } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface LanguageDetectionNotificationProps {
  isVisible: boolean;
  detectedLanguage: string;
  detectedLocation: string;
  onClose: () => void;
}

const LanguageDetectionNotification: React.FC<LanguageDetectionNotificationProps> = ({
  isVisible,
  detectedLanguage,
  detectedLocation,
  onClose
}) => {
  const { t } = useLanguage();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldShow(true);
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        setShouldShow(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const getLanguageName = (langCode: string) => {
    const languageNames: { [key: string]: string } = {
      'en': 'English',
      'hi': 'हिंदी (Hindi)',
      'ta': 'தமிழ் (Tamil)', 
      'te': 'తెలుగు (Telugu)',
      'bn': 'বাংলা (Bengali)',
      'ml': 'മലയാളം (Malayalam)',
      'mr': 'मराठी (Marathi)',
      'gu': 'ગુજરાતી (Gujarati)',
      'kn': 'ಕನ್ನಡ (Kannada)',
      'pa': 'ਪੰਜਾਬੀ (Punjabi)'
    };
    return languageNames[langCode] || langCode;
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        shouldShow 
          ? 'transform translate-x-0 opacity-100' 
          : 'transform translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white border border-green-200 rounded-lg shadow-lg p-4 min-w-[320px] max-w-[400px]">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Globe className="w-4 h-4 text-slate-500" />
              <p className="text-sm font-medium text-slate-800">
                {t('language.detected')}
              </p>
            </div>
            
            <p className="text-sm text-slate-600 mb-2">
              {t('language.detectedMessage').replace('{location}', detectedLocation)}
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2">
              <p className="text-sm font-semibold text-green-800">
                {getLanguageName(detectedLanguage)}
              </p>
            </div>
            
            <p className="text-xs text-slate-500 mt-2">
              {t('language.changeAnytime')}
            </p>
          </div>
          
          <button
            onClick={() => {
              setShouldShow(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageDetectionNotification;