import type { Suggestion } from '../types';
import { generateId, getPositionFromOffset } from '../utils/textUtils';

/**
 * Alternative Grammar Checking APIs
 * Used as fallback when LanguageTool API is unavailable
 * 
 * Supported APIs:
 * 1. Sapling AI - Free tier available
 * 2. Textgears - Free API with registration
 * 3. GrammarBot - Free tier available
 */

// ============================================================================
// SAPLING AI API
// ============================================================================

interface SaplingEdit {
  sentence: string;
  sentence_start: number;
  start: number;
  end: number;
  replacement: string;
  error_type: string;
  general_error_type: string;
}

interface SaplingResponse {
  edits: SaplingEdit[];
}

/**
 * Check text using Sapling AI API
 * Free tier available: https://sapling.ai/
 */
async function checkWithSaplingAI(text: string): Promise<Suggestion[]> {
  const apiUrl = 'https://api.sapling.ai/api/v1/edits';
  const apiKey = import.meta.env.VITE_SAPLING_API_KEY || 'demo-key';
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: apiKey,
        text: text,
        session_id: 'manuscript-editor-session'
      }),
    });

    if (!response.ok) {
      throw new Error(`Sapling API error: ${response.status}`);
    }

    const data: SaplingResponse = await response.json();
    
    return data.edits.map(edit => {
      const startPos = getPositionFromOffset(text, edit.start);
      const endPos = getPositionFromOffset(text, edit.end);
      
      // Map Sapling error types to our types
      let type: Suggestion['type'] = 'grammar';
      if (edit.general_error_type.includes('spelling')) {
        type = 'spelling';
      } else if (edit.general_error_type.includes('style')) {
        type = 'style';
      } else if (edit.general_error_type.includes('punctuation')) {
        type = 'punctuation';
      }
      
      return {
        id: generateId(),
        type,
        severity: 'warning',
        message: edit.error_type,
        original: text.substring(edit.start, edit.end),
        suggestion: edit.replacement,
        startLine: startPos.line,
        endLine: endPos.line,
        startColumn: startPos.column,
        endColumn: endPos.column,
        startOffset: edit.start,
        endOffset: edit.end,
      };
    });
  } catch (error) {
    console.error('Sapling AI API failed:', error);
    throw error;
  }
}

// ============================================================================
// TEXTGEARS API
// ============================================================================

interface TextgearsError {
  id: string;
  offset: number;
  length: number;
  description: {
    en: string;
  };
  bad: string;
  better: string[];
  type: string;
}

interface TextgearsResponse {
  status: boolean;
  response: {
    errors: TextgearsError[];
  };
}

/**
 * Check text using Textgears API
 * Free tier: https://textgears.com/api
 */
async function checkWithTextgears(text: string): Promise<Suggestion[]> {
  const apiUrl = 'https://api.textgears.com/grammar';
  const apiKey = import.meta.env.VITE_TEXTGEARS_API_KEY || 'demo';
  
  try {
    const formData = new URLSearchParams();
    formData.append('text', text);
    formData.append('language', 'en-US');
    formData.append('key', apiKey);

    const response = await fetch(`${apiUrl}?${formData.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Textgears API error: ${response.status}`);
    }

    const data: TextgearsResponse = await response.json();
    
    if (!data.status || !data.response.errors) {
      return [];
    }
    
    return data.response.errors.map(error => {
      const startOffset = error.offset;
      const endOffset = startOffset + error.length;
      const startPos = getPositionFromOffset(text, startOffset);
      const endPos = getPositionFromOffset(text, endOffset);
      
      // Map Textgears types to our types
      let type: Suggestion['type'] = 'grammar';
      if (error.type.includes('spelling')) {
        type = 'spelling';
      } else if (error.type.includes('style')) {
        type = 'style';
      } else if (error.type.includes('punctuation')) {
        type = 'punctuation';
      }
      
      return {
        id: generateId(),
        type,
        severity: 'error',
        message: error.description.en,
        original: error.bad,
        suggestion: error.better.length > 0 ? error.better[0] : '',
        startLine: startPos.line,
        endLine: endPos.line,
        startColumn: startPos.column,
        endColumn: endPos.column,
        startOffset,
        endOffset,
      };
    });
  } catch (error) {
    console.error('Textgears API failed:', error);
    throw error;
  }
}

// ============================================================================
// GRAMMARBOT API
// ============================================================================

interface GrammarBotMatch {
  message: string;
  offset: number;
  length: number;
  replacements: Array<{ value: string }>;
  rule: {
    id: string;
    issueType: string;
  };
}

interface GrammarBotResponse {
  matches: GrammarBotMatch[];
}

/**
 * Check text using GrammarBot API
 * Free tier: https://www.grammarbot.io/
 */
