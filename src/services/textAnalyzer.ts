import type { Suggestion } from '../types';
import { checkAcademicGrammar } from './offlineAcademicChecker';
import { checkWithLanguageTool, isLanguageToolAvailable } from './languageToolService';

/**
 * Analyze text and return all suggestions
 * FIXED: Now properly uses LanguageTool API for professional accuracy
 * Falls back to offline rules if API unavailable
 */
export async function analyzeText(text: string): Promise<Suggestion[]> {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const allSuggestions: Suggestion[] = [];

  try {
    // PRIMARY: Try LanguageTool API first (95%+ accuracy)
    console.log('Checking with LanguageTool API...');
    const apiSuggestions = await checkWithLanguageTool(text);
    
    if (apiSuggestions && apiSuggestions.length > 0) {
      console.log(`LanguageTool found ${apiSuggestions.length} issues`);
      allSuggestions.push(...apiSuggestions);
    } else {
      console.log('LanguageTool returned no suggestions');
    }
  } catch (error) {
    console.error('LanguageTool API failed:', error);
  }

  // BACKUP: Add offline academic grammar checker
  try {
    console.log('Adding offline grammar checks...');
    const offlineSuggestions = checkAcademicGrammar(text);
    
    if (offlineSuggestions && offlineSuggestions.length > 0) {
      console.log(`Offline checker found ${offlineSuggestions.length} issues`);
      
      // Merge with API suggestions, avoiding duplicates
      for (const suggestion of offlineSuggestions) {
        // Check if not already found by LanguageTool
        const isDuplicate = allSuggestions.some(
          s => s.startOffset === suggestion.startOffset && 
               s.endOffset === suggestion.endOffset
        );
        
        if (!isDuplicate) {
          allSuggestions.push(suggestion);
        }
      }
    }
  } catch (error) {
    console.error('Offline checker failed:', error);
  }

  // Sort by position
  allSuggestions.sort((a, b) => a.startOffset - b.startOffset);
  
  console.log(`Total suggestions found: ${allSuggestions.length}`);
  
  return allSuggestions;
}