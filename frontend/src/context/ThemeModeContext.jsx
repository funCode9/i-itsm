import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeModeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
});

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('i_itsm_theme_mode') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('i_itsm_theme_mode', mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => {
    const isDark = mode === 'dark';
    return createTheme({
      palette: {
        mode,
        primary: {
          main: isDark ? '#60a5fa' : '#15243b',
          light: isDark ? '#93c5fd' : '#273a56',
          dark: isDark ? '#3b82f6' : '#0f1a2b',
          contrastText: '#ffffff',
        },
        secondary: {
          main: isDark ? '#818cf8' : '#4f85c8',
          light: '#a5b4fc',
          dark: '#4f46e5',
          contrastText: '#ffffff',
        },
        background: {
          default: isDark ? '#0b1320' : '#f4f6fa',
          paper: isDark ? '#111c2e' : '#ffffff',
        },
        text: {
          primary: isDark ? '#f1f5f9' : '#1e293b',
          secondary: isDark ? '#94a3b8' : '#64748b',
        },
        divider: isDark ? '#1e2e47' : '#e2e8f0',
        success: { main: '#10b981' },
        warning: { main: '#f59e0b' },
        error: { main: '#ef4444' },
        info: { main: '#3b82f6' },
      },
      typography: {
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
        h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
        h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.02em' },
        h4: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.01em' },
        h5: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.01em' },
        h6: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
        subtitle1: { fontWeight: 500 },
        subtitle2: { fontWeight: 500, color: isDark ? '#94a3b8' : '#64748b' },
        button: { textTransform: 'none', fontWeight: 600 },
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 7,
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.08)',
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 10,
              border: `1px solid ${isDark ? '#1e2e47' : '#e2e8f0'}`,
              backgroundColor: isDark ? '#111c2e' : '#ffffff',
              boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.4)' : '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              fontWeight: 600,
              borderRadius: 6,
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            head: {
              fontWeight: 600,
              color: isDark ? '#94a3b8' : '#64748b',
              backgroundColor: isDark ? '#16243b' : '#f8fafc',
              borderBottom: `1px solid ${isDark ? '#1e2e47' : '#e2e8f0'}`,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            },
            root: {
              borderBottom: `1px solid ${isDark ? '#1a273e' : '#f1f5f9'}`,
              padding: '12px 16px',
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
