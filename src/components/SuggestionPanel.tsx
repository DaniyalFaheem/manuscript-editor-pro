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
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { 
  Check, 
  Close, 
  Error, 
  Warning, 
  Info, 
  HelpOutline,
  AutoFixHigh,
  ExpandMore,
} from '@mui/icons-material';
import { useDocument } from '../context/DocumentContext';

const SuggestionPanel: React.FC = () => {
  const { 
    suggestions, 
    acceptSuggestion, 
    dismissSuggestion, 
    navigateToSuggestion,
    autoCorrectAll,
    autoCorrectByType,
    autoCorrectBySeverity,
  } = useDocument();
  const [filter, setFilter] = useState<string>('all');
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [autoCorrectMenuAnchor, setAutoCorrectMenuAnchor] = useState<null | HTMLElement>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState<(() => void) | null>(null);
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');

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

  // Count correctable suggestions
  const correctableCount = useMemo(() => {
    return suggestions.filter(s => s.suggestion && s.suggestion.trim() !== '').length;
  }, [suggestions]);

  const correctableByType = useMemo(() => {
    return (type: string) => {
      return suggestions.filter(
        s => s.type === type && s.suggestion && s.suggestion.trim() !== ''
      ).length;
    };
  }, [suggestions]);

  const handleAutoCorrectClick = (event: React.MouseEvent<HTMLElement>) => {
    setAutoCorrectMenuAnchor(event.currentTarget);
  };

  const handleAutoCorrectMenuClose = () => {
    setAutoCorrectMenuAnchor(null);
  };

  const openConfirmDialog = (message: string, action: () => void) => {
    setConfirmDialogMessage(message);
    setConfirmDialogAction(() => action);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
    setConfirmDialogAction(null);
  };

  const handleConfirmDialogAccept = () => {
    if (confirmDialogAction) {
      confirmDialogAction();
    }
    handleConfirmDialogClose();
  };

  const handleAutoCorrectAll = () => {
    handleAutoCorrectMenuClose();
    const count = correctableCount;
    if (count === 0) {
      return;
    }
    openConfirmDialog(
      `Are you sure you want to auto-correct all ${count} suggestions? This action will apply all available corrections to your document.`,
      () => {
        const applied = autoCorrectAll();
        console.log(`Auto-corrected ${applied} suggestions`);
      }
    );
  };

  const handleAutoCorrectByType = (type: 'grammar' | 'style' | 'punctuation' | 'spelling') => {
    handleAutoCorrectMenuClose();
    const count = correctableByType(type);
    if (count === 0) {
      return;
    }
    openConfirmDialog(
      `Are you sure you want to auto-correct all ${count} ${type} suggestions?`,
      () => {
        const applied = autoCorrectByType(type);
        console.log(`Auto-corrected ${applied} ${type} suggestions`);
      }
    );
  };

  const handleAutoCorrectBySeverity = (severity: 'error' | 'warning' | 'info') => {
    handleAutoCorrectMenuClose();
    const count = suggestions.filter(
      s => s.severity === severity && s.suggestion && s.suggestion.trim() !== ''
    ).length;
    if (count === 0) {
      return;
    }
    openConfirmDialog(
      `Are you sure you want to auto-correct all ${count} ${severity} level suggestions?`,
      () => {
        const applied = autoCorrectBySeverity(severity);
        console.log(`Auto-corrected ${applied} ${severity} suggestions`);
      }
    );
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

        {correctableCount > 0 && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<AutoFixHigh />}
              endIcon={<ExpandMore />}
              onClick={handleAutoCorrectClick}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Auto-Correct ({correctableCount})
            </Button>
            
            <Menu
              anchorEl={autoCorrectMenuAnchor}
              open={Boolean(autoCorrectMenuAnchor)}
              onClose={handleAutoCorrectMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <MenuItem onClick={handleAutoCorrectAll} disabled={correctableCount === 0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                  <Typography>All Suggestions</Typography>
                  <Chip label={correctableCount} size="small" color="primary" />
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem 
                onClick={() => handleAutoCorrectByType('grammar')} 
                disabled={correctableByType('grammar') === 0}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                  <Typography>Grammar Only</Typography>
                  <Chip label={correctableByType('grammar')} size="small" color="error" />
                </Box>
              </MenuItem>
              <MenuItem 
                onClick={() => handleAutoCorrectByType('style')} 
                disabled={correctableByType('style') === 0}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                  <Typography>Style Only</Typography>
                  <Chip label={correctableByType('style')} size="small" color="info" />
                </Box>
              </MenuItem>
              <MenuItem 
                onClick={() => handleAutoCorrectByType('punctuation')} 
                disabled={correctableByType('punctuation') === 0}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                  <Typography>Punctuation Only</Typography>
                  <Chip label={correctableByType('punctuation')} size="small" color="warning" />
                </Box>
              </MenuItem>
              <MenuItem 
                onClick={() => handleAutoCorrectByType('spelling')} 
                disabled={correctableByType('spelling') === 0}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                  <Typography>Spelling Only</Typography>
                  <Chip label={correctableByType('spelling')} size="small" color="error" />
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem 
                onClick={() => handleAutoCorrectBySeverity('error')} 
                disabled={suggestions.filter(s => s.severity === 'error' && s.suggestion && s.suggestion.trim() !== '').length === 0}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                  <Typography>Errors Only</Typography>
                  <Chip 
                    label={suggestions.filter(s => s.severity === 'error' && s.suggestion && s.suggestion.trim() !== '').length} 
                    size="small" 
                    color="error" 
                  />
                </Box>
              </MenuItem>
              <MenuItem 
                onClick={() => handleAutoCorrectBySeverity('warning')} 
                disabled={suggestions.filter(s => s.severity === 'warning' && s.suggestion && s.suggestion.trim() !== '').length === 0}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                  <Typography>Warnings Only</Typography>
                  <Chip 
                    label={suggestions.filter(s => s.severity === 'warning' && s.suggestion && s.suggestion.trim() !== '').length} 
                    size="small" 
                    color="warning" 
                  />
                </Box>
              </MenuItem>
            </Menu>
          </Box>
        )}
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
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => navigateToSuggestion(suggestion.id)}
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
                        Line {suggestion.startLine} • Click to navigate
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
                        onClick={(e) => {
                          e.stopPropagation();
                          acceptSuggestion(suggestion.id);
                        }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissSuggestion(suggestion.id);
                      }}
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

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleConfirmDialogClose}
        aria-labelledby="auto-correct-confirm-title"
        aria-describedby="auto-correct-confirm-description"
      >
        <DialogTitle id="auto-correct-confirm-title">
          Confirm Auto-Correct
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="auto-correct-confirm-description">
            {confirmDialogMessage}
          </DialogContentText>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="body2" color="warning.dark">
              ⚠️ <strong>Note:</strong> This action cannot be easily undone. Please review the corrections before applying them.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDialogAccept} 
            color="primary" 
            variant="contained"
            autoFocus
          >
            Apply Corrections
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SuggestionPanel;
