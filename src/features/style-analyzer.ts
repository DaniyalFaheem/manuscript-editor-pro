/**
 * Style Analyzer
 * 
 * Analyzes writing style including readability, sentence variation,
 * passive voice, and word choice.
 */

import type { DocumentContext, Suggestion } from '../core/types';
import { ErrorCategory as EC, SuggestionSeverity } from '../core/types';

/**
 * Readability metrics
 */
export interface ReadabilityMetrics {
  fleschReadingEase: number;        // 0-100 (higher = easier)
  fleschKincaidGrade: number;       // US grade level
  gunningFogIndex: number;          // Years of education needed
  smogIndex: number;                // Simple Measure of Gobbledygook
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  complexWordCount: number;
  passiveVoicePercentage: number;
}

/**
 * Style issues
 */
export interface StyleIssues {
  passiveVoice: number;
  sentenceLengthVariation: number;  // 0-1 (higher = more varied)
  wordRepetition: string[];
  weakIntensifiers: number;
  hedgeWords: number;
}

/**
 * Style Analyzer class
 */
export class StyleAnalyzer {
  /**
   * Analyze document style
   */
  public analyze(context: DocumentContext): {
    metrics: ReadabilityMetrics;
    issues: StyleIssues;
    suggestions: Suggestion[];
  } {
    const metrics = this.calculateReadability(context);
    const issues = this.findStyleIssues(context);
    const suggestions = this.generateStyleSuggestions(context, issues);

    return { metrics, issues, suggestions };
  }

  /**
   * Calculate readability metrics
   */
  private calculateReadability(context: DocumentContext): ReadabilityMetrics {
    const { sentences, tokens } = context;
    
    const words = tokens.filter(t => t.type === 'word');
    const wordCount = words.length;
    const sentenceCount = sentences.length;

    if (wordCount === 0 || sentenceCount === 0) {
      return this.getEmptyMetrics();
    }

    // Calculate syllables
    let totalSyllables = 0;
    let complexWordCount = 0;

    for (const word of words) {
      const syllables = this.countSyllables(word.text);
      totalSyllables += syllables;
      if (syllables >= 3) {
        complexWordCount++;
      }
    }

    const avgWordsPerSentence = wordCount / sentenceCount;
    const avgSyllablesPerWord = totalSyllables / wordCount;

    // Flesch Reading Ease: 206.835 - 1.015(words/sentence) - 84.6(syllables/word)
    const fleschReadingEase = Math.max(
      0,
      Math.min(
        100,
        206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
      )
    );

    // Flesch-Kincaid Grade Level: 0.39(words/sentence) + 11.8(syllables/word) - 15.59
    const fleschKincaidGrade = Math.max(
      0,
      0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59
    );

    // Gunning Fog Index: 0.4 * ((words/sentence) + 100(complex words/words))
    const gunningFogIndex = 0.4 * (
      avgWordsPerSentence + 100 * (complexWordCount / wordCount)
    );

    // SMOG Index: 1.0430 * sqrt(polysyllables * (30/sentences)) + 3.1291
    const polysyllables = complexWordCount;
    const smogIndex = 1.0430 * Math.sqrt(polysyllables * (30 / sentenceCount)) + 3.1291;

    // Passive voice detection
    const passiveVoicePercentage = this.calculatePassiveVoice(context);

    return {
      fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
      fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
      gunningFogIndex: Math.round(gunningFogIndex * 10) / 10,
      smogIndex: Math.round(smogIndex * 10) / 10,
      averageWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      averageSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
      complexWordCount,
      passiveVoicePercentage: Math.round(passiveVoicePercentage * 10) / 10,
    };
  }

  /**
   * Get empty metrics
   */
  private getEmptyMetrics(): ReadabilityMetrics {
    return {
      fleschReadingEase: 0,
      fleschKincaidGrade: 0,
      gunningFogIndex: 0,
      smogIndex: 0,
      averageWordsPerSentence: 0,
      averageSyllablesPerWord: 0,
      complexWordCount: 0,
      passiveVoicePercentage: 0,
    };
  }

  /**
   * Count syllables in a word (simple heuristic)
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase();
    
    // Handle special cases
    if (word.length <= 3) return 1;
    
    // Remove silent 'e' at end
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    
    // Remove trailing 'e'
    word = word.replace(/^y/, '');
    
    // Match vowel groups
    const matches = word.match(/[aeiouy]{1,2}/g);
    
    return matches ? matches.length : 1;
  }

  /**
   * Calculate passive voice percentage
   */
  private calculatePassiveVoice(context: DocumentContext): number {
    const { sentences } = context;
    let passiveCount = 0;

    for (const sentence of sentences) {
      if (this.isPassiveVoice(sentence.text)) {
        passiveCount++;
      }
    }

    return sentences.length > 0 ? (passiveCount / sentences.length) * 100 : 0;
  }

