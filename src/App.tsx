import React from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography } from '@mui/material';
import { DocumentProvider, useDocument } from './context/DocumentContext';
import Header from './components/Header';
import EditorPanel from './components/EditorPanel';
import SuggestionPanel from './components/SuggestionPanel';
import MetricsPanel from './components/MetricsPanel';

const AppContent: React.FC = () => {
  const { isDarkMode } = useDocument();

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header />
        <Box sx={{ flex: 1, overflow: 'hidden', p: 2, display: 'flex', gap: 2 }}>
          <Box sx={{ flex: '0 0 25%', minWidth: 0, height: '100%' }}>
            <SuggestionPanel />
          </Box>
          <Box sx={{ flex: '1 1 50%', minWidth: 0, height: '100%' }}>
            <EditorPanel />
          </Box>
          <Box sx={{ flex: '0 0 25%', minWidth: 0, height: '100%' }}>
            <MetricsPanel />
          </Box>
        </Box>
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 2,
            mt: 'auto',
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[200]
                : theme.palette.grey[800],
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            Created by <strong>Daniyal Faheem</strong> | Open Source Manuscript Editor
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
