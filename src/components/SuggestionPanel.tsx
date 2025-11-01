import React, { useState, useMemo } from 'react';
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
  Tooltip,
  Collapse,
} from '@mui/material';
import { Check, Close, Error, Warning, Info, HelpOutline } from '@mui/icons-material';
import { useDocument } from '../context/DocumentContext';

const SuggestionPanel: React.FC = () => {
  const { suggestions, acceptSuggestion, dismissSuggestion } = useDocument();
  const [filter, setFilter] = useState<string>('all');
  const [showLegend, setShowLegend] = useState<boolean>(false);

  // Memoize filtered suggestions to avoid re-filtering on every render
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(s => {
      if (filter === 'all') return true;
      return s.type === filter;
    });
  }, [suggestions, filter]);

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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">
            Suggestions ({suggestions.length})
          </Typography>
          <Tooltip title="Show color legend">
            <IconButton size="small" onClick={() => setShowLegend(!showLegend)}>
              <HelpOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Collapse in={showLegend}>
          <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="caption" fontWeight="bold" display="block" mb={1}>
              Color Guide (In-Editor Highlights):
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 2, bgcolor: '#f44336', borderRadius: 1 }} />
                <Typography variant="caption">Grammar Errors (Red)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 2, bgcolor: '#ff9800', borderRadius: 1 }} />
                <Typography variant="caption">Grammar Warnings (Orange)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 2, bgcolor: '#2196f3', borderRadius: 1 }} />
                <Typography variant="caption">Style Issues (Blue)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 2, bgcolor: '#ffc107', borderRadius: 1 }} />
                <Typography variant="caption">Punctuation (Yellow)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 2, bgcolor: '#d32f2f', borderRadius: 1 }} />
                <Typography variant="caption">Spelling Errors (Red Dots)</Typography>
              </Box>
            </Box>
            <Typography variant="caption" display="block" mt={1} fontStyle="italic" color="text.secondary">
              Hover over underlined text in the editor for correction suggestions.
            </Typography>
          </Box>
        </Collapse>
        
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
                      <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'error.light', borderRadius: 1, border: '1px solid', borderColor: 'error.main' }}>
                        <Typography variant="caption" color="error.dark" fontWeight="bold" display="block" mb={0.5}>
                          ❌ Issue:
                        </Typography>
                        <Typography variant="body2" color="error.dark" sx={{ fontFamily: 'monospace' }}>
                          {suggestion.original}
                        </Typography>
                      </Box>
                    )}

                    {suggestion.suggestion && (
                      <Box sx={{ mt: 1, p: 1.5, bgcolor: 'success.light', borderRadius: 1, border: '1px solid', borderColor: 'success.main' }}>
                        <Typography variant="caption" color="success.dark" fontWeight="bold" display="block" mb={0.5}>
                          ✅ Correction:
                        </Typography>
                        <Typography variant="body2" color="success.dark" sx={{ fontFamily: 'monospace' }}>
                          {suggestion.suggestion}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                  {suggestion.suggestion && (
                    <Tooltip title="Apply this correction to your document">
                      <IconButton
                        size="medium"
                        color="success"
                        onClick={() => acceptSuggestion(suggestion.id)}
                        sx={{
                          bgcolor: 'success.light',
                          '&:hover': { bgcolor: 'success.main', color: 'white' }
                        }}
                      >
                        <Check />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Ignore this suggestion">
                    <IconButton
                      size="medium"
                      color="error"
                      onClick={() => dismissSuggestion(suggestion.id)}
                      sx={{
                        bgcolor: 'error.light',
                        '&:hover': { bgcolor: 'error.main', color: 'white' }
                      }}
                    >
                      <Close />
                    </IconButton>
                  </Tooltip>
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
