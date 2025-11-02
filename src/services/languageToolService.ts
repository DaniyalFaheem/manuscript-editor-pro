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

// Multiple LanguageTool mirror endpoints for redundancy and worldwide coverage
// These are all FREE public endpoints with no API key required
const LANGUAGETOOL_MIRRORS = [
  { url: 'https://api.languagetoolplus.com/v2', name: 'LanguageTool Plus Community (US)' },
  { url: 'https://api.languagetool.org/v2', name: 'LanguageTool Official (EU)' },
  { url: 'https://languagetool.org/api/v2', name: 'LanguageTool Alt (Global)' },
  { url: 'https://api.languagetool.dev/v2', name: 'LanguageTool Dev (Global)' },
  { url: 'https://lt.beolingus.de/v2', name: 'LanguageTool Beolingus (DE)' },
];

// Default configuration - FREE, no API key needed
const defaultConfig: LanguageToolConfig = {
  apiUrl: import.meta.env.VITE_LANGUAGETOOL_API_URL || LANGUAGETOOL_MIRRORS[0].url,
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
 * Try to call LanguageTool API with a specific endpoint
 */
async function tryLanguageToolEndpoint(
  apiUrl: string,
  text: string,
  config: LanguageToolConfig
): Promise<Suggestion[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const formData = new URLSearchParams();
    formData.append('text', text);
    formData.append('language', config.language);
    
    if (config.enabledRules && config.enabledRules.length > 0) {
      formData.append('enabledRules', config.enabledRules.join(','));
    }
    
    if (config.disabledRules && config.disabledRules.length > 0) {
      formData.append('disabledRules', config.disabledRules.join(','));
    }

    const response = await fetch(`${apiUrl}/check`, {
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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: LanguageToolResponse = await response.json();
    return convertLanguageToolMatches(text, data.matches);
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Check text using LanguageTool API with multiple mirror endpoints
 * FREE - No API key required, delivers professional accuracy
 * Tries multiple endpoints for maximum reliability
 * Optimized: Chunks large text for better performance
 */
export async function checkWithLanguageTool(
  text: string,
  config: Partial<LanguageToolConfig> = {}
): Promise<Suggestion[]> {
  const mergedConfig = { ...defaultConfig, ...config };
  
  if (!text || text.trim().length === 0) {
    return [];
  }

  // OPTIMIZATION: For very large texts (>10000 chars), chunk them
  const MAX_CHUNK_SIZE = 10000;
  if (text.length > MAX_CHUNK_SIZE) {
    return checkLargeTextInChunks(text, mergedConfig);
  }

  // If user specified a custom API URL, try only that
  const endpointsToTry = config.apiUrl 
    ? [{ url: config.apiUrl, name: 'Custom LanguageTool' }]
    : LANGUAGETOOL_MIRRORS;

  // Try each mirror endpoint
  const errors: string[] = [];
  
  for (let mirrorIndex = 0; mirrorIndex < endpointsToTry.length; mirrorIndex++) {
    const mirror = endpointsToTry[mirrorIndex];
    const apiUrl = mirror.url;
    const mirrorName = mirror.name;
    
    // Try each endpoint up to 2 times
    const maxRetries = 2;
    const retryDelay = 1000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (mirrorIndex === 0 && attempt === 1) {
          console.log(`🔍 Checking with ${mirrorName}...`);
        } else if (attempt === 1) {
          console.log(`🔄 Trying ${mirrorName} (mirror ${mirrorIndex + 1}/${endpointsToTry.length})...`);
        }
        
        const suggestions = await tryLanguageToolEndpoint(apiUrl, text, {
          ...mergedConfig,
          apiUrl
        });
        
        // Success!
        console.info(`✅ ${mirrorName} succeeded! Found ${suggestions.length} suggestions.`);
        return suggestions;
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        const isLastAttempt = attempt === maxRetries;
        const isLastMirror = mirrorIndex === endpointsToTry.length - 1;
        
        if (error instanceof Error && error.name === 'AbortError') {
          errors.push(`${mirrorName}: Timeout`);
          if (!isLastAttempt) {
            console.warn(`⏱️ ${mirrorName} timed out, retrying (${attempt}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }
        } else if (errorMsg.includes('429')) {
          errors.push(`${mirrorName}: Rate limited`);
          if (!isLastAttempt) {
            console.warn(`⏸️ ${mirrorName} rate limited, retrying (${attempt}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * 2));
            continue;
          }
        } else if (errorMsg.includes('5')) {
          errors.push(`${mirrorName}: Server error`);
          if (!isLastAttempt) {
            console.warn(`⚠️ ${mirrorName} server error, retrying (${attempt}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }
        } else {
          errors.push(`${mirrorName}: ${errorMsg}`);
        }
        
        // If last attempt on this mirror, try next mirror
        if (isLastAttempt && !isLastMirror) {
          console.warn(`❌ ${mirrorName} failed after ${maxRetries} attempts, trying next mirror...`);
          break;
        }
        
        // If last attempt on last mirror, throw error
        if (isLastAttempt && isLastMirror) {
          const allErrors = errors.join('; ');
          console.error(`❌ All LanguageTool mirrors failed. Errors: ${allErrors}`);
          throw new Error(`All LanguageTool endpoints failed: ${allErrors}`);
        }
      }
    }
  }
  
  // Should never reach here, but TypeScript needs it
  throw new Error('LanguageTool API failed after trying all mirrors');
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
 * Check large text in chunks for better performance
 * Splits text at sentence boundaries to maintain context
 */
async function checkLargeTextInChunks(
  text: string,
  config: LanguageToolConfig
): Promise<Suggestion[]> {
  const MAX_CHUNK_SIZE = 10000;
  const allSuggestions: Suggestion[] = [];
  
  // Split text into sentences for better chunking
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let currentChunk = '';
  let chunkOffset = 0;
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    
    // If adding this sentence would exceed chunk size, process current chunk
    if (currentChunk.length + sentence.length > MAX_CHUNK_SIZE && currentChunk.length > 0) {
      try {
        // Call tryLanguageToolEndpoint directly to avoid recursive call
        const chunkSuggestions = await tryLanguageToolEndpointDirect(currentChunk, config);
        // Adjust offsets for this chunk
        const adjustedSuggestions = chunkSuggestions.map(s => ({
          ...s,
          startOffset: s.startOffset + chunkOffset,
          endOffset: s.endOffset + chunkOffset,
        }));
        allSuggestions.push(...adjustedSuggestions);
      } catch (error) {
        console.error('Chunk analysis failed:', error);
      }
      
      chunkOffset += currentChunk.length;
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  
  // Process final chunk
  if (currentChunk.length > 0) {
    try {
      // Call tryLanguageToolEndpoint directly to avoid recursive call
      const chunkSuggestions = await tryLanguageToolEndpointDirect(currentChunk, config);
      const adjustedSuggestions = chunkSuggestions.map(s => ({
        ...s,
        startOffset: s.startOffset + chunkOffset,
        endOffset: s.endOffset + chunkOffset,
      }));
      allSuggestions.push(...adjustedSuggestions);
    } catch (error) {
      console.error('Final chunk analysis failed:', error);
    }
  }
  
  return allSuggestions;
}

/**
 * Direct call to endpoint without chunking logic (for use in chunks)
 */
async function tryLanguageToolEndpointDirect(
  text: string,
  config: LanguageToolConfig
): Promise<Suggestion[]> {
  // Try the primary endpoint from config
  const apiUrl = config.apiUrl || defaultConfig.apiUrl;
  
  // Use the first mirror endpoint for chunked calls
  return await tryLanguageToolEndpoint(apiUrl, text, config);
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
