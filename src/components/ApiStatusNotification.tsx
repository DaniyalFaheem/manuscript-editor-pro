import React, { useState, useEffect } from 'react';
import { Alert, Snackbar, IconButton } from '@mui/material';
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
    // Check for API errors every 15 seconds (optimized to minimize overhead)
    const interval = setInterval(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== 'undefined' && (window as any).__lastLanguageToolError) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = (window as any).__lastLanguageToolError;
        // Only show critical errors (not using alternative/offline - those work fine)
        // Only show if error is recent (within last 30 seconds) and different from current
        // Use optional chaining for safe property access
        if (Date.now() - error.timestamp < 30000 && !error?.usingAlternative && !error?.usingOffline) {
          if (!errorInfo || error.timestamp !== errorInfo.timestamp) {
            setErrorInfo(error);
            setOpen(true);
          }
        }
      }
    }, 15000); // Increased to 15 seconds for better performance

    return () => clearInterval(interval);
  }, [errorInfo]);

  const handleClose = () => {
    setOpen(false);
    // Clear the error from window after closing
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      autoHideDuration={8000}
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

        </small>
      </Alert>
    </Snackbar>
  );
};

export default ApiStatusNotification;