async function checkWithGrammarBot(text: string): Promise<Suggestion[]> {
  const apiUrl = 'https://api.grammarbot.io/v2/check';
  const apiKey = import.meta.env.VITE_GRAMMARBOT_API_KEY || 'free';
  
  try {
    const formData = new URLSearchParams();
    formData.append('text', text);
    formData.append('language', 'en-US');
    formData.append('api_key', apiKey);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`GrammarBot API error: ${response.status}`);
    }

    const data: GrammarBotResponse = await response.json();
    
    return data.matches.map(match => {
      const startOffset = match.offset;
      const endOffset = startOffset + match.length;
      const startPos = getPositionFromOffset(text, startOffset);
      const endPos = getPositionFromOffset(text, endOffset);
      
      // Map GrammarBot types to our types
      let type: Suggestion['type'] = 'grammar';
      const issueType = match.rule.issueType.toLowerCase();
      if (issueType.includes('misspelling')) {
        type = 'spelling';
      } else if (issueType.includes('style')) {
        type = 'style';
      } else if (issueType.includes('punctuation')) {
        type = 'punctuation';
      }
      
      return {
        id: generateId(),
        type,
        severity: 'warning',
        message: match.message,
        original: text.substring(startOffset, endOffset),
        suggestion: match.replacements.length > 0 ? match.replacements[0].value : '',
        startLine: startPos.line,
        endLine: endPos.line,
        startColumn: startPos.column,
        endColumn: endPos.column,
        startOffset,
        endOffset,
      };
    });
  } catch (error) {
    console.error('GrammarBot API failed:', error);
    throw error;
  }
}

// ============================================================================
// AFTER THE DEADLINE API
// ============================================================================

/**
 * Check text using After The Deadline API
 * Free and open source API
 */
async function checkWithAfterTheDeadline(text: string): Promise<Suggestion[]> {
  // After The Deadline has multiple free public endpoints
  const endpoints = [
    'https://service.afterthedeadline.com/checkDocument',
    'https://api.afterthedeadline.com/checkDocument'
  ];
  
  let lastError: Error | null = null;
  
  for (const apiUrl of endpoints) {
    try {
      const formData = new URLSearchParams();
      formData.append('key', 'manuscript-editor-pro');
      formData.append('data', text);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        signal: AbortSignal.timeout(20000), // 20 second timeout
      });

      if (!response.ok) {
        throw new Error(`After The Deadline API error: ${response.status}`);
      }

      const xmlText = await response.text();
      
      // Parse XML response
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const errors = xmlDoc.getElementsByTagName('error');
      
      const suggestions: Suggestion[] = [];
      
      for (let i = 0; i < errors.length; i++) {
        const error = errors[i];
        const errorString = error.getElementsByTagName('string')[0]?.textContent || '';
        const description = error.getElementsByTagName('description')[0]?.textContent || '';
        const precontext = error.getElementsByTagName('precontext')[0]?.textContent || '';
        const errorType = error.getElementsByTagName('type')[0]?.textContent || '';
        const suggestionsElements = error.getElementsByTagName('suggestions')[0]?.getElementsByTagName('option');
        
        const suggestionsList: string[] = [];
        if (suggestionsElements) {
          for (let j = 0; j < suggestionsElements.length; j++) {
            const option = suggestionsElements[j].textContent;
            if (option) suggestionsList.push(option);
          }
        }
        
        // Find the position of the error in the text
        const searchText = precontext + errorString;
        const startOffset = text.indexOf(searchText);
        
        if (startOffset !== -1) {
          const actualStart = startOffset + precontext.length;
          const endOffset = actualStart + errorString.length;
          const startPos = getPositionFromOffset(text, actualStart);
          const endPos = getPositionFromOffset(text, endOffset);
          
          // Map ATD error types to our types
          let type: Suggestion['type'] = 'grammar';
          let severity: Suggestion['severity'] = 'warning';
          
          if (errorType === 'spelling') {
            type = 'spelling';
            severity = 'error';
          } else if (errorType === 'style') {
            type = 'style';
          } else if (errorType === 'grammar') {
            type = 'grammar';
            severity = 'error';
          }
          
          suggestions.push({
            id: generateId(),
            type,
            severity,
            message: description,
            original: errorString,
            suggestion: suggestionsList.length > 0 ? suggestionsList[0] : '',
            startLine: startPos.line,
            endLine: endPos.line,
            startColumn: startPos.column,
            endColumn: endPos.column,
            startOffset: actualStart,
            endOffset,
          });
        }
      }
      
      return suggestions;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      continue; // Try next endpoint
    }
  }
  
  console.error('After The Deadline API failed:', lastError);
  throw lastError || new Error('All After The Deadline endpoints failed');
}

// ============================================================================
// MAIN ALTERNATIVE API CHECKER WITH ENHANCED SUPPORT
// ============================================================================

/**
 * Try alternative grammar checking APIs in order with parallel execution
 * Used as fallback when LanguageTool is unavailable
 */
export async function checkWithAlternativeAPIs(text: string): Promise<{
  suggestions: Suggestion[];
  apiUsed: string;
}> {
  const apis = [
    { name: 'After The Deadline', fn: checkWithAfterTheDeadline },
    { name: 'GrammarBot', fn: checkWithGrammarBot },
    { name: 'Textgears', fn: checkWithTextgears },
    { name: 'Sapling AI', fn: checkWithSaplingAI },
  ];

  // Try APIs in parallel for faster results
  const results = await Promise.allSettled(
    apis.map(async (api) => {
      console.log(`Trying ${api.name} API...`);
      const suggestions = await api.fn(text);
      console.log(`✓ ${api.name} API succeeded with ${suggestions.length} suggestions`);
      return { suggestions, apiUsed: api.name };
    })
  );

  // Return the first successful result (even if empty array)
  for (const result of results) {
    if (result.status === 'fulfilled') {
      return result.value;
    }
  }

  // All APIs failed
  throw new Error('All alternative grammar checking APIs failed');
}

/**
 * Check if any alternative API is configured
 */
export function hasAlternativeAPIConfigured(): boolean {
  return !!(
    import.meta.env.VITE_SAPLING_API_KEY ||
    import.meta.env.VITE_TEXTGEARS_API_KEY ||
    import.meta.env.VITE_GRAMMARBOT_API_KEY
  );
}
