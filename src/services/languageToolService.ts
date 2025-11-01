import type { Suggestion } from '../types';
import { generateId, getPositionFromOffset } from '../utils/textUtils';

/**
 * LanguageTool API Response Types
 */
interface LanguageToolMatch {
  message: string;
  shortMessage?: string;
  offset: number;
  length: number;
  replacements: Array<{ value: string }>;
  context: {
    text: string;
    offset: number;
    length: number;
  };
  rule: {
    id: string;
    description: string;
    issueType: string;
    category: {
      id: string;
      name: string;
    };
  };
  type?: {
    typeName: string;
  };
}

interface LanguageToolResponse {
  matches: LanguageToolMatch[];
  language?: {
    name: string;
    code: string;
  };
}

/**
 * Configuration for LanguageTool API
 * FREE - No API key required, unlimited checks
 */
interface LanguageToolConfig {
  apiUrl: string;
  language: string;
  enabledRules?: string[];
  disabledRules?: string[];
  timeout?: number;
}

// Default configuration - FREE, no API key needed
const defaultConfig: LanguageToolConfig = {
  apiUrl: import.meta.env.VITE_LANGUAGETOOL_API_URL || 'https://api.languagetool.org/v2',
  language: 'en-US',
  timeout: 30000, // 30 seconds - increased for better reliability
};

/**
 * Map LanguageTool issue type to suggestion type
 */
function mapIssueTypeToSuggestionType(issueType: string, categoryId: string): Suggestion['type'] {
  const type = issueType.toLowerCase();
  const category = categoryId.toLowerCase();
  
  if (type.includes('misspelling') || category.includes('typos')) {
    return 'spelling';
  }
  if (type.includes('grammar') || category.includes('grammar')) {
    return 'grammar';
  }
  if (type.includes('punctuation') || category.includes('punctuation')) {
    return 'punctuation';
  }
  if (type.includes('style') || category.includes('style') || type.includes('redundancy')) {
    return 'style';
  }
  
  // Default to grammar
  return 'grammar';
}

/**
 * Map LanguageTool type name to severity
 */
function mapTypeNameToSeverity(typeName?: string): Suggestion['severity'] {
  if (!typeName) return 'warning';
  
  const type = typeName.toLowerCase();
  
  if (type.includes('addition') || type.includes('hint')) {
    return 'info';
  }
  if (type.includes('other')) {
    return 'warning';
  }
  
  return 'error';
}

/**
 * Check text using LanguageTool API with retry logic
 * FREE - No API key required, delivers professional accuracy
 */
export async function checkWithLanguageTool(
  text: string,
  config: Partial<LanguageToolConfig> = {}
): Promise<Suggestion[]> {
  const mergedConfig = { ...defaultConfig, ...config };
  
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Retry configuration
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second between retries
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), mergedConfig.timeout);

      const formData = new URLSearchParams();
      formData.append('text', text);
      formData.append('language', mergedConfig.language);
      
      if (mergedConfig.enabledRules && mergedConfig.enabledRules.length > 0) {
        formData.append('enabledRules', mergedConfig.enabledRules.join(','));
      }
      
      if (mergedConfig.disabledRules && mergedConfig.disabledRules.length > 0) {
        formData.append('disabledRules', mergedConfig.disabledRules.join(','));
      }

      const response = await fetch(`${mergedConfig.apiUrl}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: formData.toString(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle rate limiting with retry
        if (response.status === 429 && attempt < maxRetries) {
          console.warn(`LanguageTool API rate limited. Retrying (${attempt}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          continue;
        }
        
        // Handle server errors with retry
        if (response.status >= 500 && attempt < maxRetries) {
          console.warn(`LanguageTool API server error (${response.status}). Retrying (${attempt}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          continue;
        }
        
        throw new Error(`LanguageTool API error: ${response.status} ${response.statusText}`);
      }

      const data: LanguageToolResponse = await response.json();
      
      // Success - log if this was a retry
      if (attempt > 1) {
        console.info(`LanguageTool API succeeded on attempt ${attempt}/${maxRetries}`);
      }
      
      return convertLanguageToolMatches(text, data.matches);
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          if (!isLastAttempt) {
            console.warn(`LanguageTool API request timed out. Retrying (${attempt}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
            continue;
          }
          console.error('LanguageTool API request timed out after all retries');
        } else if (error.message.includes('fetch')) {
          // Network errors
          if (!isLastAttempt) {
            console.warn(`LanguageTool API network error. Retrying (${attempt}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
            continue;
          }
          console.error('LanguageTool API network error after all retries:', error.message);
        } else {
          console.error('LanguageTool API error:', error.message);
        }
      }
      
      // If this was the last attempt, re-throw
      if (isLastAttempt) {
        throw error;
      }
    }
  }
  
  // Should never reach here, but TypeScript needs it
  throw new Error('LanguageTool API failed after all retries');
}

/**
 * Convert LanguageTool matches to Suggestion format
 */
function convertLanguageToolMatches(text: string, matches: LanguageToolMatch[]): Suggestion[] {
  return matches.map(match => {
    const startOffset = match.offset;
    const endOffset = startOffset + match.length;
    const startPos = getPositionFromOffset(text, startOffset);
    const endPos = getPositionFromOffset(text, endOffset);
    
    const type = mapIssueTypeToSuggestionType(
      match.rule.issueType,
      match.rule.category.id
    );
    
    const severity = mapTypeNameToSeverity(match.type?.typeName);
    
    // Get the first replacement suggestion, or empty string if none
    const suggestion = match.replacements.length > 0 
      ? match.replacements[0].value 
      : '';
    
    return {
      id: generateId(),
      type,
      severity,
      message: match.shortMessage || match.message,
      original: text.substring(startOffset, endOffset),
      suggestion,
      startLine: startPos.line,
      endLine: endPos.line,
      startColumn: startPos.column,
      endColumn: endPos.column,
      startOffset,
      endOffset,
    };
  });
}

/**
 * Check if LanguageTool API is available
 */
export async function isLanguageToolAvailable(apiUrl?: string): Promise<boolean> {
  const url = apiUrl || defaultConfig.apiUrl;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${url}/languages`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.debug('LanguageTool API availability check failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}
