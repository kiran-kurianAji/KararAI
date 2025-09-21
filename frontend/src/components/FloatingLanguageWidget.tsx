import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, MapPin, Loader2 } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

const FloatingLanguageWidget: React.FC = () => {
  const { 
    currentLanguage, 
    setLanguage, 
    isDetecting, 
    detectedLocation, 
    availableLanguages, 
    t 
  } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);

  const currentLangInfo = availableLanguages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 mb-2"
          >
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden min-w-72">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-white" />
                    <h3 className="text-white font-semibold text-sm">
                      {t('language.title')}
                    </h3>
                  </div>
                  {isDetecting && (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  )}
                </div>
                
                {/* Location info */}
                {detectedLocation && (
                  <div className="flex items-center space-x-1 mt-2 text-blue-100 text-xs">
                    <MapPin className="w-3 h-3" />
                    <span>{detectedLocation}</span>
                    <span>•</span>
                    <span>{t('language.autoDetected')}</span>
                  </div>
                )}
              </div>

              {/* Language Selection */}
              <div className="p-2">
                <div className="text-xs text-gray-600 px-2 py-2 font-medium">
                  {t('language.selectLanguage')}
                </div>
                
                <div className="space-y-1">
                  {availableLanguages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                        currentLanguage === language.code
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{language.nativeName}</span>
                        <span className="text-xs text-gray-500">{language.name}</span>
                      </div>
                      {currentLanguage === language.code && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                <div className="text-xs text-gray-500 text-center">
                  Powered by KararAI Translation
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={toggleWidget}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex items-center space-x-2 px-4 py-3 rounded-full shadow-lg transition-all duration-200 ${
          isOpen 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
            : 'bg-white text-gray-700 hover:shadow-xl'
        }`}
      >
        <div className="flex items-center space-x-2">
          {isDetecting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Globe className="w-5 h-5" />
          )}
          
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">
              {currentLangInfo?.nativeName || 'English'}
            </span>
            {detectedLocation && (
              <span className="text-xs opacity-75">
                {detectedLocation}
              </span>
            )}
          </div>
          
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>

        {/* Online indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      </motion.button>

      {/* Detection overlay when detecting location */}
      {isDetecting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-20 rounded-full flex items-center justify-center"
        >
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </motion.div>
      )}
    </div>
  );
};

export default FloatingLanguageWidget;