  /**
   * Check if sentence is passive voice
   */
  private isPassiveVoice(text: string): boolean {
    // Simple heuristic: check for "be" verb + past participle
    const passivePattern = /\b(am|is|are|was|were|be|been|being)\s+\w+(ed|en)\b/i;
    return passivePattern.test(text);
  }

  /**
   * Find style issues
   */
  private findStyleIssues(context: DocumentContext): StyleIssues {
    return {
      passiveVoice: this.countPassiveVoice(context),
      sentenceLengthVariation: this.calculateSentenceLengthVariation(context),
      wordRepetition: this.findWordRepetition(context),
      weakIntensifiers: this.countWeakIntensifiers(context),
      hedgeWords: this.countHedgeWords(context),
    };
  }

  /**
   * Count passive voice instances
   */
  private countPassiveVoice(context: DocumentContext): number {
    return context.sentences.filter(s => this.isPassiveVoice(s.text)).length;
  }

  /**
   * Calculate sentence length variation
   */
  private calculateSentenceLengthVariation(context: DocumentContext): number {
    const lengths = context.sentences.map(s => 
      s.tokens.filter(t => t.type === 'word').length
    );

    if (lengths.length < 2) return 1;

    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);

    // Normalize to 0-1 range (higher = more variation)
    return Math.min(1, stdDev / mean);
  }

  /**
   * Find repeated words
   */
  private findWordRepetition(context: DocumentContext): string[] {
    const words = context.tokens
      .filter(t => t.type === 'word')
      .map(t => t.text.toLowerCase());

    const frequency: Map<string, number> = new Map();
    
    for (const word of words) {
      if (word.length > 3) { // Only count words longer than 3 chars
        frequency.set(word, (frequency.get(word) || 0) + 1);
      }
    }

    // Find words used more than 3 times per 100 words
    const threshold = Math.max(3, words.length / 100 * 3);
    const repeated: string[] = [];

    for (const [word, count] of frequency.entries()) {
      if (count > threshold) {
        repeated.push(word);
      }
    }

    return repeated;
  }

  /**
   * Count weak intensifiers
   */
  private countWeakIntensifiers(context: DocumentContext): number {
    const weakWords = ['very', 'really', 'quite', 'rather', 'somewhat', 'fairly'];
    return context.tokens.filter(t => 
      t.type === 'word' && weakWords.includes(t.text.toLowerCase())
    ).length;
  }

  /**
   * Count hedge words
   */
  private countHedgeWords(context: DocumentContext): number {
    const hedgeWords = ['maybe', 'perhaps', 'possibly', 'probably', 'seems', 'appears'];
    return context.tokens.filter(t =>
      t.type === 'word' && hedgeWords.includes(t.text.toLowerCase())
    ).length;
  }

  /**
   * Generate style suggestions
   */
  private generateStyleSuggestions(
    context: DocumentContext,
    issues: StyleIssues
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // High passive voice
    if (issues.passiveVoice > context.sentences.length * 0.2) {
      suggestions.push({
        id: 'high-passive-voice',
        category: EC.STYLE,
        type: 'passive-voice-warning',
        severity: SuggestionSeverity.INFO,
        message: 'Consider using more active voice',
        explanation: `${issues.passiveVoice} out of ${context.sentences.length} sentences use passive voice (${Math.round(issues.passiveVoice / context.sentences.length * 100)}%). Active voice is usually clearer and more direct.`,
        confidence: 0.70,
        original: '',
        replacement: '',
        startOffset: 0,
        endOffset: 0,
        source: 'rule-engine',
      });
    }

    // Low sentence variation
    if (issues.sentenceLengthVariation < 0.3) {
      suggestions.push({
        id: 'low-sentence-variation',
        category: EC.STYLE,
        type: 'sentence-variation',
        severity: SuggestionSeverity.INFO,
        message: 'Consider varying sentence length',
        explanation: 'Your sentences have similar lengths. Varying sentence length can make writing more engaging.',
        confidence: 0.60,
        original: '',
        replacement: '',
        startOffset: 0,
        endOffset: 0,
        source: 'rule-engine',
      });
    }

    return suggestions;
  }

  /**
   * Get readability interpretation
   */
  public interpretReadability(score: number): string {
    if (score >= 90) return 'Very Easy (5th grade)';
    if (score >= 80) return 'Easy (6th grade)';
    if (score >= 70) return 'Fairly Easy (7th grade)';
    if (score >= 60) return 'Standard (8th-9th grade)';
    if (score >= 50) return 'Fairly Difficult (10th-12th grade)';
    if (score >= 30) return 'Difficult (College)';
    return 'Very Difficult (College graduate)';
  }
}

/**
 * Singleton instance
 */
export const styleAnalyzer = new StyleAnalyzer();
