/**
 * Enhanced Statistics Validator
 * Comprehensive validation for statistical notation, reporting, and terminology
 * Ensures APA 7th edition compliance for statistical reporting
 */

import type { Suggestion } from '../types';
import { getPositionFromOffset } from '../utils/textUtils';

export interface StatisticalTest {
  name: string;
  pattern: RegExp;
  requiredElements: string[];
  format: string;
}

/**
 * Common statistical tests and their reporting requirements
 */
const statisticalTests: StatisticalTest[] = [
  {
    name: 't-test',
    pattern: /t\s*\(\s*\d+\s*\)\s*=\s*-?[\d.]+/gi,
    requiredElements: ['t', 'df', 'p-value'],
    format: 't(df) = value, p = value',
  },
  {
    name: 'F-test',
    pattern: /F\s*\(\s*\d+\s*,\s*\d+\s*\)\s*=\s*[\d.]+/gi,
    requiredElements: ['F', 'df1', 'df2', 'p-value'],
    format: 'F(df1, df2) = value, p = value',
  },
  {
    name: 'chi-square',
    pattern: /χ²\s*\(\s*\d+\s*\)\s*=\s*[\d.]+|chi-square\s*\(\s*\d+\s*\)\s*=\s*[\d.]+/gi,
    requiredElements: ['χ²', 'df', 'p-value'],
    format: 'χ²(df) = value, p = value',
  },
  {
    name: 'correlation',
    pattern: /r\s*\(\s*\d+\s*\)\s*=\s*-?[\d.]+/gi,
    requiredElements: ['r', 'df', 'p-value'],
    format: 'r(df) = value, p = value',
  },
  {
    name: 'ANOVA',
    pattern: /F\s*\(\s*\d+\s*,\s*\d+\s*\)\s*=\s*[\d.]+/gi,
    requiredElements: ['F', 'df', 'p-value', 'effect size'],
    format: 'F(df1, df2) = value, p = value, η² = value',
  },
];

/**
 * Validate p-value reporting
 */
export function validatePValues(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Patterns for p-values
  const patterns = [
    // Correct: p = .001, p < .001, p > .05
    { pattern: /p\s*[=<>]\s*\.?\d+/gi, valid: true },
    // Incorrect: p=0.05 (should be p = .05)
    { pattern: /p\s*[=<>]\s*0\.(\d+)/gi, valid: false, correction: 'Use p = .${1} instead of p = 0.${1}' },
    // Incorrect: P (capital P)
    { pattern: /P\s*[=<>]/gi, valid: false, correction: 'Use lowercase "p" for p-values' },
    // Incorrect: p=.000 (should be p < .001)
    { pattern: /p\s*=\s*\.000\d*/gi, valid: false, correction: 'Report as p < .001 instead of p = .000' },
  ];
  
  for (const { pattern, valid, correction } of patterns) {
    let match;
    pattern.lastIndex = 0;
    
    while ((match = pattern.exec(text)) !== null) {
      if (!valid) {
        const pos = getPositionFromOffset(text, match.index);
        suggestions.push({
          id: `stats-pvalue-${match.index}`,
          type: 'grammar',
          severity: 'warning',
          message: `Incorrect p-value format: ${correction}`,
          original: match[0],
          suggestion: correction || 'Follow APA style for p-value reporting',
          startLine: pos.line,
          endLine: pos.line,
          startColumn: pos.column,
          endColumn: pos.column + match[0].length,
          startOffset: match.index,
          endOffset: match.index + match[0].length,
        });
      }
      
      // Check if p-value is within valid range (0 to 1)
      const valueMatch = match[0].match(/([=<>])\s*\.?(\d+\.?\d*)/);
      if (valueMatch) {
        const value = parseFloat('0.' + valueMatch[2].replace('.', ''));
        if (value > 1) {
          const pos = getPositionFromOffset(text, match.index);
          suggestions.push({
            id: `stats-pvalue-range-${match.index}`,
            type: 'grammar',
            severity: 'error',
            message: 'p-value must be between 0 and 1',
            original: match[0],
            suggestion: 'Check your statistical calculation',
            startLine: pos.line,
            endLine: pos.line,
            startColumn: pos.column,
            endColumn: pos.column + match[0].length,
            startOffset: match.index,
            endOffset: match.index + match[0].length,
          });
        }
      }
    }
  }
  
  return suggestions;
}

