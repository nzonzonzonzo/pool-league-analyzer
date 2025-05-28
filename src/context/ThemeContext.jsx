import React, { createContext, useContext, useState, useEffect } from 'react';
import { getInitialTheme, applyTheme } from '../utils/theme';

// Create the context
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(getInitialTheme());
  const [userHasSetTheme, setUserHasSetTheme] = useState(
    localStorage.getItem('theme') !== null
  );

  // Apply theme to document whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    
    // Only save to localStorage if user has explicitly chosen a theme
    if (userHasSetTheme) {
      try {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
      } catch (e) {
        console.error("Could not save theme preference:", e);
      }
    }
  }, [darkMode, userHasSetTheme]);

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(prev => !prev);
    setUserHasSetTheme(true); // Mark that user has made a choice
  };

  // Set specific theme
  const setTheme = (isDark) => {
    setDarkMode(isDark);
    setUserHasSetTheme(true);
  };

  // Reset to system preference
  const resetToSystemTheme = () => {
    try {
      localStorage.removeItem('theme');
      setUserHasSetTheme(false);
      setDarkMode(getInitialTheme());
    } catch (e) {
      console.error("Could not reset theme preference:", e);
    }
  };

  const value = {
    darkMode,
    userHasSetTheme,
    toggleTheme,
    setTheme,
    resetToSystemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;