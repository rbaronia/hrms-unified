import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

type ThemeType = 'default' | 'dark' | 'light';

const themes = {
  default: createTheme({
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  }),
  dark: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#90caf9',
      },
      secondary: {
        main: '#f48fb1',
      },
      background: {
        default: '#303030',
        paper: '#424242',
      },
      text: {
        primary: '#ffffff',
        secondary: '#b3b3b3',
      },
    },
  }),
  light: createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#42a5f5',
      },
      secondary: {
        main: '#ff4081',
      },
      background: {
        default: '#fafafa',
        paper: '#ffffff',
      },
      text: {
        primary: '#000000',
        secondary: '#666666',
      },
    },
  }),
};

interface ThemeContextType {
  theme: ThemeType;
  updateTheme: (theme: ThemeType) => void;
  muiTheme: any;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  updateTheme: () => {},
  muiTheme: themes.default,
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as ThemeType) || 'default';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const updateTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, muiTheme: themes[theme] }}>
      <MuiThemeProvider theme={themes[theme]}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
