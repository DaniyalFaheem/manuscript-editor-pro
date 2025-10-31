import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  Chip,
  IconButton,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Badge,
} from '@mui/material';
import { Check, Close, Error, Warning, Info } from '@mui/icons-material';
import { useDocument } from '../context/DocumentContext';

const SuggestionPanel: React.FC = () => {
  const { suggestions, acceptSuggestion, dismissSuggestion } = useDocument();
  const [filter, setFilter] = useState<string>('all');

  const filteredSuggestions = suggestions.filter(s => {
    if (filter === 'all') return true;
    return s.type === filter;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <Error color="error" fontSize="small" />;
      case 'warning':
        return <Warning color="warning" fontSize="small" />;
      case 'info':
        return <Info color="info" fontSize="small" />;
      default:
        return <Info color="info" fontSize="small" />;
    }
  };

  const getSeverityColor = (severity: string): "error" | "warning" | "info" => {
    if (severity === 'error') return 'error';
    if (severity === 'warning') return 'warning';
    return 'info';
  };

  const getTypeCount = (type: string) => {
    if (type === 'all') return suggestions.length;
    return suggestions.filter(s => s.type === type).length;
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Suggestions ({suggestions.length})
        </Typography>
        
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, newFilter) => newFilter && setFilter(newFilter)}
          size="small"
          fullWidth
          sx={{ mt: 1 }}
        >
          <ToggleButton value="all">
            <Badge badgeContent={getTypeCount('all')} color="primary">
              <Typography variant="caption">All</Typography>
            </Badge>
          </ToggleButton>
          <ToggleButton value="grammar">
            <Badge badgeContent={getTypeCount('grammar')} color="primary">
              <Typography variant="caption">Grammar</Typography>
            </Badge>
          </ToggleButton>
          <ToggleButton value="style">
            <Badge badgeContent={getTypeCount('style')} color="primary">
              <Typography variant="caption">Style</Typography>
            </Badge>
          </ToggleButton>
          <ToggleButton value="punctuation">
            <Badge badgeContent={getTypeCount('punctuation')} color="primary">
              <Typography variant="caption">Punct.</Typography>
            </Badge>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
        {filteredSuggestions.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No suggestions found. Great work! 🎉
            </Typography>
          </Box>
        ) : (
          filteredSuggestions.map((suggestion) => (
            <React.Fragment key={suggestion.id}>
              <ListItem
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  py: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', mb: 1 }}>
                  <Box sx={{ mr: 1, mt: 0.5 }}>
                    {getSeverityIcon(suggestion.severity)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" gutterBottom>
                      {suggestion.message}
                    </Typography>
                    
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={suggestion.type}
                        size="small"
                        color={getSeverityColor(suggestion.severity)}
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Line {suggestion.startLine}
                      </Typography>
                    </Box>

                    {suggestion.original && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'error.light', borderRadius: 1, opacity: 0.7 }}>
                        <Typography variant="caption" color="error.dark">
                          Original: <strong>{suggestion.original}</strong>
                        </Typography>
                      </Box>
                    )}

                    {suggestion.suggestion && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'success.light', borderRadius: 1, opacity: 0.7 }}>
                        <Typography variant="caption" color="success.dark">
                          Suggested: <strong>{suggestion.suggestion}</strong>
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                  {suggestion.suggestion && (
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => acceptSuggestion(suggestion.id)}
                      title="Accept suggestion"
                    >
                      <Check />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => dismissSuggestion(suggestion.id)}
                    title="Dismiss suggestion"
                  >
                    <Close />
                  </IconButton>
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>
    </Paper>
  );
};

export default SuggestionPanel;
