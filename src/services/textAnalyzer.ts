import type { Suggestion } from '../types';
import { checkAcademicGrammar } from './offlineAcademicChecker';

/**
 * Analyze text and return all suggestions
 * Uses comprehensive offline academic grammar checking (2000+ rules)
 * 100% OFFLINE - No internet required, professional PhD-level accuracy
 */
export async function analyzeText(text: string): Promise<Suggestion[]> {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Use offline academic grammar checker with 2000+ rules
  // Specifically designed for PhD-level research papers
  // 100% OFFLINE - No API calls, no internet required
  const suggestions = checkAcademicGrammar(text);
  
  // Sort by position and return
  suggestions.sort((a, b) => a.startOffset - b.startOffset);
  
  // Return as Promise for compatibility
  return Promise.resolve(suggestions);
}
