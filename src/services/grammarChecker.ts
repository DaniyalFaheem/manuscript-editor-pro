import type { Suggestion } from '../types';
import { generateId, getPositionFromOffset } from '../utils/textUtils';

interface GrammarRule {
  pattern: RegExp;
  message: string;
  suggestion?: (match: string) => string;
  type: 'grammar' | 'punctuation';
  severity: 'error' | 'warning';
}

const grammarRules: GrammarRule[] = [
  // Common grammar mistakes
  {
    pattern: /\btheir\s+are\b/gi,
    message: 'Incorrect usage. Did you mean "there are" or "they are"?',
    suggestion: () => 'there are',
    type: 'grammar',
    severity: 'error',
  },
  {
    pattern: /\btheir\s+is\b/gi,
    message: 'Incorrect usage. Did you mean "there is"?',
    suggestion: () => 'there is',
    type: 'grammar',
    severity: 'error',
  },
  {
    pattern: /\bits\s+a\b/gi,
    message: 'Incorrect usage. Did you mean "it\'s a" (it is a)?',
    suggestion: () => "it's a",
    type: 'grammar',
    severity: 'error',
  },
  {
    pattern: /\bcould\s+of\b/gi,
    message: 'Incorrect. Use "could have" or "could\'ve"',
    suggestion: () => 'could have',
    type: 'grammar',
    severity: 'error',
  },
  {
    pattern: /\bwould\s+of\b/gi,
    message: 'Incorrect. Use "would have" or "would\'ve"',
    suggestion: () => 'would have',
    type: 'grammar',
    severity: 'error',
  },
  {
    pattern: /\bshould\s+of\b/gi,
    message: 'Incorrect. Use "should have" or "should\'ve"',
    suggestion: () => 'should have',
    type: 'grammar',
    severity: 'error',
  },
  
  // Punctuation rules
  {
    pattern: /\s{2,}/g,
    message: 'Multiple spaces detected',
    suggestion: () => ' ',
    type: 'punctuation',
    severity: 'warning',
  },
  {
    pattern: /\s+([.,!?;:])/g,
    message: 'Space before punctuation',
    suggestion: (match) => match.trim(),
    type: 'punctuation',
    severity: 'warning',
  },
  {
    pattern: /([.!?])[a-zA-Z]/g,
    message: 'Missing space after punctuation',
    suggestion: (match) => `${match[0]} ${match[1]}`,
    type: 'punctuation',
    severity: 'warning',
  },
  {
    pattern: /,,+/g,
    message: 'Repeated comma',
    suggestion: () => ',',
    type: 'punctuation',
    severity: 'error',
  },
  {
    pattern: /\.\.+/g,
    message: 'Repeated period. Use ellipsis (...) if intended.',
    suggestion: () => '.',
    type: 'punctuation',
    severity: 'warning',
  },
];

/**
 * Check text for grammar and punctuation issues
 */
export function checkGrammar(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];

  grammarRules.forEach(rule => {
    let match;
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);

    while ((match = regex.exec(text)) !== null) {
      const startOffset = match.index;
      const endOffset = startOffset + match[0].length;
      const startPos = getPositionFromOffset(text, startOffset);
      const endPos = getPositionFromOffset(text, endOffset);

      suggestions.push({
        id: generateId(),
        type: rule.type,
        severity: rule.severity,
        message: rule.message,
        original: match[0],
        suggestion: rule.suggestion ? rule.suggestion(match[0]) : '',
        startLine: startPos.line,
        endLine: endPos.line,
        startColumn: startPos.column,
        endColumn: endPos.column,
        startOffset,
        endOffset,
      });
    }
  });

  return suggestions;
}

/**
 * Check for repeated words
 */
export function checkRepeatedWords(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const pattern = /\b(\w+)\s+\1\b/gi;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const startOffset = match.index;
    const endOffset = startOffset + match[0].length;
    const startPos = getPositionFromOffset(text, startOffset);
    const endPos = getPositionFromOffset(text, endOffset);

    suggestions.push({
      id: generateId(),
      type: 'grammar',
      severity: 'warning',
      message: `Repeated word: "${match[1]}"`,
      original: match[0],
      suggestion: match[1],
      startLine: startPos.line,
      endLine: endPos.line,
      startColumn: startPos.column,
      endColumn: endPos.column,
      startOffset,
      endOffset,
    });
  }

  return suggestions;
}
