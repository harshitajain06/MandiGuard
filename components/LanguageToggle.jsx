import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, changeLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'hi' : 'en';
    changeLanguage(newLanguage);
  };

  return (
    <TouchableOpacity style={styles.toggleButton} onPress={toggleLanguage}>
      <Text style={styles.toggleText}>
        {language === 'en' ? 'हिंदी' : 'English'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: '#0056b3',
      },
    }),
  },
  toggleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
