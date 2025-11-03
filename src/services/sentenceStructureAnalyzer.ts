/**
 * Sentence Structure Analyzer
 * 
 * Analyzes sentence complexity, variety, and provides suggestions
 * for improving sentence structure and flow.
 */

import type { Suggestion } from '../types';
import { generateId } from '../utils/textUtils';

export interface SentenceAnalysis {
  sentence: string;
  startOffset: number;
  endOffset: number;
  wordCount: number;
  complexity: 'simple' | 'compound' | 'complex';
  issues: string[];
}

export class SentenceStructureAnalyzer {
  /**
   * Analyze sentence structure and provide suggestions
   */
  public analyze(text: string): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const sentences = this.extractSentences(text);
    
    // Check for sentence length issues
    suggestions.push(...this.checkSentenceLength(sentences));
    
    // Check for sentence variety
    suggestions.push(...this.checkSentenceVariety(sentences));
    
    // Check for run-on sentences
    suggestions.push(...this.checkRunOnSentences(sentences));
    
    // Check for sentence fragments
    suggestions.push(...this.checkSentenceFragments(sentences));
    
    // Check for monotonous sentence starts
    suggestions.push(...this.checkMonotonousStarts(sentences));
    
    return suggestions;
  }
  
  /**
   * Extract sentences with their positions
   */
  private extractSentences(text: string): SentenceAnalysis[] {
    const sentencePattern = /[^.!?]+[.!?]+/g;
    const sentences: SentenceAnalysis[] = [];
    let match;
    
    while ((match = sentencePattern.exec(text)) !== null) {
      const sentence = match[0].trim();
      const wordCount = sentence.split(/\s+/).length;
      
      sentences.push({
        sentence,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
        wordCount,
        complexity: this.determineComplexity(sentence),
        issues: [],
      });
    }
    
    return sentences;
  }
  
  /**
   * Determine sentence complexity
   */
  private determineComplexity(sentence: string): 'simple' | 'compound' | 'complex' {
    const coordinatingConjunctions = /\b(and|but|or|nor|for|yet|so)\b/gi;
    const subordinatingConjunctions = /\b(although|because|since|unless|while|if|when|where|after|before|until)\b/gi;
    
    const hasCoordinating = coordinatingConjunctions.test(sentence);
    const hasSubordinating = subordinatingConjunctions.test(sentence);
    
    if (hasSubordinating) {
      return 'complex';
    } else if (hasCoordinating) {
      return 'compound';
    } else {
      return 'simple';
    }
  }
  
  /**
   * Check for overly long or short sentences
   */
  private checkSentenceLength(sentences: SentenceAnalysis[]): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    for (const sent of sentences) {
      // Very long sentences (>40 words)
      if (sent.wordCount > 40) {
        suggestions.push({
          id: generateId(),
          type: 'style',
          severity: 'warning',
          message: `This sentence is very long (${sent.wordCount} words). Consider breaking it into shorter sentences for better readability.`,
          original: sent.sentence,
          suggestion: sent.sentence, // No automatic fix
          startLine: 0,
          endLine: 0,
          startColumn: 0,
          endColumn: 0,
          startOffset: sent.startOffset,
          endOffset: sent.endOffset,
        });
      }
      
      // Long sentences (30-40 words)
      else if (sent.wordCount >= 30) {
        suggestions.push({
          id: generateId(),
          type: 'style',
          severity: 'info',
          message: `This sentence is quite long (${sent.wordCount} words). Consider if it could be split for clarity.`,
          original: sent.sentence,
          suggestion: sent.sentence, // No automatic fix
          startLine: 0,
          endLine: 0,
          startColumn: 0,
          endColumn: 0,
          startOffset: sent.startOffset,
          endOffset: sent.endOffset,
        });
      }
      
      // Very short sentences in academic writing (< 5 words, not a title)
      else if (sent.wordCount < 5 && !this.looksLikeTitle(sent.sentence)) {
        suggestions.push({
          id: generateId(),
          type: 'style',
          severity: 'info',
          message: `This sentence is very short (${sent.wordCount} words). Consider adding more detail.`,
          original: sent.sentence,
          suggestion: sent.sentence, // No automatic fix
          startLine: 0,
          endLine: 0,
          startColumn: 0,
          endColumn: 0,
          startOffset: sent.startOffset,
          endOffset: sent.endOffset,
        });
      }
    }
    
    return suggestions;
  }
  
  /**
   * Check for lack of sentence variety
   */
  private checkSentenceVariety(sentences: SentenceAnalysis[]): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    if (sentences.length < 3) return suggestions;
    
    // Check for too many simple sentences in a row
    let simpleStreak = 0;
    for (let i = 0; i < sentences.length; i++) {
      if (sentences[i].complexity === 'simple') {
        simpleStreak++;
        
        if (simpleStreak >= 4) {
          // Flag the fourth simple sentence
          suggestions.push({
            id: generateId(),
            type: 'style',
            severity: 'info',
            message: 'Multiple simple sentences in a row. Consider varying sentence structure for better flow.',
            original: sentences[i].sentence,
            suggestion: sentences[i].sentence,
            startLine: 0,
            endLine: 0,
            startColumn: 0,
            endColumn: 0,
            startOffset: sentences[i].startOffset,
            endOffset: sentences[i].endOffset,
            });
        }
      } else {
        simpleStreak = 0;
      }
    }
    
    return suggestions;
  }
  
  /**
   * Check for run-on sentences
   */
  private checkRunOnSentences(sentences: SentenceAnalysis[]): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    for (const sent of sentences) {
      // Look for comma splices (independent clauses joined by comma)
      const commaPattern = /,\s*(?:however|therefore|moreover|furthermore|nevertheless|consequently|thus)/gi;
      const matches = [...sent.sentence.matchAll(commaPattern)];
      
      for (const match of matches) {
        const offset = sent.startOffset + (match.index || 0);
        
        suggestions.push({
          id: generateId(),
          type: 'grammar',
          severity: 'warning',
          message: 'Possible comma splice. Use a semicolon or period before transitional words like "however" or "therefore".',
          original: match[0],
          suggestion: match[0].replace(',', ';'),
          startLine: 0,
          endLine: 0,
          startColumn: 0,
          endColumn: 0,
          startOffset: offset,
          endOffset: offset + match[0].length,
        });
      }
      
      // Look for multiple independent clauses without proper punctuation
      const coordinatingWithoutPunctuation = /\b(and|but|or|so)\s+[A-Z]/g;
      const coordMatches = [...sent.sentence.matchAll(coordinatingWithoutPunctuation)];
      
      if (coordMatches.length > 2) {
        suggestions.push({
          id: generateId(),
          type: 'style',
          severity: 'warning',
          message: 'This sentence may be a run-on with too many clauses. Consider breaking into separate sentences.',
          original: sent.sentence,
          suggestion: sent.sentence,
          startLine: 0,
          endLine: 0,
          startColumn: 0,
          endColumn: 0,
          startOffset: sent.startOffset,
          endOffset: sent.endOffset,
          });
      }
    }
    
    return suggestions;
  }
  
  /**
   * Check for sentence fragments
   */
  private checkSentenceFragments(sentences: SentenceAnalysis[]): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    for (const sent of sentences) {
      // Skip very short sentences that might be titles
      if (sent.wordCount < 3 || this.looksLikeTitle(sent.sentence)) continue;
      
      // Check for sentences starting with subordinating conjunctions without main clause
      const fragmentPattern = /^(Although|Because|Since|While|If|When|Unless)\s+[^,]+\.$/i;
      
      if (fragmentPattern.test(sent.sentence.trim())) {
        suggestions.push({
          id: generateId(),
          type: 'grammar',
          severity: 'warning',
          message: 'Possible sentence fragment. Sentences starting with subordinating conjunctions need a main clause.',
          original: sent.sentence,
          suggestion: sent.sentence,
          startLine: 0,
          endLine: 0,
          startColumn: 0,
          endColumn: 0,
          startOffset: sent.startOffset,
          endOffset: sent.endOffset,
        });
      }
      
      // Check for sentences without a verb
      if (!this.hasVerb(sent.sentence)) {
        suggestions.push({
          id: generateId(),
          type: 'grammar',
          severity: 'warning',
          message: 'Possible sentence fragment. This sentence may be missing a verb.',
          original: sent.sentence,
          suggestion: sent.sentence,
          startLine: 0,
          endLine: 0,
          startColumn: 0,
          endColumn: 0,
          startOffset: sent.startOffset,
          endOffset: sent.endOffset,
          });
      }
    }
    
    return suggestions;
  }
  
  /**
   * Check for monotonous sentence starts
   */
  private checkMonotonousStarts(sentences: SentenceAnalysis[]): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    if (sentences.length < 3) return suggestions;
    
    // Track sentence starts
    const startWords: string[] = [];
    for (const sent of sentences) {
      const firstWord = sent.sentence.trim().split(/\s+/)[0].toLowerCase();
      startWords.push(firstWord);
    }
    
    // Check for repeated starts
    for (let i = 2; i < sentences.length; i++) {
      const word1 = startWords[i - 2];
      const word2 = startWords[i - 1];
      const word3 = startWords[i];
      
      if (word1 === word2 && word2 === word3) {
        suggestions.push({
          id: generateId(),
          type: 'style',
          severity: 'info',
          message: `Three consecutive sentences start with "${word1}". Consider varying sentence beginnings for better flow.`,
          original: sentences[i].sentence,
          suggestion: sentences[i].sentence,
          startLine: 0,
          endLine: 0,
          startColumn: 0,
          endColumn: 0,
          startOffset: sentences[i].startOffset,
          endOffset: sentences[i].endOffset,
          });
      }
    }
    
    return suggestions;
  }
  
  /**
   * Check if sentence looks like a title or heading
   */
  private looksLikeTitle(sentence: string): boolean {
    // Titles are typically short, capitalized, and lack ending punctuation or have colons
    const trimmed = sentence.trim();
    return /^[A-Z][^.!?]*:?\s*$/.test(trimmed) && trimmed.split(/\s+/).length <= 8;
  }
  
  /**
   * Check if sentence has a verb
   */
  private hasVerb(sentence: string): boolean {
    // Simple verb detection - look for common verb patterns
    const verbPatterns = [
      /\b(is|are|was|were|be|been|being)\b/i,
      /\b(have|has|had)\b/i,
      /\b(do|does|did)\b/i,
      /\b(can|could|will|would|shall|should|may|might|must)\b/i,
      /\b\w+ed\b/i,  // Past tense
      /\b\w+ing\b/i, // Present participle
      /\b\w+s\b/i,   // Third person singular present
    ];
    
    return verbPatterns.some(pattern => pattern.test(sentence));
  }
}

export default new SentenceStructureAnalyzer();
