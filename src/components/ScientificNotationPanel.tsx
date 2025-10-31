import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  Chip,
  Alert,
  IconButton,
  Collapse
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import type { NotationError } from '../services/scientificNotationValidator';

interface ScientificNotationPanelProps {
  errors: NotationError[];
  onFixError?: (error: NotationError) => void;
}

const ScientificNotationPanel: React.FC<ScientificNotationPanelProps> = ({
  errors,
  onFixError
}) => {
  const [expandedErrors, setExpandedErrors] = React.useState<Set<string>>(new Set());

  const toggleError = (errorId: string) => {
    setExpandedErrors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(errorId)) {
        newSet.delete(errorId);
      } else {
        newSet.add(errorId);
      }
      return newSet;
    });
  };

  const getErrorTypeColor = (type: NotationError['type']) => {
    const colors: Record<NotationError['type'], 'error' | 'warning' | 'info'> = {
      'p-value': 'error',
      'sample-size': 'error',
      'confidence-interval': 'warning',
      'effect-size': 'warning',
      'statistical-symbol': 'info',
      'unit-spacing': 'warning',
      'number-formatting': 'info'
    };
    return colors[type] || 'default';
  };

  const getErrorTypeLabel = (type: NotationError['type']) => {
    const labels: Record<NotationError['type'], string> = {
      'p-value': 'P-Value',
      'sample-size': 'Sample Size',
      'confidence-interval': 'CI',
      'effect-size': 'Effect Size',
      'statistical-symbol': 'Symbol',
      'unit-spacing': 'Unit',
      'number-formatting': 'Number'
    };
    return labels[type] || type;
  };

  if (errors.length === 0) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Scientific Notation
        </Typography>
        <Alert severity="success" icon={<CheckCircleIcon />}>
          No notation errors found. Great work!
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Scientific Notation
      </Typography>

      <Alert severity="warning" sx={{ mb: 2 }}>
        Found {errors.length} notation {errors.length === 1 ? 'issue' : 'issues'}
      </Alert>

      <List dense>
        {errors.map(error => {
          const isExpanded = expandedErrors.has(error.id);
          
          return (
            <Box key={error.id}>
              <ListItem
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}
              >
                <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                  <IconButton
                    size="small"
                    onClick={() => toggleError(error.id)}
                    sx={{
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s'
                    }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                      <Chip
                        label={getErrorTypeLabel(error.type)}
                        size="small"
                        color={getErrorTypeColor(error.type)}
                      />
                      <Chip
                        label={`Line ${error.line}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" noWrap>
                      {error.original}
                    </Typography>
                  </Box>
                </Box>

                <Collapse in={isExpanded} sx={{ width: '100%' }}>
                  <Box sx={{ mt: 2, pl: 5 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {error.message}
                    </Typography>
                    
                    <Box
                      sx={{
                        mt: 1,
                        p: 1,
                        backgroundColor: 'success.light',
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block">
                        Suggested fix:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                      >
                        {error.suggestion}
                      </Typography>
                    </Box>

                    {onFixError && (
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            cursor: 'pointer',
                            color: 'primary.main',
                            textDecoration: 'underline',
                            '&:hover': { color: 'primary.dark' }
                          }}
                          onClick={() => onFixError(error)}
                        >
                          Apply fix automatically
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </ListItem>
            </Box>
          );
        })}
      </List>
    </Paper>
  );
};

export default ScientificNotationPanel;
