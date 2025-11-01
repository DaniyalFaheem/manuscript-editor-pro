import type { Suggestion } from '../types';
import { checkAcademicGrammar } from './offlineAcademicChecker';
import { checkWithLanguageTool } from './languageToolService';
import { validateAllCitations, detectCitationStyle } from './citationValidator';
import { validateAllStatistics } from './enhancedStatisticsValidator';
import { validateStructure, validateHeadingHierarchy, validateNumberedElements, validateMethodologySection } from './academicStructureValidator';

/**
 * Analyze text and return all suggestions
 * ENHANCED: Now includes citation validation, statistical notation, and academic structure checks
 * Uses LanguageTool API for professional accuracy and falls back to offline rules if unavailable
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

  // ENHANCED: Citation validation for research papers
  try {
    console.log('Validating citations...');
    const citationStyle = detectCitationStyle(text);
    if (citationStyle) {
      const citationSuggestions = validateAllCitations(text, citationStyle);
      if (citationSuggestions.length > 0) {
        console.log(`Found ${citationSuggestions.length} citation issues`);
        allSuggestions.push(...citationSuggestions);
      }
    }
  } catch (error) {
    console.error('Citation validation failed:', error);
  }

  // ENHANCED: Statistical notation validation
  try {
    console.log('Validating statistical notation...');
    const statsSuggestions = validateAllStatistics(text);
    if (statsSuggestions.length > 0) {
      console.log(`Found ${statsSuggestions.length} statistical notation issues`);
      allSuggestions.push(...statsSuggestions);
    }
  } catch (error) {
    console.error('Statistics validation failed:', error);
  }

  // ENHANCED: Academic structure validation (for longer documents)
  try {
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 500) { // Only check structure for substantial documents
      console.log('Validating document structure...');
      
      // Detect document type (simple heuristic based on content)
      let docType: 'journal-article' | 'dissertation' | 'thesis' | 'conference-paper' = 'journal-article';
      if (text.toLowerCase().includes('dissertation') || wordCount > 20000) {
        docType = 'dissertation';
      } else if (text.toLowerCase().includes('thesis') || wordCount > 10000) {
        docType = 'thesis';
      } else if (text.toLowerCase().includes('conference') || wordCount < 5000) {
        docType = 'conference-paper';
      }
      
      const structureSuggestions = validateStructure(text, docType);
      const hierarchySuggestions = validateHeadingHierarchy(text);
      const numberingSuggestions = validateNumberedElements(text);
      const methodologySuggestions = validateMethodologySection(text);
      
      const totalStructure = structureSuggestions.length + hierarchySuggestions.length + 
                             numberingSuggestions.length + methodologySuggestions.length;
      
      if (totalStructure > 0) {
        console.log(`Found ${totalStructure} structure issues`);
        allSuggestions.push(...structureSuggestions);
        allSuggestions.push(...hierarchySuggestions);
        allSuggestions.push(...numberingSuggestions);
        allSuggestions.push(...methodologySuggestions);
      }
    }
  } catch (error) {
    console.error('Structure validation failed:', error);
  }

  // Sort by position
  allSuggestions.sort((a, b) => a.startOffset - b.startOffset);
  
  console.log(`Total suggestions found: ${allSuggestions.length}`);
  
  return allSuggestions;
}