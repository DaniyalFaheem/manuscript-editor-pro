/**
 * Vocabulary Enhancement Service
 * 
 * Provides contextual synonym suggestions, overused word detection,
 * and vocabulary variety recommendations.
 */

import type { Suggestion } from '../types';
import { generateId } from '../utils/textUtils';

/**
 * Common overused words that should be varied
 */
const OVERUSED_WORDS = new Set([
  'very', 'really', 'just', 'quite', 'rather', 'pretty',
  'good', 'bad', 'nice', 'great', 'amazing', 'awesome',
  'thing', 'stuff', 'things', 'get', 'got', 'make', 'made',
  'important', 'interesting', 'big', 'small', 'a lot',
  'basically', 'literally', 'actually', 'definitely',
]);

/**
 * Power word replacements for common weak words
 */
const POWER_WORD_MAP: Record<string, string[]> = {
  // Weak to strong adjectives
  'good': ['excellent', 'superior', 'exceptional', 'outstanding', 'remarkable'],
  'bad': ['poor', 'inadequate', 'deficient', 'inferior', 'unsatisfactory'],
  'nice': ['pleasant', 'agreeable', 'delightful', 'charming', 'appealing'],
  'big': ['substantial', 'considerable', 'significant', 'extensive', 'vast'],
  'small': ['minor', 'minimal', 'negligible', 'modest', 'limited'],
  
  // Weak to strong verbs
  'get': ['obtain', 'acquire', 'secure', 'procure', 'attain'],
  'make': ['create', 'construct', 'produce', 'generate', 'establish'],
  'show': ['demonstrate', 'illustrate', 'reveal', 'display', 'exhibit'],
  'use': ['utilize', 'employ', 'apply', 'implement', 'leverage'],
  'think': ['consider', 'believe', 'conclude', 'deduce', 'surmise'],
  
  // Intensifiers
  'very': ['extremely', 'remarkably', 'exceptionally', 'notably', 'considerably'],
  'really': ['genuinely', 'truly', 'authentically', 'undoubtedly', 'certainly'],
  
  // Qualifiers
  'important': ['crucial', 'essential', 'vital', 'critical', 'significant'],
  'interesting': ['compelling', 'engaging', 'fascinating', 'intriguing', 'captivating'],
};

/**
 * Clichés and overused phrases to avoid
 */
const CLICHE_PHRASES = [
  { phrase: /\bat the end of the day\b/gi, message: 'Cliché phrase', replacement: 'ultimately' },
  { phrase: /\bthink outside the box\b/gi, message: 'Cliché phrase', replacement: 'be creative' },
  { phrase: /\blow-hanging fruit\b/gi, message: 'Cliché phrase', replacement: 'easy opportunity' },
  { phrase: /\bsynergy\b/gi, message: 'Overused buzzword', replacement: 'cooperation' },
  { phrase: /\bparadigm shift\b/gi, message: 'Overused buzzword', replacement: 'fundamental change' },
  { phrase: /\bgame changer\b/gi, message: 'Overused buzzword', replacement: 'significant innovation' },
  { phrase: /\bbest practice\b/gi, message: 'Overused term', replacement: 'effective method' },
  { phrase: /\btouch base\b/gi, message: 'Overused phrase', replacement: 'contact' },
  { phrase: /\bcircle back\b/gi, message: 'Overused phrase', replacement: 'return to' },
  { phrase: /\btake it to the next level\b/gi, message: 'Cliché phrase', replacement: 'improve significantly' },
];

export class VocabularyEnhancer {
  /**
   * Analyze text for vocabulary issues and suggestions
   */
  public analyze(text: string): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    // Check for overused words
    suggestions.push(...this.detectOverusedWords(text));
    
    // Check for weak words that can be replaced with power words
    suggestions.push(...this.suggestPowerWords(text));
    
    // Check for clichés
    suggestions.push(...this.detectCliches(text));
    
    // Check for word repetition in close proximity
    suggestions.push(...this.detectWordRepetition(text));
    
