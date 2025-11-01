import React, { useState, useEffect } from 'react';
import { Alert, Snackbar, IconButton, Link } from '@mui/material';
import { Close, Refresh } from '@mui/icons-material';

/**
 * Component to display LanguageTool API status notifications
 * Shows warnings when API is unavailable and suggests checking internet connection
 */
const ApiStatusNotification: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{
    message: string;
    details: string;
    timestamp: number;
    usingAlternative?: boolean;
    alternativeAPI?: string;
    usingOffline?: boolean;
  } | null>(null);

  useEffect(() => {
    // Check for API errors every 5 seconds (reduced frequency for better performance)
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).__lastLanguageToolError) {
        const error = (window as any).__lastLanguageToolError;
        // Only show if error is recent (within last 15 seconds) and different from current
        if (Date.now() - error.timestamp < 15000) {
          if (!errorInfo || error.timestamp !== errorInfo.timestamp) {
            setErrorInfo(error);
            setOpen(true);
          }
        }
      }
    }, 5000); // Reduced from 2000ms to 5000ms

    return () => clearInterval(interval);
  }, [errorInfo]);

  const handleClose = () => {
    setOpen(false);
    // Clear the error from window after closing
    if (typeof window !== 'undefined') {
      delete (window as any).__lastLanguageToolError;
    }
  };

  const handleRefresh = () => {
    // Trigger a refresh by dispatching a custom event
    window.dispatchEvent(new CustomEvent('refreshGrammarCheck'));
    handleClose();
  };

  if (!errorInfo) return null;

  // Determine alert severity based on fallback type
  const severity = errorInfo.usingAlternative ? 'info' : 'warning';

  return (
    <Snackbar
      open={open}
      autoHideDuration={10000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        severity={severity}
        variant="filled"
        onClose={handleClose}
        action={
          <>
            <IconButton
              size="small"
              aria-label="refresh"
              color="inherit"
              onClick={handleRefresh}
              title="Retry with LanguageTool API"
            >
              <Refresh />
            </IconButton>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <Close />
            </IconButton>
          </>
        }
        sx={{ minWidth: '400px' }}
      >
        <strong>{errorInfo.message}</strong>
        <br />
        <small>
          {errorInfo.usingAlternative && (
            <>
              Maintaining high accuracy with {errorInfo.alternativeAPI} API.
              <br />
              LanguageTool will be used automatically when available.
            </>
          )}
          {errorInfo.usingOffline && (
            <>
              {errorInfo.details}
              <br />
            </>
          )}
          {!errorInfo.usingAlternative && !errorInfo.usingOffline && (
            <>
              Check your internet connection.
              <br />
            </>
          )}
          <Link
            href="https://languagetool.org/status"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'inherit', textDecoration: 'underline' }}
          >
            Check LanguageTool API Status
          </Link>
        </small>
      </Alert>
    </Snackbar>
  );
};

export default ApiStatusNotification;
