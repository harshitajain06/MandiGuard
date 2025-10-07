import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (newLanguage) => {
    try {
      await AsyncStorage.setItem('app_language', newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const value = {
    language,
    changeLanguage,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
