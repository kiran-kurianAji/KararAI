import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { locationService } from '../services/i18n';
import LanguageDetectionNotification from '../components/LanguageDetectionNotification';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  resetToAutoDetection: () => void;
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
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationData, setNotificationData] = useState<{
    language: string;
    location: string;
  } | null>(null);

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
    
    // Save user's manual selection with a flag to indicate it was user-chosen
    localStorage.setItem('selectedLanguage', language);
    localStorage.setItem('isManualSelection', 'true');
    
    console.log(`Language manually set to: ${language}`);
  };

  const resetToAutoDetection = async () => {
    // Clear manual selection flag to allow auto-detection
    localStorage.removeItem('isManualSelection');
    localStorage.removeItem('selectedLanguage');
    
    // Trigger fresh location detection
    setIsDetecting(true);
    try {
      const location = await locationService.detectLocation();
      if (location) {
        setDetectedLocation(location.state);
        setCurrentLanguage(location.language);
        i18n.changeLanguage(location.language);
        
        // Save as automatic selection
        localStorage.setItem('selectedLanguage', location.language);
        localStorage.setItem('isManualSelection', 'false');
        
        // Show notification
        setNotificationData({
          language: location.language,
          location: location.state
        });
        setShowNotification(true);
        
        console.log(`Reset to auto-detection: ${location.language} based on ${location.state}`);
      }
    } catch (error) {
      console.error('Reset to auto-detection failed:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
    setNotificationData(null);
  };

  useEffect(() => {
    const detectLocationAndLanguage = async () => {
      setIsDetecting(true);
      
      try {
        // Always detect location on every reload
        const location = await locationService.detectLocation();
        if (location) {
          setDetectedLocation(location.state);
          
          // Check if user has manually selected a language
          const savedLanguage = localStorage.getItem('selectedLanguage');
          const isManualSelection = localStorage.getItem('isManualSelection') === 'true';
          const autoDetectedLanguage = location.language;
          
          if (isManualSelection && savedLanguage) {
            // User has manually selected a language, respect their choice
            setCurrentLanguage(savedLanguage);
            i18n.changeLanguage(savedLanguage);
            console.log(`Using manual selection: ${savedLanguage} (location suggests: ${autoDetectedLanguage})`);
          } else {
            // Use auto-detected language and show notification
            setCurrentLanguage(autoDetectedLanguage);
            i18n.changeLanguage(autoDetectedLanguage);
            
            // Save the auto-detected language but mark it as automatic
            localStorage.setItem('selectedLanguage', autoDetectedLanguage);
            localStorage.setItem('isManualSelection', 'false');
            
            // Show notification for auto-detected language
            setNotificationData({
              language: autoDetectedLanguage,
              location: location.state
            });
            setShowNotification(true);
            
            console.log(`Language auto-detected: ${autoDetectedLanguage} based on location: ${location.state}`);
          }
        } else {
          // Fallback: check saved language or use English
          const savedLanguage = localStorage.getItem('selectedLanguage');
          const fallbackLanguage = savedLanguage || 'en';
          setCurrentLanguage(fallbackLanguage);
          i18n.changeLanguage(fallbackLanguage);
          console.log(`Location detection failed, using fallback: ${fallbackLanguage}`);
        }
      } catch (error) {
        console.error('Language detection failed:', error);
        // Use saved language or fallback to English
        const savedLanguage = localStorage.getItem('selectedLanguage');
        const fallbackLanguage = savedLanguage || 'en';
        setCurrentLanguage(fallbackLanguage);
        i18n.changeLanguage(fallbackLanguage);
      } finally {
        setIsDetecting(false);
      }
    };

    detectLocationAndLanguage();
  }, [i18n]);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    resetToAutoDetection,
    isDetecting,
    detectedLocation,
    availableLanguages,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
      {showNotification && notificationData && (
        <LanguageDetectionNotification
          isVisible={showNotification}
          detectedLanguage={notificationData.language}
          detectedLocation={notificationData.location}
          onClose={handleCloseNotification}
        />
      )}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;