/**
 * Context Analyzer for Academic Grammar Checking
 * Provides sentence and paragraph boundary detection for context-aware analysis
 */

import type { RuleContext } from '../types/academicRules';

/**
 * Split text into sentences using academic writing patterns
 */
export function splitIntoSentences(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Replace common abbreviations to avoid false sentence breaks
  const processed = text
    .replace(/\be\.g\./gi, 'e_g_')
    .replace(/\bi\.e\./gi, 'i_e_')
    .replace(/\bet\s+al\./gi, 'et_al_')
    .replace(/\bDr\./gi, 'Dr_')
    .replace(/\bMr\./gi, 'Mr_')
    .replace(/\bMrs\./gi, 'Mrs_')
    .replace(/\bMs\./gi, 'Ms_')
    .replace(/\bProf\./gi, 'Prof_')
    .replace(/\bvs\./gi, 'vs_')
    .replace(/\bFig\./gi, 'Fig_')
    .replace(/\bp\.\s*</gi, 'p_<');

  // Split on sentence-ending punctuation followed by space and capital letter
  const sentences = processed.split(/([.!?]+\s+)(?=[A-Z])/);
  
  // Reconstruct sentences and restore abbreviations
  const result: string[] = [];
  let current = '';
  
  for (let i = 0; i < sentences.length; i++) {
    current += sentences[i];
    
    // If this is a sentence ending, save it
    if (i < sentences.length - 1 && /[.!?]+\s+$/.test(current)) {
      result.push(restoreAbbreviations(current.trim()));
      current = '';
    }
  }
  
  // Add remaining text as final sentence
  if (current.trim()) {
    result.push(restoreAbbreviations(current.trim()));
  }
  
  return result.filter(s => s.length > 0);
}

/**
 * Restore abbreviations after sentence splitting
 */
function restoreAbbreviations(text: string): string {
  return text
    .replace(/e_g_/g, 'e.g.')
    .replace(/i_e_/g, 'i.e.')
    .replace(/et_al_/g, 'et al.')
    .replace(/Dr_/g, 'Dr.')
    .replace(/Mr_/g, 'Mr.')
    .replace(/Mrs_/g, 'Mrs.')
    .replace(/Ms_/g, 'Ms.')
    .replace(/Prof_/g, 'Prof.')
    .replace(/vs_/g, 'vs.')
    .replace(/Fig_/g, 'Fig.')
    .replace(/p_</g, 'p.<');
}

/**
 * Split text into paragraphs
 */
