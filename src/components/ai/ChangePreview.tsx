/**
 * Change Preview Component
 * Shows proposed changes before applying them
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import type { Change } from '../../lib/ai/chatbot/change-applier';

interface ChangePreviewProps {
  changes: Change[];
  onAccept: (change: Change) => void;
  onReject: (change: Change) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

const ChangePreview: React.FC<ChangePreviewProps> = ({
  changes,
  onAccept,
  onReject,
  onAcceptAll,
  onRejectAll,
}) => {
  if (changes.length === 0) {
    return null;
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'grammar':
        return 'error';
      case 'style':
        return 'warning';
      case 'spelling':
        return 'info';
      case 'formatting':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          Proposed Changes ({changes.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={onRejectAll}
          >
            Reject All
          </Button>
          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={onAcceptAll}
            startIcon={<CheckIcon />}
          >
            Accept All
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {changes.map((change) => (
          <Paper key={change.id} variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Chip
                label={change.category}
                size="small"
                color={getCategoryColor(change.category) as any}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<CloseIcon />}
                  onClick={() => onReject(change)}
                >
                  Reject
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={() => onAccept(change)}
                >
                  Accept
                </Button>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              {change.description}
            </Typography>

            <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography
                variant="body2"
                component="div"
                sx={{ fontFamily: 'monospace' }}
              >
                <Box
                  component="span"
                  sx={{ textDecoration: 'line-through', color: 'error.main' }}
                >
                  {change.replacement ? 'Original' : 'Remove'}
                </Box>
                {' → '}
                <Box component="span" sx={{ color: 'success.main' }}>
                  {change.replacement || 'Delete'}
                </Box>
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Paper>
  );
};

export default ChangePreview;
