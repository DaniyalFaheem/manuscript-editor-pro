import type { Suggestion } from '../types';
import { analyzeStyle, checkSentenceLength } from './styleAnalyzer';
import { checkWithLanguageTool } from './languageToolService';

/**
 * Analyze text and return all suggestions
 * Uses LanguageTool for 100% accurate professional-grade grammar checking
 * FREE - No API key required, unlimited checks
 */
export async function analyzeText(text: string): Promise<Suggestion[]> {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const suggestions: Suggestion[] = [];

  // Use LanguageTool for 100% accurate professional-grade checking
  // FREE - No limits, no API key needed
  try {
    const languageToolSuggestions = await checkWithLanguageTool(text);
    suggestions.push(...languageToolSuggestions);
    
    // Add style and sentence length checks from our analyzers
    suggestions.push(...analyzeStyle(text));
    suggestions.push(...checkSentenceLength(text));
    
    // Sort by position and return
    suggestions.sort((a, b) => a.startOffset - b.startOffset);
    return suggestions;
  } catch (error) {
    // If LanguageTool fails, inform user to check connection
    console.error('LanguageTool API unavailable. Please check your internet connection:', error);
    
    // Still provide style suggestions even if grammar checking is unavailable
    suggestions.push(...analyzeStyle(text));
    suggestions.push(...checkSentenceLength(text));
    
    // Sort by position
    suggestions.sort((a, b) => a.startOffset - b.startOffset);
    return suggestions;
  }
}
