import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { locationService } from '../services/i18n';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  isDetecting: boolean;
  detectedLocation: string | null;
  availableLanguages: Array<{
    code: string;
    name: string;
    nativeName: string;
  }>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isDetecting, setIsDetecting] = useState<boolean>(true);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);

  const availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    // Add more languages as needed
  ];

  const setLanguage = (language: string) => {
    setCurrentLanguage(language);
    i18n.changeLanguage(language);
    localStorage.setItem('selectedLanguage', language);
  };

  useEffect(() => {
    const detectLocationAndLanguage = async () => {
      setIsDetecting(true);
      
      // Check if user has manually selected a language before
      const savedLanguage = localStorage.getItem('selectedLanguage');
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
        i18n.changeLanguage(savedLanguage);
        setIsDetecting(false);
        return;
      }

      try {
        const location = await locationService.detectLocation();
        if (location) {
          setDetectedLocation(location.state);
          setCurrentLanguage(location.language);
          i18n.changeLanguage(location.language);
          console.log(`Language auto-detected: ${location.language} based on location: ${location.state}`);
        } else {
          // Fallback to English if detection fails
          setCurrentLanguage('en');
          i18n.changeLanguage('en');
        }
      } catch (error) {
        console.error('Language detection failed:', error);
        setCurrentLanguage('en');
        i18n.changeLanguage('en');
      } finally {
        setIsDetecting(false);
      }
    };

    detectLocationAndLanguage();
  }, [i18n]);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    isDetecting,
    detectedLocation,
    availableLanguages,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;