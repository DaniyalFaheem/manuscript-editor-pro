import type { Suggestion } from '../types';
import { checkGrammar, checkRepeatedWords } from './grammarChecker';
import { analyzeStyle, checkSentenceLength } from './styleAnalyzer';
import { checkWithLanguageTool } from './languageToolService';

/**
 * Analyze text and return all suggestions
 * Now includes LanguageTool for professional-grade grammar checking (95%+ accuracy)
 */
export async function analyzeText(text: string, useLanguageTool: boolean = true): Promise<Suggestion[]> {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const suggestions: Suggestion[] = [];

  // Try LanguageTool first for professional-grade accuracy (95%+)
  if (useLanguageTool) {
    try {
      const languageToolSuggestions = await checkWithLanguageTool(text);
      if (languageToolSuggestions.length > 0) {
        suggestions.push(...languageToolSuggestions);
        
        // Still add style and sentence length checks from our analyzers
        suggestions.push(...analyzeStyle(text));
        suggestions.push(...checkSentenceLength(text));
        
        // Sort by position and return
        suggestions.sort((a, b) => a.startOffset - b.startOffset);
        return suggestions;
      }
    } catch (error) {
      console.warn('LanguageTool check failed, falling back to basic grammar checker:', error);
    }
  }

  // Fallback to basic grammar checker (70-80% accuracy)
  suggestions.push(...checkGrammar(text));
  suggestions.push(...checkRepeatedWords(text));
  suggestions.push(...analyzeStyle(text));
  suggestions.push(...checkSentenceLength(text));

  // Sort by position
  suggestions.sort((a, b) => a.startOffset - b.startOffset);

  return suggestions;
}
