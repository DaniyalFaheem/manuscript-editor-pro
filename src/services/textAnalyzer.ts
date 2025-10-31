import type { Suggestion } from '../types';
import { checkGrammar, checkRepeatedWords } from './grammarChecker';
import { analyzeStyle, checkSentenceLength } from './styleAnalyzer';

/**
 * Analyze text and return all suggestions
 */
export function analyzeText(text: string): Suggestion[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const suggestions: Suggestion[] = [];

  // Grammar and punctuation checks
  suggestions.push(...checkGrammar(text));

  // Check for repeated words
  suggestions.push(...checkRepeatedWords(text));

  // Style analysis
  suggestions.push(...analyzeStyle(text));

  // Sentence length check
  suggestions.push(...checkSentenceLength(text));

  // Sort by position
  suggestions.sort((a, b) => a.startOffset - b.startOffset);

  return suggestions;
}