/**
 * Validate confidence interval reporting
 */
export function validateConfidenceIntervals(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Pattern: 95% CI [lower, upper]
  const ciPattern = /(\d+)%\s*CI\s*[\[(](-?[\d.]+)\s*,\s*(-?[\d.]+)[\])]/gi;
  
  let match;
  while ((match = ciPattern.exec(text)) !== null) {
    const confidence = parseInt(match[1]);
    const lower = parseFloat(match[2]);
    const upper = parseFloat(match[3]);
    
    // Check confidence level (should be 90%, 95%, or 99%)
    if (![90, 95, 99].includes(confidence)) {
      const pos = getPositionFromOffset(text, match.index);
      suggestions.push({
        id: `stats-ci-level-${match.index}`,
        type: 'style',
        severity: 'info',
        message: `Unusual confidence level: ${confidence}%. Standard levels are 90%, 95%, or 99%`,
        original: match[0],
        suggestion: 'Consider using a standard confidence level',
        startLine: pos.line,
        endLine: pos.line,
        startColumn: pos.column,
        endColumn: pos.column + match[0].length,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }
    
    // Check if lower bound is less than upper bound
    if (lower >= upper) {
      const pos = getPositionFromOffset(text, match.index);
      suggestions.push({
        id: `stats-ci-bounds-${match.index}`,
        type: 'grammar',
        severity: 'error',
        message: 'Confidence interval lower bound must be less than upper bound',
        original: match[0],
        suggestion: `Check the order: should be [${upper}, ${lower}] or verify calculations`,
        startLine: pos.line,
        endLine: pos.line,
        startColumn: pos.column,
        endColumn: pos.column + match[0].length,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }
  }
  
  return suggestions;
}

/**
 * Validate effect size reporting
 */
export function validateEffectSizes(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Common effect size measures
  const effectSizes = [
    { name: "Cohen's d", pattern: /d\s*=\s*-?[\d.]+/gi, range: { min: -Infinity, max: Infinity } },
    { name: 'eta-squared', pattern: /η²\s*=\s*[\d.]+|eta-squared\s*=\s*[\d.]+/gi, range: { min: 0, max: 1 } },
    { name: 'partial eta-squared', pattern: /ηp²\s*=\s*[\d.]+|partial\s+eta-squared\s*=\s*[\d.]+/gi, range: { min: 0, max: 1 } },
    { name: 'omega-squared', pattern: /ω²\s*=\s*[\d.]+|omega-squared\s*=\s*[\d.]+/gi, range: { min: 0, max: 1 } },
    { name: "Cramer's V", pattern: /V\s*=\s*[\d.]+|Cramer'?s?\s+V\s*=\s*[\d.]+/gi, range: { min: 0, max: 1 } },
  ];
  
  for (const effectSize of effectSizes) {
    let match;
    effectSize.pattern.lastIndex = 0;
    
    while ((match = effectSize.pattern.exec(text)) !== null) {
      const valueMatch = match[0].match(/=\s*(-?[\d.]+)/);
      if (valueMatch) {
        const value = parseFloat(valueMatch[1]);
        
        // Check if value is within valid range
        if (value < effectSize.range.min || value > effectSize.range.max) {
          const pos = getPositionFromOffset(text, match.index);
          suggestions.push({
            id: `stats-effect-size-range-${match.index}`,
            type: 'grammar',
            severity: 'error',
            message: `${effectSize.name} value must be between ${effectSize.range.min} and ${effectSize.range.max}`,
            original: match[0],
            suggestion: 'Verify your statistical calculations',
            startLine: pos.line,
            endLine: pos.line,
            startColumn: pos.column,
            endColumn: pos.column + match[0].length,
            startOffset: match.index,
            endOffset: match.index + match[0].length,
          });
        }
      }
    }
  }
  
  return suggestions;
}

/**
 * Validate sample size reporting
 */
export function validateSampleSize(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Pattern: N = 100, n = 50
  const samplePattern = /([Nn])\s*=\s*(\d+)/g;
  
  let match;
  while ((match = samplePattern.exec(text)) !== null) {
    const letter = match[1];
    const size = parseInt(match[2]);
    
    // Check for very small sample sizes
    if (size < 30 && letter === 'N') {
      const pos = getPositionFromOffset(text, match.index);
      suggestions.push({
        id: `stats-sample-small-${match.index}`,
        type: 'style',
        severity: 'info',
        message: `Small sample size (N = ${size}). Consider discussing limitations`,
        original: match[0],
        suggestion: 'Small sample sizes may affect statistical power and generalizability',
        startLine: pos.line,
        endLine: pos.line,
        startColumn: pos.column,
        endColumn: pos.column + match[0].length,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }
    
    // APA style: Use capital N for total sample, lowercase n for subsample
    const surroundingText = text.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50).toLowerCase();
    const isSubsample = surroundingText.includes('group') || surroundingText.includes('condition') || surroundingText.includes('subsample');
    
    if (isSubsample && letter === 'N') {
      const pos = getPositionFromOffset(text, match.index);
      suggestions.push({
        id: `stats-sample-notation-${match.index}`,
        type: 'style',
        severity: 'info',
        message: 'Use lowercase "n" for subsamples or groups',
        original: match[0],
        suggestion: match[0].replace('N', 'n'),
        startLine: pos.line,
        endLine: pos.line,
        startColumn: pos.column,
        endColumn: pos.column + match[0].length,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }
  }
  
  return suggestions;
}

/**
 * Validate statistical test reporting completeness
 */
export function validateStatisticalTests(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  for (const test of statisticalTests) {
    let match;
    test.pattern.lastIndex = 0;
    
    while ((match = test.pattern.exec(text)) !== null) {
      // Extract surrounding text to check for required elements
      const contextStart = Math.max(0, match.index - 100);
      const contextEnd = Math.min(text.length, match.index + match[0].length + 100);
      const context = text.substring(contextStart, contextEnd);
      
      // Check for p-value in the same context
      if (!context.match(/p\s*[=<>]\s*\.?\d+/i)) {
        const pos = getPositionFromOffset(text, match.index);
        suggestions.push({
          id: `stats-test-incomplete-${match.index}`,
          type: 'style',
          severity: 'warning',
          message: `${test.name} reported without p-value`,
          original: match[0],
          suggestion: `Include p-value: ${test.format}`,
          startLine: pos.line,
          endLine: pos.line,
          startColumn: pos.column,
          endColumn: pos.column + match[0].length,
          startOffset: match.index,
          endOffset: match.index + match[0].length,
        });
      }
      
      // Check for effect size (especially important for ANOVAs)
      if (test.name === 'ANOVA' && !context.match(/η²|eta-squared|ω²|omega-squared/i)) {
        const pos = getPositionFromOffset(text, match.index);
        suggestions.push({
          id: `stats-anova-effect-${match.index}`,
          type: 'style',
          severity: 'info',
          message: 'Consider reporting effect size for ANOVA (e.g., η² or ω²)',
          original: match[0],
          suggestion: 'APA recommends reporting effect sizes for all inferential tests',
          startLine: pos.line,
          endLine: pos.line,
          startColumn: pos.column,
          endColumn: pos.column + match[0].length,
          startOffset: match.index,
          endOffset: match.index + match[0].length,
        });
      }
    }
  }
  
  return suggestions;
}

/**
 * Validate descriptive statistics format
 */
export function validateDescriptiveStats(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Pattern: M = 5.23, SD = 1.45
  const descPattern = /([MS]D?|SE)\s*=\s*([\d.]+)/gi;
  
  let match;
  while ((match = descPattern.exec(text)) !== null) {
    const statistic = match[1].toUpperCase();
    const value = parseFloat(match[2]);
    
    // Check for incorrect notation
    const incorrectNotations = [
      { wrong: /Mean\s*=/, correct: 'M =', message: 'Use "M" instead of "Mean"' },
      { wrong: /Std\.?\s*Dev\.?\s*=/, correct: 'SD =', message: 'Use "SD" instead of "Std. Dev."' },
      { wrong: /Standard\s*Error\s*=/, correct: 'SE =', message: 'Use "SE" instead of "Standard Error"' },
    ];
    
    const contextStart = Math.max(0, match.index - 20);
    const contextEnd = Math.min(text.length, match.index + match[0].length);
    const context = text.substring(contextStart, contextEnd);
    
    for (const notation of incorrectNotations) {
      if (notation.wrong.test(context)) {
        const pos = getPositionFromOffset(text, match.index);
        suggestions.push({
          id: `stats-desc-notation-${match.index}`,
          type: 'style',
          severity: 'info',
          message: notation.message,
          original: match[0],
          suggestion: notation.correct,
          startLine: pos.line,
          endLine: pos.line,
          startColumn: pos.column,
          endColumn: pos.column + match[0].length,
          startOffset: match.index,
          endOffset: match.index + match[0].length,
        });
      }
    }
    
    // Check for negative SD (should not happen)
    if (statistic === 'SD' && value < 0) {
      const pos = getPositionFromOffset(text, match.index);
      suggestions.push({
        id: `stats-sd-negative-${match.index}`,
        type: 'grammar',
        severity: 'error',
        message: 'Standard deviation cannot be negative',
        original: match[0],
        suggestion: 'Check your calculations',
        startLine: pos.line,
        endLine: pos.line,
        startColumn: pos.column,
        endColumn: pos.column + match[0].length,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }
  }
  
  return suggestions;
}

/**
 * Validate significant figures and rounding
 */
export function validateSignificantFigures(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Check p-values (should have 2-3 decimal places)
  const pValuePattern = /p\s*[=<>]\s*\.(\d+)/gi;
  let match;
  
  while ((match = pValuePattern.exec(text)) !== null) {
    const decimals = match[1].length;
    
    if (decimals > 3) {
      const pos = getPositionFromOffset(text, match.index);
      suggestions.push({
        id: `stats-pvalue-decimals-${match.index}`,
        type: 'style',
        severity: 'info',
        message: 'p-values should be reported to 2-3 decimal places',
        original: match[0],
        suggestion: `Round to: p ${match[0].includes('<') ? '<' : '='} .${match[1].substring(0, 3)}`,
        startLine: pos.line,
        endLine: pos.line,
        startColumn: pos.column,
        endColumn: pos.column + match[0].length,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }
  }
  
  // Check other statistics (should have 2 decimal places)
  const statsPattern = /([trFχ]|M|SD)\s*=\s*(-?[\d.]+)/gi;
  
  while ((match = statsPattern.exec(text)) !== null) {
    const value = match[2];
    const decimalMatch = value.match(/\.(\d+)/);
    
    if (decimalMatch && decimalMatch[1].length > 2) {
      const pos = getPositionFromOffset(text, match.index);
      suggestions.push({
        id: `stats-decimals-${match.index}`,
        type: 'style',
        severity: 'info',
        message: 'Statistics should typically be reported to 2 decimal places',
        original: match[0],
        suggestion: `Round to: ${match[1]} = ${parseFloat(value).toFixed(2)}`,
        startLine: pos.line,
        endLine: pos.line,
        startColumn: pos.column,
        endColumn: pos.column + match[0].length,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }
  }
  
  return suggestions;
}

/**
 * Validate all statistical notation
 */
export function validateAllStatistics(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  suggestions.push(...validatePValues(text));
  suggestions.push(...validateConfidenceIntervals(text));
  suggestions.push(...validateEffectSizes(text));
  suggestions.push(...validateSampleSize(text));
  suggestions.push(...validateStatisticalTests(text));
  suggestions.push(...validateDescriptiveStats(text));
  suggestions.push(...validateSignificantFigures(text));
  
  return suggestions;
}
