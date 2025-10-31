/**
 * Smart Search & Replace Service
 * Provides regex pattern support, case sensitivity, whole word matching, and search history
 */

export interface SearchMatch {
  startOffset: number;
  endOffset: number;
  text: string;
  line: number;
  column: number;
}

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

export interface SearchResult {
  matches: SearchMatch[];
  totalCount: number;
}

export interface SearchHistory {
  query: string;
  timestamp: number;
}

const SEARCH_HISTORY_KEY = 'manuscript-search-history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Search for text in content
 */
export function searchText(
  content: string,
  query: string,
  options: SearchOptions
): SearchResult {
  if (!query) {
    return { matches: [], totalCount: 0 };
  }

  const matches: SearchMatch[] = [];
  let pattern: RegExp;

  try {
    if (options.useRegex) {
      const flags = options.caseSensitive ? 'g' : 'gi';
      pattern = new RegExp(query, flags);
    } else {
      let escapedQuery = escapeRegExp(query);
      
      if (options.wholeWord) {
        escapedQuery = `\\b${escapedQuery}\\b`;
      }
      
      const flags = options.caseSensitive ? 'g' : 'gi';
      pattern = new RegExp(escapedQuery, flags);
    }
  } catch (error) {
    // Invalid regex pattern
    return { matches: [], totalCount: 0 };
  }

  const lines = content.split('\n');
  let currentOffset = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    let match: RegExpExecArray | null;

    // Reset lastIndex for global regex
    pattern.lastIndex = 0;

    while ((match = pattern.exec(line)) !== null) {
      matches.push({
        startOffset: currentOffset + match.index,
        endOffset: currentOffset + match.index + match[0].length,
        text: match[0],
        line: lineIndex + 1,
        column: match.index + 1
      });

      // Prevent infinite loop for zero-width matches
      if (match.index === pattern.lastIndex) {
        pattern.lastIndex++;
      }
    }

    currentOffset += line.length + 1; // +1 for newline character
  }

  return {
    matches,
    totalCount: matches.length
  };
}

/**
 * Replace text in content
 */
export function replaceText(
  content: string,
  query: string,
  replacement: string,
  options: SearchOptions,
  replaceAll: boolean = false,
  matchIndex: number = 0
): string {
  const searchResult = searchText(content, query, options);
  
  if (searchResult.matches.length === 0) {
    return content;
  }

  if (replaceAll) {
    // Replace all matches from end to start to preserve offsets
    let result = content;
    for (let i = searchResult.matches.length - 1; i >= 0; i--) {
      const match = searchResult.matches[i];
      result = 
        result.substring(0, match.startOffset) +
        replacement +
        result.substring(match.endOffset);
    }
    return result;
  } else {
    // Replace single match
    if (matchIndex >= 0 && matchIndex < searchResult.matches.length) {
      const match = searchResult.matches[matchIndex];
      return (
        content.substring(0, match.startOffset) +
        replacement +
        content.substring(match.endOffset)
      );
    }
    return content;
  }
}

/**
 * Get search history
 */
export function getSearchHistory(): SearchHistory[] {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load search history:', error);
  }
  return [];
}

/**
 * Add to search history
 */
export function addToSearchHistory(query: string): void {
  if (!query.trim()) {
    return;
  }

  try {
    const history = getSearchHistory();
    
    // Remove duplicate if exists
    const filtered = history.filter(item => item.query !== query);
    
    // Add new entry at the beginning
    filtered.unshift({
      query,
      timestamp: Date.now()
    });
    
    // Keep only last MAX_HISTORY_ITEMS entries
    const trimmed = filtered.slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
}

/**
 * Clear search history
 */
export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear search history:', error);
  }
}

/**
 * Navigate to next match
 */
export function getNextMatchIndex(
  currentIndex: number,
  totalMatches: number
): number {
  if (totalMatches === 0) {
    return -1;
  }
  return (currentIndex + 1) % totalMatches;
}

/**
 * Navigate to previous match
 */
export function getPreviousMatchIndex(
  currentIndex: number,
  totalMatches: number
): number {
  if (totalMatches === 0) {
    return -1;
  }
  return currentIndex <= 0 ? totalMatches - 1 : currentIndex - 1;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlight matches in content (returns HTML with highlights)
 */
export function highlightMatches(
  content: string,
  matches: SearchMatch[],
  currentMatchIndex: number = -1
): string {
  if (matches.length === 0) {
    return content;
  }

  let result = '';
  let lastOffset = 0;

  matches.forEach((match, index) => {
    // Add text before match
    result += escapeHtml(content.substring(lastOffset, match.startOffset));
    
    // Add highlighted match
    const className = index === currentMatchIndex ? 'search-match-current' : 'search-match';
    result += `<mark class="${className}">${escapeHtml(match.text)}</mark>`;
    
    lastOffset = match.endOffset;
  });

  // Add remaining text
  result += escapeHtml(content.substring(lastOffset));

  return result;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
