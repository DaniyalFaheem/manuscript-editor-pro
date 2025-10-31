/**
 * Offline Academic Grammar Checker
 * Complete 2000+ rule grammar checking system for academic writing
 * 100% offline, no API required
 */

import type { Suggestion } from '../types';
import type { RuleMatch } from '../types/academicRules';
import { allAcademicRules, rulesByCategory, TOTAL_RULES } from './academicGrammarRules';
import {
  applyRulesInChunks,
  filterOverlappingMatches,
  sortMatches,
  filterMatchesByType,
  filterMatchesBySeverity,
  getMatchStatistics
} from './advancedPatternMatcher';
import { createRuleContext } from './contextAnalyzer';
import { getPositionFromOffset } from '../utils/textUtils';

/**
 * Configuration options for the offline checker
 */
export interface OfflineCheckerConfig {
  enabledCategories?: ('grammar' | 'academic-tone' | 'citation' | 'punctuation' | 'wordiness' | 'spelling')[];
  enabledTypes?: ('grammar' | 'punctuation' | 'style' | 'spelling')[];
  enabledSeverities?: ('error' | 'warning' | 'info')[];
  maxSuggestions?: number;
  removeOverlapping?: boolean;
  chunkSize?: number;
}

/**
 * Default configuration
 */
const defaultConfig: Required<OfflineCheckerConfig> = {
  enabledCategories: ['grammar', 'academic-tone', 'citation', 'punctuation', 'wordiness', 'spelling'],
  enabledTypes: ['grammar', 'punctuation', 'style', 'spelling'],
  enabledSeverities: ['error', 'warning', 'info'],
  maxSuggestions: 1000,
  removeOverlapping: true,
  chunkSize: 5000
};

/**
 * Main offline academic grammar checking function
 */
export function checkAcademicGrammar(
  text: string,
  config: OfflineCheckerConfig = {}
): Suggestion[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const mergedConfig = { ...defaultConfig, ...config };
  
  // Select rules based on enabled categories
  const rules = selectRules(mergedConfig.enabledCategories);
  
  // Apply rules with context awareness
  const matches = applyRulesInChunks(
    rules,
    text,
    mergedConfig.chunkSize,
    200,
    (t, offset) => createRuleContext(t, offset)
  );
  
  // Filter overlapping matches
  const filteredMatches = mergedConfig.removeOverlapping 
    ? filterOverlappingMatches(matches)
    : matches;
  
  // Sort by position
  const sortedMatches = sortMatches(filteredMatches);
  
  // Filter by type
  const typeFiltered = filterMatchesByType(sortedMatches, mergedConfig.enabledTypes);
  
  // Filter by severity
  const severityFiltered = filterMatchesBySeverity(typeFiltered, mergedConfig.enabledSeverities);
  
  // Limit number of suggestions
  const limitedMatches = severityFiltered.slice(0, mergedConfig.maxSuggestions);
  
  // Convert to Suggestion format
  return convertMatchesToSuggestions(text, limitedMatches);
}

/**
 * Select rules based on enabled categories
 */
function selectRules(
  enabledCategories: ('grammar' | 'academic-tone' | 'citation' | 'punctuation' | 'wordiness' | 'spelling')[]
): typeof allAcademicRules {
  const selected = [];
  
  for (const category of enabledCategories) {
    switch (category) {
      case 'grammar':
        selected.push(...rulesByCategory.grammar);
        break;
      case 'academic-tone':
        selected.push(...rulesByCategory.academicTone);
        break;
      case 'citation':
        selected.push(...rulesByCategory.citation);
        break;
      case 'punctuation':
        selected.push(...rulesByCategory.punctuation);
        break;
      case 'wordiness':
        selected.push(...rulesByCategory.wordiness);
        break;
      case 'spelling':
        selected.push(...rulesByCategory.spelling);
        break;
    }
  }
  
  return selected;
}

/**
 * Convert RuleMatch to Suggestion format
 */
function convertMatchesToSuggestions(text: string, matches: RuleMatch[]): Suggestion[] {
  return matches.map(match => {
    const startPos = getPositionFromOffset(text, match.startOffset);
    const endPos = getPositionFromOffset(text, match.endOffset);
    
    // Use first suggestion or empty string
    const suggestion = match.suggestions.length > 0 ? match.suggestions[0] : '';
    
    return {
      id: `offline-${match.ruleId}-${match.startOffset}`,
      type: match.type,
      severity: match.severity,
      message: match.message,
      original: match.original,
      suggestion,
      startLine: startPos.line,
      endLine: endPos.line,
      startColumn: startPos.column,
      endColumn: endPos.column,
      startOffset: match.startOffset,
      endOffset: match.endOffset
    };
  });
}

