import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Chip,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import {
  searchText,
  replaceText,
  getSearchHistory,
  addToSearchHistory,
  getNextMatchIndex,
  getPreviousMatchIndex,
  type SearchOptions,
  type SearchResult
} from '../services/searchReplace';

interface SearchReplaceDialogProps {
  open: boolean;
  onClose: () => void;
  content: string;
  onReplace: (newContent: string) => void;
}

const SearchReplaceDialog: React.FC<SearchReplaceDialogProps> = ({
  open,
  onClose,
  content,
  onReplace
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult>({ matches: [], totalCount: 0 });
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState(getSearchHistory());
  
  const [options, setOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false
  });

  // Perform search when query or options change
  useEffect(() => {
    if (searchQuery) {
      const result = searchText(content, searchQuery, options);
      setSearchResult(result);
      setCurrentMatchIndex(0);
    } else {
      setSearchResult({ matches: [], totalCount: 0 });
      setCurrentMatchIndex(0);
    }
  }, [searchQuery, options, content]);

  const handleSearch = () => {
    if (searchQuery) {
      addToSearchHistory(searchQuery);
      setSearchHistory(getSearchHistory());
    }
  };

  const handleNext = () => {
    const nextIndex = getNextMatchIndex(currentMatchIndex, searchResult.totalCount);
    setCurrentMatchIndex(nextIndex);
  };

  const handlePrevious = () => {
    const prevIndex = getPreviousMatchIndex(currentMatchIndex, searchResult.totalCount);
    setCurrentMatchIndex(prevIndex);
  };

  const handleReplace = () => {
    if (searchResult.matches.length > 0) {
      const newContent = replaceText(content, searchQuery, replaceQuery, options, false, currentMatchIndex);
      onReplace(newContent);
    }
  };

  const handleReplaceAll = () => {
    if (searchResult.matches.length > 0) {
      const newContent = replaceText(content, searchQuery, replaceQuery, options, true);
      onReplace(newContent);
    }
  };

  const handleHistoryItemClick = (query: string) => {
    setSearchQuery(query);
    setShowHistory(false);
  };

  const currentMatch = searchResult.matches[currentMatchIndex];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Search and Replace</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Search Field */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Enter search term..."
            InputProps={{
              endAdornment: (
                <IconButton
                  size="small"
                  onClick={() => setShowHistory(!showHistory)}
                  title="Search history"
                >
                  <HistoryIcon />
                </IconButton>
              )
            }}
          />

          {/* Search History */}
          {showHistory && searchHistory.length > 0 && (
            <List dense sx={{ mt: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              {searchHistory.map((item, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton onClick={() => handleHistoryItemClick(item.query)}>
                    <ListItemText primary={item.query} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Replace Field */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Replace with"
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            placeholder="Enter replacement text..."
          />
        </Box>

        {/* Options */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={options.caseSensitive}
                onChange={(e) => setOptions({ ...options, caseSensitive: e.target.checked })}
              />
            }
            label="Case sensitive"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.wholeWord}
                onChange={(e) => setOptions({ ...options, wholeWord: e.target.checked })}
              />
            }
            label="Whole word"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.useRegex}
                onChange={(e) => setOptions({ ...options, useRegex: e.target.checked })}
              />
            }
            label="Use regex"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Results */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="body2">
            {searchResult.totalCount > 0
              ? `${currentMatchIndex + 1} of ${searchResult.totalCount} matches`
              : 'No matches found'}
          </Typography>
          
          {searchResult.totalCount > 0 && (
            <Chip
              label={`Line ${currentMatch?.line}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {/* Navigation */}
        {searchResult.totalCount > 0 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<NavigateBeforeIcon />}
              onClick={handlePrevious}
              variant="outlined"
            >
              Previous
            </Button>
            <Button
              size="small"
              endIcon={<NavigateNextIcon />}
              onClick={handleNext}
              variant="outlined"
            >
              Next
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleReplace}
          variant="outlined"
          disabled={searchResult.totalCount === 0}
        >
          Replace
        </Button>
        <Button
          onClick={handleReplaceAll}
          variant="contained"
          disabled={searchResult.totalCount === 0}
        >
          Replace All ({searchResult.totalCount})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchReplaceDialog;
