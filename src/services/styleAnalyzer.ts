import type { Suggestion } from '../types';
import { generateId, getPositionFromOffset, splitIntoSentences } from '../utils/textUtils';

interface StyleRule {
  pattern: RegExp;
  message: string;
  suggestion?: (match: string) => string;
  severity: 'warning' | 'info';
}

const styleRules: StyleRule[] = [
  // Passive voice
  {
    pattern: /\b(is|are|was|were|been|be|being)\s+\w+ed\b/gi,
    message: 'Possible passive voice. Consider using active voice.',
    severity: 'info',
  },
  {
    pattern: /\b(is|are|was|were|been|be|being)\s+\w+en\b/gi,
    message: 'Possible passive voice. Consider using active voice.',
    severity: 'info',
  },
  
  // Wordiness
  {
    pattern: /\bin\s+order\s+to\b/gi,
    message: 'Wordy phrase. Consider using "to"',
    suggestion: () => 'to',
    severity: 'info',
  },
  {
    pattern: /\bdue\s+to\s+the\s+fact\s+that\b/gi,
    message: 'Wordy phrase. Consider using "because"',
    suggestion: () => 'because',
    severity: 'info',
  },
  {
    pattern: /\bin\s+spite\s+of\s+the\s+fact\s+that\b/gi,
    message: 'Wordy phrase. Consider using "although"',
    suggestion: () => 'although',
    severity: 'info',
  },
  {
    pattern: /\bat\s+the\s+present\s+time\b/gi,
    message: 'Wordy phrase. Consider using "now" or "currently"',
    suggestion: () => 'now',
    severity: 'info',
  },
  {
    pattern: /\bfor\s+the\s+purpose\s+of\b/gi,
    message: 'Wordy phrase. Consider using "to" or "for"',
    suggestion: () => 'to',
    severity: 'info',
  },
  
  // Hedge words
  {
    pattern: /\b(possibly|maybe|perhaps|somewhat|quite|rather)\b/gi,
    message: 'Hedge word detected. Consider being more direct.',
    severity: 'info',
  },
  
  // Weak verbs
  {
    pattern: /\b(very|really|quite|rather|somewhat)\s+\w+/gi,
    message: 'Weak intensifier. Consider using a stronger word.',
    severity: 'info',
  },
  
  // Informal language
  {
    pattern: /\b(a lot of|lots of)\b/gi,
    message: 'Informal phrase. Consider using "many" or "much"',
    suggestion: () => 'many',
    severity: 'warning',
  },
  {
    pattern: /\bgonna\b/gi,
    message: 'Informal. Use "going to"',
    suggestion: () => 'going to',
    severity: 'warning',
  },
  {
    pattern: /\bwanna\b/gi,
    message: 'Informal. Use "want to"',
    suggestion: () => 'want to',
    severity: 'warning',
  },
  {
    pattern: /\bkinda\b/gi,
    message: 'Informal. Use "kind of"',
    suggestion: () => 'kind of',
    severity: 'warning',
  },
];

/**
 * Analyze text for style issues
 */
export function analyzeStyle(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];

  styleRules.forEach(rule => {
    let match;
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);

    while ((match = regex.exec(text)) !== null) {
      const startOffset = match.index;
      const endOffset = startOffset + match[0].length;
      const startPos = getPositionFromOffset(text, startOffset);
      const endPos = getPositionFromOffset(text, endOffset);

      suggestions.push({
        id: generateId(),
        type: 'style',
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
 * Check for overly long sentences (>40 words)
 */
export function checkSentenceLength(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const sentences = splitIntoSentences(text);
  
  let currentOffset = 0;

  sentences.forEach(sentence => {
    const words = sentence.split(/\s+/).filter(w => w.length > 0);
    
    if (words.length > 40) {
      const startOffset = text.indexOf(sentence, currentOffset);
      const endOffset = startOffset + sentence.length;
      const startPos = getPositionFromOffset(text, startOffset);
      const endPos = getPositionFromOffset(text, endOffset);

      suggestions.push({
        id: generateId(),
        type: 'style',
        severity: 'info',
        message: `Long sentence (${words.length} words). Consider breaking it up.`,
        original: sentence,
        suggestion: '',
        startLine: startPos.line,
        endLine: endPos.line,
        startColumn: startPos.column,
        endColumn: endPos.column,
        startOffset,
        endOffset,
      });
    }

    currentOffset = text.indexOf(sentence, currentOffset) + sentence.length;
  });

  return suggestions;
}