/**
 * Check specific text segment with given rules
 */
export function checkSegment(
  text: string,
  startOffset: number,
  endOffset: number,
  config: OfflineCheckerConfig = {}
): Suggestion[] {
  const segment = text.substring(startOffset, endOffset);
  const suggestions = checkAcademicGrammar(segment, config);
  
  // Adjust offsets
  return suggestions.map(s => ({
    ...s,
    startOffset: s.startOffset + startOffset,
    endOffset: s.endOffset + startOffset
  }));
}

/**
 * Get statistics about the checking results
 */
export function getCheckingStatistics(text: string, config: OfflineCheckerConfig = {}): {
  rulesApplied: number;
  totalMatches: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
  averageMatchesPerWord: number;
} {
  const mergedConfig = { ...defaultConfig, ...config };
  const rules = selectRules(mergedConfig.enabledCategories);
  
  const matches = applyRulesInChunks(
    rules,
    text,
    mergedConfig.chunkSize,
    200,
    (t, offset) => createRuleContext(t, offset)
  );
  
  const stats = getMatchStatistics(matches);
  const wordCount = text.trim().split(/\s+/).length;
  
  return {
    rulesApplied: rules.length,
    totalMatches: stats.total,
    byType: stats.byType,
    bySeverity: stats.bySeverity,
    byCategory: stats.byCategory,
    averageMatchesPerWord: wordCount > 0 ? stats.total / wordCount : 0
  };
}

/**
 * Quick check for errors only (faster)
 */
export function checkErrorsOnly(text: string): Suggestion[] {
  return checkAcademicGrammar(text, {
    enabledSeverities: ['error']
  });
}

/**
 * Check for specific issue types
 */
export function checkGrammarOnly(text: string): Suggestion[] {
  return checkAcademicGrammar(text, {
    enabledCategories: ['grammar', 'spelling'],
    enabledTypes: ['grammar', 'spelling']
  });
}

export function checkStyleOnly(text: string): Suggestion[] {
  return checkAcademicGrammar(text, {
    enabledCategories: ['academic-tone', 'wordiness'],
    enabledTypes: ['style']
  });
}

export function checkPunctuationOnly(text: string): Suggestion[] {
  return checkAcademicGrammar(text, {
    enabledCategories: ['punctuation'],
    enabledTypes: ['punctuation']
  });
}

export function checkCitationsOnly(text: string): Suggestion[] {
  return checkAcademicGrammar(text, {
    enabledCategories: ['citation']
  });
}

/**
 * Batch check multiple texts
 */
export function batchCheck(
  texts: string[],
  config: OfflineCheckerConfig = {}
): Suggestion[][] {
  return texts.map(text => checkAcademicGrammar(text, config));
}

/**
 * Get checker information
 */
export function getCheckerInfo(): {
  totalRules: number;
  version: string;
  capabilities: string[];
  categories: string[];
  offline: boolean;
} {
  return {
    totalRules: TOTAL_RULES,
    version: '1.0.0',
    capabilities: [
      'Fundamental Grammar (400+ rules)',
      'Academic Tone & Formality (350+ rules)',
      'Citation & Methodology (250+ rules)',
      'Advanced Punctuation (400+ rules)',
      'Wordiness & Redundancy (300+ rules)',
      'Academic Spelling (300+ rules)'
    ],
    categories: ['grammar', 'academic-tone', 'citation', 'punctuation', 'wordiness', 'spelling'],
    offline: true
  };
}

/**
 * Benchmark checker performance
 */
export function benchmarkChecker(text: string): {
  duration: number;
  wordsPerSecond: number;
  rulesPerSecond: number;
} {
  const start = performance.now();
  checkAcademicGrammar(text);
  const duration = performance.now() - start;
  
  const wordCount = text.trim().split(/\s+/).length;
  const wordsPerSecond = (wordCount / duration) * 1000;
  const rulesPerSecond = (TOTAL_RULES / duration) * 1000;
  
  return {
    duration,
    wordsPerSecond,
    rulesPerSecond
  };
}

/**
 * Export for testing and utilities
 */
export { TOTAL_RULES };
