import React, { useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography } from '@mui/material';
import { DocumentProvider, useDocument } from './context/DocumentContext';
import Header from './components/Header';
import EditorPanel from './components/EditorPanel';
import SuggestionPanel from './components/SuggestionPanel';
import MetricsPanel from './components/MetricsPanel';
import PresentationMode from './components/PresentationMode';
import ApiStatusNotification from './components/ApiStatusNotification';

import { setupKeyboardShortcuts } from './services/keyboardShortcuts';
import type { ShortcutAction } from './types';

const AppContent: React.FC = () => {
  const { 
    isDarkMode, 
    presentationMode, 
    togglePresentationMode,
    content
  } = useDocument();

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: isDarkMode ? '#8b5cf6' : '#6366f1', // Vivid purple for dark, indigo for light
        light: isDarkMode ? '#a78bfa' : '#818cf8',
        dark: isDarkMode ? '#7c3aed' : '#4f46e5',
      },
      secondary: {
        main: isDarkMode ? '#ec4899' : '#f59e0b', // Hot pink for dark, amber for light
        light: isDarkMode ? '#f472b6' : '#fbbf24',
        dark: isDarkMode ? '#db2777' : '#d97706',
      },
      background: {
        default: isDarkMode ? '#0a0a0f' : '#f8fafc', // Deeper dark background
        paper: isDarkMode ? '#1a1a24' : '#ffffff', // Rich dark paper
      },
      success: {
        main: isDarkMode ? '#10b981' : '#10b981',
        light: isDarkMode ? '#34d399' : '#34d399',
        dark: isDarkMode ? '#059669' : '#059669',
      },
      error: {
        main: isDarkMode ? '#f43f5e' : '#ef4444', // Brighter red for dark
        light: isDarkMode ? '#fb7185' : '#f87171',
        dark: isDarkMode ? '#e11d48' : '#dc2626',
      },
      warning: {
        main: isDarkMode ? '#fbbf24' : '#f59e0b',
        light: isDarkMode ? '#fcd34d' : '#fbbf24',
        dark: isDarkMode ? '#f59e0b' : '#d97706',
      },
      info: {
        main: isDarkMode ? '#06b6d4' : '#3b82f6', // Cyan for dark
        light: isDarkMode ? '#22d3ee' : '#60a5fa',
        dark: isDarkMode ? '#0891b2' : '#2563eb',
      },
    },
    typography: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      h6: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      button: {
        fontWeight: 500,
        textTransform: 'none',
        letterSpacing: '0.02em',
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: [
      'none',
      '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '0 0 0 1px rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      '0 0 0 1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      '0 0 0 1px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      '0 0 0 1px rgba(0, 0, 0, 0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 8px 32px rgba(99, 102, 241, 0.15)',
      '0 12px 40px rgba(99, 102, 241, 0.2)',
      '0 16px 48px rgba(99, 102, 241, 0.25)',
      '0 20px 56px rgba(99, 102, 241, 0.3)',
      '0 24px 64px rgba(99, 102, 241, 0.35)',
      '0 28px 72px rgba(99, 102, 241, 0.4)',
      '0 32px 80px rgba(99, 102, 241, 0.45)',
      '0 36px 88px rgba(99, 102, 241, 0.5)',
      '0 40px 96px rgba(99, 102, 241, 0.55)',
      '0 44px 104px rgba(99, 102, 241, 0.6)',
      '0 48px 112px rgba(99, 102, 241, 0.65)',
      '0 52px 120px rgba(99, 102, 241, 0.7)',
      '0 56px 128px rgba(99, 102, 241, 0.75)',
      '0 60px 136px rgba(99, 102, 241, 0.8)',
    ],
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation2: {
            boxShadow: isDarkMode 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            transition: 'all 0.2s ease-in-out',
          },
          contained: {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
    },
  });

  // Setup keyboard shortcuts
  useEffect(() => {
    const handleShortcut = (action: ShortcutAction) => {
      switch (action) {
        case 'presentation-mode':
        case 'exit-presentation':
          togglePresentationMode();
          break;
        // Other shortcuts will be handled by their respective components
        default:
          console.log('Unhandled shortcut:', action);
      }
    };

    const cleanup = setupKeyboardShortcuts(handleShortcut);
    return cleanup;
  }, [togglePresentationMode]);

  // Show presentation mode if active
  if (presentationMode) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PresentationMode
          content={content}
          onClose={togglePresentationMode}
          initialDarkMode={isDarkMode}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        background: isDarkMode 
          ? 'radial-gradient(ellipse at top, #1e1b4b 0%, #0a0a0f 50%, #000000 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #ddd6fe 100%)',
        position: 'relative',
        '&::before': isDarkMode ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
          pointerEvents: 'none',
        } : {},
      }}>
        <Header />
        <ApiStatusNotification />
        <Box sx={{ 
          flex: 1, 
          overflow: 'hidden', 
          p: 3, 
          display: 'flex', 
          gap: 3,
          position: 'relative',
          zIndex: 1,
        }}>
          <Box sx={{ flex: '0 0 25%', minWidth: 0, height: '100%' }}>
            <SuggestionPanel />
          </Box>
          <Box sx={{ 
            flex: '1 1 50%', 
            minWidth: 0, 
            height: '100%',
          }}>
            <EditorPanel />
          </Box>
          <Box sx={{ flex: '0 0 25%', minWidth: 0, height: '100%' }}>
            <MetricsPanel />
          </Box>
        </Box>
        <Box
          component="footer"
          sx={{
            py: 2.5,
            px: 3,
            mt: 'auto',
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1a1a24 0%, #2d1b4e 100%)'
              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderTop: '1px solid',
            borderColor: isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            zIndex: 1,
            boxShadow: isDarkMode ? '0 -4px 20px rgba(139, 92, 246, 0.2)' : '0 -4px 20px rgba(99, 102, 241, 0.2)',
          }}
        >
          <Typography 
            variant="body2" 
            align="center"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            Created by <strong style={{ fontWeight: 700 }}>Daniyal Faheem</strong> | Open Source Manuscript Editor
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <DocumentProvider>
      <AppContent />
    </DocumentProvider>
  );
};

export default App;