export function splitIntoParagraphs(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Split on double line breaks or more
  return text
    .split(/\n\s*\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

/**
 * Get sentence boundaries for a given offset
 */
export function getSentenceBoundaries(text: string, offset: number): { start: number; end: number } {
  const sentences = splitIntoSentences(text);
  let currentOffset = 0;
  
  for (const sentence of sentences) {
    // Find sentence starting from current position to avoid duplicates
    let start = text.indexOf(sentence, currentOffset);
    
    // If not found from current position, we may have skipped whitespace
    if (start === -1 || start < currentOffset) {
      // Try to find near current offset with some tolerance
      const searchStart = Math.max(0, currentOffset - 10);
      start = text.indexOf(sentence, searchStart);
    }
    
    if (start === -1) {
      // Fallback: continue to next sentence
      continue;
    }
    
    const end = start + sentence.length;
    
    if (offset >= start && offset < end) {
      return { start, end };
    }
    
    // Move past this sentence for next iteration
    currentOffset = end;
  }
  
  // If not found, return the whole text
  return { start: 0, end: text.length };
}

/**
 * Get paragraph boundaries for a given offset
 */
export function getParagraphBoundaries(text: string, offset: number): { start: number; end: number } {
  const paragraphs = splitIntoParagraphs(text);
  let currentOffset = 0;
  
  for (const paragraph of paragraphs) {
    // Find paragraph starting from current position
    let start = text.indexOf(paragraph, currentOffset);
    
    // If not found from current position, try with some tolerance
    if (start === -1 || start < currentOffset) {
      const searchStart = Math.max(0, currentOffset - 10);
      start = text.indexOf(paragraph, searchStart);
    }
    
    if (start === -1) {
      continue;
    }
    
    const end = start + paragraph.length;
    
    if (offset >= start && offset < end) {
      return { start, end };
    }
    
    // Move past this paragraph for next iteration
    currentOffset = end;
  }
  
  // If not found, return the whole text
  return { start: 0, end: text.length };
}

/**
 * Detect section type based on keywords (heuristic)
 */
export function detectSectionType(text: string, offset: number): RuleContext['sectionType'] | undefined {
  const paragraphBounds = getParagraphBoundaries(text, offset);
  const paragraph = text.substring(paragraphBounds.start, paragraphBounds.end);
  
  // Look for section headers in current or previous paragraph
  const lookbackStart = Math.max(0, paragraphBounds.start - 200);
  const context = text.substring(lookbackStart, paragraphBounds.end).toLowerCase();
  
  if (context.includes('abstract')) return 'abstract';
  if (context.includes('introduction')) return 'introduction';
  if (context.includes('method') || context.includes('material')) return 'methodology';
  if (context.includes('result') || context.includes('finding')) return 'results';
  if (context.includes('discussion')) return 'discussion';
  if (context.includes('conclusion')) return 'conclusion';
  
  // Check if paragraph looks like abstract (short, at beginning)
  if (paragraphBounds.start < 500 && paragraph.length < 2000) {
    return 'abstract';
  }
  
  return undefined;
}

/**
 * Create rule context for a given position
 */
export function createRuleContext(text: string, offset: number): RuleContext {
  const sentenceBounds = getSentenceBoundaries(text, offset);
  const paragraphBounds = getParagraphBoundaries(text, offset);
  const sectionType = detectSectionType(text, offset);
  
  return {
    text,
    sentenceStart: sentenceBounds.start,
    sentenceEnd: sentenceBounds.end,
    paragraphStart: paragraphBounds.start,
    paragraphEnd: paragraphBounds.end,
    sectionType
  };
}

/**
 * Check if match is at start of sentence
 */
export function isAtSentenceStart(text: string, offset: number): boolean {
  const sentenceBounds = getSentenceBoundaries(text, offset);
  // Allow for some whitespace at sentence start
  return offset - sentenceBounds.start < 10;
}

/**
 * Check if match is in a citation context
 */
export function isInCitation(text: string, offset: number): boolean {
  // Look for parentheses around the offset
  const before = text.substring(Math.max(0, offset - 50), offset);
  const after = text.substring(offset, Math.min(text.length, offset + 50));
  
  // Check if inside parentheses with year pattern
  const hasOpenParen = before.lastIndexOf('(') > before.lastIndexOf(')');
  const hasCloseParen = after.indexOf(')') !== -1 && after.indexOf(')') < after.indexOf('(');
  const hasYear = /\d{4}/.test(before + after);
  
  return hasOpenParen && hasCloseParen && hasYear;
}

/**
 * Check if match is in a quotation
 */
export function isInQuotation(text: string, offset: number): boolean {
  const before = text.substring(0, offset);
  
  // Count quotes before
  const quotesBefore = (before.match(/"/g) || []).length;
  
  // If odd number of quotes before, we're inside a quotation
  return quotesBefore % 2 === 1;
}

/**
 * Extract sentence containing the offset
 */
export function extractSentence(text: string, offset: number): string {
  const bounds = getSentenceBoundaries(text, offset);
  return text.substring(bounds.start, bounds.end);
}

/**
 * Extract paragraph containing the offset
 */
export function extractParagraph(text: string, offset: number): string {
  const bounds = getParagraphBoundaries(text, offset);
  return text.substring(bounds.start, bounds.end);
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Get surrounding context for better analysis
 */
export function getSurroundingContext(text: string, offset: number, radius: number = 100): string {
  const start = Math.max(0, offset - radius);
  const end = Math.min(text.length, offset + radius);
  return text.substring(start, end);
}
