import React, { createContext, useContext, useState } from 'react';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: {
    background: string;
    card: string;
    text: string;
    border: string;
    primary: string;
    secondary: string;
  };
};

const defaultTheme = {
  isDarkMode: true,
  toggleTheme: () => {},
  colors: {
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    border: '#2a2a2a',
    primary: '#3b82f6',
    secondary: '#60a5fa',
  },
};

export const ThemeContext = createContext<ThemeContextType>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const lightTheme = {
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#000000',
    border: '#e0e0e0',
    primary: '#3b82f6',
    secondary: '#60a5fa',
  };
  
  const darkTheme = {
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    border: '#2a2a2a',
    primary: '#3b82f6',
    secondary: '#60a5fa',
  };
  
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };
  
  const value = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? darkTheme : lightTheme,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};