    return suggestions;
  }
  
  /**
   * Detect overused words in the text
   */
  private detectOverusedWords(text: string): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const words = text.toLowerCase().split(/\b/);
    const wordCounts = new Map<string, number>();
    
    // Count word frequencies
    for (const word of words) {
      if (OVERUSED_WORDS.has(word)) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    }
    
    // Create suggestions for frequently used weak words
    for (const [word, count] of wordCounts) {
      if (count > 3) {
        // Find all occurrences
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        let match;
        
        while ((match = regex.exec(text)) !== null) {
          const powerWord = POWER_WORD_MAP[word.toLowerCase()]?.[0] || word;
          const suggestion: Suggestion = {
            id: generateId(),
            type: 'style',
            severity: 'info',
            message: `"${word}" is used ${count} times. Consider varying your vocabulary.`,
            original: match[0],
            suggestion: powerWord,
            startLine: 0, // Will be calculated by the context
            endLine: 0,
            startColumn: 0,
            endColumn: 0,
            startOffset: match.index,
            endOffset: match.index + match[0].length,
          };
          
          suggestions.push(suggestion);
        }
      }
    }
    
    return suggestions;
  }
  
  /**
   * Suggest power words to replace weak words
   */
  private suggestPowerWords(text: string): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    for (const [weakWord, powerWords] of Object.entries(POWER_WORD_MAP)) {
      const regex = new RegExp(`\\b${weakWord}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        // Skip if already flagged as overused
        const position = match.index;
        const hasOverusedSuggestion = suggestions.some(
          s => s.startOffset === position && s.message.includes('used')
        );
        
        if (!hasOverusedSuggestion) {
          const suggestion: Suggestion = {
            id: generateId(),
            type: 'style',
            severity: 'info',
            message: `Consider using a stronger word than "${match[0]}". Try: ${powerWords.slice(0, 3).join(', ')}`,
            original: match[0],
            suggestion: powerWords[0],
            startLine: 0,
            endLine: 0,
            startColumn: 0,
            endColumn: 0,
            startOffset: match.index,
            endOffset: match.index + match[0].length,
          };
          
          suggestions.push(suggestion);
        }
      }
    }
    
    return suggestions;
  }
  
  /**
   * Detect clichés and overused phrases
   */
  private detectCliches(text: string): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    for (const { phrase, message, replacement } of CLICHE_PHRASES) {
      let match;
      
      while ((match = phrase.exec(text)) !== null) {
        const suggestion: Suggestion = {
          id: generateId(),
          type: 'style',
          severity: 'warning',
          message: `${message}: "${match[0]}". Try "${replacement}" instead.`,
          original: match[0],
          suggestion: replacement,
          startLine: 0,
          endLine: 0,
          startColumn: 0,
          endColumn: 0,
          startOffset: match.index,
          endOffset: match.index + match[0].length,
        };
        
        suggestions.push(suggestion);
      }
    }
    
    return suggestions;
  }
  
  /**
   * Detect word repetition in close proximity (within 50 words)
   */
  private detectWordRepetition(text: string): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const words = text.split(/\b/);
    const positions = new Map<string, number[]>();
    
    let offset = 0;
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const cleanWord = word.toLowerCase().trim();
      
      // Only check meaningful words (4+ characters)
      if (cleanWord.length >= 4 && /^[a-z]+$/.test(cleanWord)) {
        if (!positions.has(cleanWord)) {
          positions.set(cleanWord, []);
        }
        positions.get(cleanWord)!.push(offset);
      }
      
      offset += word.length;
    }
    
    // Check for words repeated within 50-word window
    for (const [word, offsets] of positions) {
      for (let i = 1; i < offsets.length; i++) {
        const prevOffset = offsets[i - 1];
        const currOffset = offsets[i];
        
        // Check if repetition is within ~50 words (approximate 250 characters)
        if (currOffset - prevOffset < 250) {
          const suggestion: Suggestion = {
            id: generateId(),
            type: 'style',
            severity: 'info',
            message: `The word "${word}" is repeated in close proximity. Consider using a synonym.`,
            original: word,
            suggestion: word, // No automatic replacement for repetition
            startLine: 0,
            endLine: 0,
            startColumn: 0,
            endColumn: 0,
            startOffset: currOffset,
            endOffset: currOffset + word.length,
          };
          
          suggestions.push(suggestion);
        }
      }
    }
    
    return suggestions;
  }
  
  /**
   * Get contextual synonyms for a word
   */
  public getSynonyms(word: string): string[] {
    const lowerWord = word.toLowerCase();
    
    // Return power words if available
    if (POWER_WORD_MAP[lowerWord]) {
      return POWER_WORD_MAP[lowerWord];
    }
    
    // For words not in our map, return empty array
    // In a real implementation, this would use a thesaurus API or database
    return [];
  }
  
  /**
   * Calculate vocabulary diversity score (0-100)
   */
  public calculateVocabularyDiversity(text: string): number {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const uniqueWords = new Set(words);
    
    if (words.length === 0) return 0;
    
    // Type-token ratio * 100
    const diversity = (uniqueWords.size / words.length) * 100;
    
    // Normalize to 0-100 scale (typical diversity is 40-60%)
    return Math.min(100, Math.round(diversity * 1.5));
  }
}

export default new VocabularyEnhancer();
