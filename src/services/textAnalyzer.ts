import type { Suggestion } from '../types';
import { checkWithLanguageTool } from './languageToolService';
import { checkAcademicGrammar } from './offlineAcademicChecker';
import { validateAllCitations, detectCitationStyle } from './citationValidator';
import { validateAllStatistics } from './enhancedStatisticsValidator';
import { validateStructure, validateHeadingHierarchy, validateNumberedElements, validateMethodologySection } from './academicStructureValidator';
import { validateAllFieldSpecific, detectAcademicField } from './fieldSpecificValidator';

// Enable debug logging (set to false for production)
const DEBUG = false;

const log = (...args: unknown[]) => {
  if (DEBUG) console.log(...args);
};

/**
 * Analyze text and return all suggestions
 * ENHANCED: Comprehensive validation for PhD-level research papers
 * - Grammar checking via LanguageTool API (requires internet for maximum accuracy)
 * - Citation validation (APA, MLA, Chicago, IEEE, Harvard)
 * - Statistical notation (p-values, confidence intervals, effect sizes)
 * - Academic structure (sections, headings, methodology)
 * - Field-specific terminology (STEM, Humanities, Social Sciences, etc.)
 * 
 * Note: Grammar checking requires internet connection. Specialized validators work independently.
 */
export async function analyzeText(text: string): Promise<Suggestion[]> {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const allSuggestions: Suggestion[] = [];

  // PRIMARY: Use LanguageTool API for grammar checking (requires internet for maximum accuracy)
  let languageToolSuccess = false;
  let apiErrorMessage = '';
  
  try {
    log('Checking with LanguageTool API...');
    const apiSuggestions = await checkWithLanguageTool(text);
    
    if (apiSuggestions && apiSuggestions.length >= 0) {
      log(`LanguageTool found ${apiSuggestions.length} issues`);
      allSuggestions.push(...apiSuggestions);
      languageToolSuccess = true;
      
      // Clear any previous error notifications
      if (typeof window !== 'undefined' && (window as any).__lastLanguageToolError) {
        delete (window as any).__lastLanguageToolError;
      }
    }
  } catch (error) {
    // Capture error details for user notification
    if (error instanceof Error) {
      apiErrorMessage = error.message;
      
      // Store error in window for UI to display
      if (typeof window !== 'undefined') {
        (window as any).__lastLanguageToolError = {
          message: 'LanguageTool API is currently unavailable. Using offline grammar checking.',
          details: apiErrorMessage,
          timestamp: Date.now()
        };
      }
      
      console.error('LanguageTool API failed after retries:', apiErrorMessage);
    }
    languageToolSuccess = false;
  }

  // FALLBACK: Use offline academic grammar checker when LanguageTool API fails
  // Note: Offline checker has limited accuracy compared to LanguageTool API
  if (!languageToolSuccess) {
    console.warn('⚠️ Using offline grammar checker - accuracy may be reduced');
    console.warn('💡 Tip: Check your internet connection for better grammar checking');
    
    try {
      log('Using offline academic grammar checker...');
      const offlineSuggestions = checkAcademicGrammar(text);
      if (offlineSuggestions.length > 0) {
        log(`Offline checker found ${offlineSuggestions.length} issues`);
        allSuggestions.push(...offlineSuggestions);
      }
    } catch (error) {
      console.error('Offline grammar checking also failed:', error);
    }
  }

  // ENHANCED: Citation validation for research papers
  try {
    log('Validating citations...');
    const citationStyle = detectCitationStyle(text);
    if (citationStyle) {
      const citationSuggestions = validateAllCitations(text, citationStyle);
      if (citationSuggestions.length > 0) {
        log(`Found ${citationSuggestions.length} citation issues`);
        allSuggestions.push(...citationSuggestions);
      }
    }
  } catch (error) {
    if (DEBUG) console.error('Citation validation failed:', error);
  }

  // ENHANCED: Statistical notation validation
  try {
    log('Validating statistical notation...');
    const statsSuggestions = validateAllStatistics(text);
    if (statsSuggestions.length > 0) {
      log(`Found ${statsSuggestions.length} statistical notation issues`);
      allSuggestions.push(...statsSuggestions);
    }
  } catch (error) {
    if (DEBUG) console.error('Statistics validation failed:', error);
  }

  // ENHANCED: Academic structure validation (for longer documents)
  try {
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 500) { // Only check structure for substantial documents
      log('Validating document structure...');
      
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
        log(`Found ${totalStructure} structure issues`);
        allSuggestions.push(...structureSuggestions);
        allSuggestions.push(...hierarchySuggestions);
        allSuggestions.push(...numberingSuggestions);
        allSuggestions.push(...methodologySuggestions);
      }
    }
  } catch (error) {
    if (DEBUG) console.error('Structure validation failed:', error);
  }

  // ENHANCED: Field-specific terminology and methodology validation
  try {
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 200) { // Only for substantial documents
      log('Validating field-specific terminology...');
      const academicField = detectAcademicField(text);
      log(`Detected academic field: ${academicField}`);
      
      const fieldSuggestions = validateAllFieldSpecific(text, academicField);
      if (fieldSuggestions.length > 0) {
        log(`Found ${fieldSuggestions.length} field-specific issues`);
        allSuggestions.push(...fieldSuggestions);
      }
    }
  } catch (error) {
    if (DEBUG) console.error('Field-specific validation failed:', error);
  }

  // Sort by position
  allSuggestions.sort((a, b) => a.startOffset - b.startOffset);
  
  log(`Total suggestions found: ${allSuggestions.length}`);
  
  return allSuggestions;
}