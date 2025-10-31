/**
 * Advanced Pattern Matcher for Efficient Grammar Checking
 * Optimized for handling 2000+ regex patterns efficiently
 */

import type { AcademicGrammarRule, RuleMatch, RuleContext } from '../types/academicRules';

/**
 * Compiled rule cache for performance
 */
interface CompiledRule {
  rule: AcademicGrammarRule;
  regex: RegExp;
}

let compiledRulesCache: CompiledRule[] | null = null;

/**
 * Compile and cache all rules
 */
export function compileRules(rules: AcademicGrammarRule[]): CompiledRule[] {
  if (compiledRulesCache && compiledRulesCache.length === rules.length) {
    return compiledRulesCache;
  }

  compiledRulesCache = rules.map(rule => ({
    rule,
    regex: new RegExp(rule.pattern.source, rule.pattern.flags)
  }));

  return compiledRulesCache;
}

/**
 * Clear rule cache (useful for testing or rule updates)
 */
export function clearRuleCache(): void {
  compiledRulesCache = null;
}

/**
 * Apply a single rule to text
 */
export function applyRule(
  rule: AcademicGrammarRule,
  text: string,
  context?: RuleContext
): RuleMatch[] {
  const matches: RuleMatch[] = [];
  const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
  
  let match: RegExpExecArray | null;
  
  while ((match = regex.exec(text)) !== null) {
    const startOffset = match.index;
    const endOffset = startOffset + match[0].length;
    
    // Apply context filter if provided
    if (context && rule.contextFilter && !rule.contextFilter(context, match)) {
      continue;
    }
    
    // Generate suggestions
    let suggestions: string[] = [];
    if (rule.suggestion) {
      const result = rule.suggestion(match, context);
      suggestions = Array.isArray(result) ? result : [result];
    }
    
    matches.push({
      ruleId: rule.id,
      startOffset,
      endOffset,
      original: match[0],
      message: rule.message,
      suggestions,
      type: rule.type,
      severity: rule.severity,
      category: rule.category,
      explanation: rule.explanation
    });
  }
  
  return matches;
}

/**
 * Apply multiple rules to text efficiently
 */
export function applyRules(
  rules: AcademicGrammarRule[],
  text: string,
  createContextFn?: (text: string, offset: number) => RuleContext
): RuleMatch[] {
  const allMatches: RuleMatch[] = [];
  const compiledRules = compileRules(rules);
  
  for (const compiled of compiledRules) {
    const regex = compiled.regex;
    let match: RegExpExecArray | null;
    
    while ((match = regex.exec(text)) !== null) {
      const startOffset = match.index;
      const endOffset = startOffset + match[0].length;
      
      // Create context if function provided
      const context = createContextFn ? createContextFn(text, startOffset) : undefined;
      
      // Apply context filter if provided
      if (context && compiled.rule.contextFilter && !compiled.rule.contextFilter(context, match)) {
        continue;
      }
      
      // Generate suggestions
      let suggestions: string[] = [];
      if (compiled.rule.suggestion) {
        const result = compiled.rule.suggestion(match, context);
        suggestions = Array.isArray(result) ? result : [result];
      }
      
      allMatches.push({
        ruleId: compiled.rule.id,
        startOffset,
        endOffset,
        original: match[0],
        message: compiled.rule.message,
        suggestions,
        type: compiled.rule.type,
        severity: compiled.rule.severity,
        category: compiled.rule.category,
        explanation: compiled.rule.explanation
      });
    }
  }
  
  return allMatches;
}

/**
 * Apply rules to text in chunks for better performance with large documents
 */
export function applyRulesInChunks(
  rules: AcademicGrammarRule[],
  text: string,
  chunkSize: number = 5000,
  overlap: number = 200,
  createContextFn?: (text: string, offset: number) => RuleContext
): RuleMatch[] {
  if (text.length <= chunkSize) {
    return applyRules(rules, text, createContextFn);
  }
  
  const allMatches: RuleMatch[] = [];
  let position = 0;
  
  while (position < text.length) {
    const end = Math.min(position + chunkSize, text.length);
    const chunk = text.substring(position, end + overlap);
    
    const chunkMatches = applyRules(rules, chunk, 
      createContextFn ? (_t, o) => createContextFn(text, position + o) : undefined
    );
    
    // Adjust offsets and filter duplicates in overlap region
    for (const match of chunkMatches) {
      const adjustedStart = position + match.startOffset;
      const adjustedEnd = position + match.endOffset;
      
      // Skip if match is in overlap region and we already have it
      if (adjustedStart < position + chunkSize || position === 0) {
        const isDuplicate = allMatches.some(m => 
          m.startOffset === adjustedStart && m.endOffset === adjustedEnd
        );
        
        if (!isDuplicate) {
          allMatches.push({
            ...match,
            startOffset: adjustedStart,
            endOffset: adjustedEnd
          });
        }
      }
    }
    
    position += chunkSize;
  }
  
  return allMatches;
}

/**
 * Filter overlapping matches (keep highest severity)
 */
export function filterOverlappingMatches(matches: RuleMatch[]): RuleMatch[] {
  if (matches.length === 0) return matches;
  
  // Sort by position and then by severity
  const severityOrder = { error: 0, warning: 1, info: 2 };
  const sorted = [...matches].sort((a, b) => {
    if (a.startOffset !== b.startOffset) {
      return a.startOffset - b.startOffset;
    }
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
  
  const filtered: RuleMatch[] = [];
  let lastEnd = -1;
  
  for (const match of sorted) {
    // If this match doesn't overlap with the last one, add it
    if (match.startOffset >= lastEnd) {
      filtered.push(match);
      lastEnd = match.endOffset;
    } else {
      // Overlapping - only add if higher severity
      const lastMatch = filtered[filtered.length - 1];
      if (severityOrder[match.severity] < severityOrder[lastMatch.severity]) {
        filtered[filtered.length - 1] = match;
        lastEnd = match.endOffset;
      }
    }
  }
  
  return filtered;
}

/**
 * Sort matches by position
 */
export function sortMatches(matches: RuleMatch[]): RuleMatch[] {
  return [...matches].sort((a, b) => {
    if (a.startOffset !== b.startOffset) {
      return a.startOffset - b.startOffset;
    }
    return a.endOffset - b.endOffset;
  });
}

/**
 * Filter matches by type
 */
export function filterMatchesByType(
  matches: RuleMatch[],
  types: ('grammar' | 'punctuation' | 'style' | 'spelling')[]
): RuleMatch[] {
  return matches.filter(match => types.includes(match.type));
}

/**
 * Filter matches by severity
 */
export function filterMatchesBySeverity(
  matches: RuleMatch[],
  severities: ('error' | 'warning' | 'info')[]
): RuleMatch[] {
  return matches.filter(match => severities.includes(match.severity));
}

/**
 * Get match statistics
 */
export function getMatchStatistics(matches: RuleMatch[]): {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
} {
  const stats = {
    total: matches.length,
    byType: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
    byCategory: {} as Record<string, number>
  };
  
  for (const match of matches) {
    stats.byType[match.type] = (stats.byType[match.type] || 0) + 1;
    stats.bySeverity[match.severity] = (stats.bySeverity[match.severity] || 0) + 1;
    stats.byCategory[match.category] = (stats.byCategory[match.category] || 0) + 1;
  }
  
  return stats;
}

/**
 * Performance timer for benchmarking
 * Note: Only logs in development mode
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  // Only log in development mode
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }
  
  return { result, duration };
}
