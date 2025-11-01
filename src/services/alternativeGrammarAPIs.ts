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
// MAIN ALTERNATIVE API CHECKER
// ============================================================================

/**
 * Try alternative grammar checking APIs in order
 * Used as fallback when LanguageTool is unavailable
 */
export async function checkWithAlternativeAPIs(text: string): Promise<{
  suggestions: Suggestion[];
  apiUsed: string;
}> {
  const apis = [
    { name: 'GrammarBot', fn: checkWithGrammarBot },
    { name: 'Textgears', fn: checkWithTextgears },
    { name: 'Sapling AI', fn: checkWithSaplingAI },
  ];

  for (const api of apis) {
    try {
      console.log(`Trying ${api.name} API...`);
      const suggestions = await api.fn(text);
      console.log(`✓ ${api.name} API succeeded with ${suggestions.length} suggestions`);
      
      return {
        suggestions,
        apiUsed: api.name,
      };
    } catch {
      console.warn(`${api.name} API failed, trying next...`);
      continue;
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
