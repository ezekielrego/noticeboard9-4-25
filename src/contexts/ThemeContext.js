import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'app_theme';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newTheme));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    isLoading,
    colors: {
      background: isDarkMode ? '#0f172a' : '#f5f6fa',
      surface: isDarkMode ? '#1e293b' : '#ffffff',
      surfaceSecondary: isDarkMode ? '#374151' : '#f9fafb',
      text: isDarkMode ? '#ffffff' : '#0b0c10',
      textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
      textTertiary: isDarkMode ? '#6b7280' : '#9ca3af',
      border: isDarkMode ? '#374151' : '#e5e7eb',
      borderLight: isDarkMode ? '#1e293b' : '#f3f4f6',
      primary: '#3b82f6',
      error: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
