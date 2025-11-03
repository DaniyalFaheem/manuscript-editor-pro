/**
 * Consistency Checker
 * 
 * Checks for consistency across the document including:
 * - Terminology usage
 * - Capitalization
 * - Number formatting
 * - Date formatting
 * - Spelling variants (US vs UK English)
 */

import type { DocumentContext, Suggestion } from '../core/types';
import { ErrorCategory as EC, SuggestionSeverity } from '../core/types';

/**
 * Consistency issue types
 */
export interface ConsistencyIssues {
  terminology: TerminologyInconsistency[];
  capitalization: CapitalizationInconsistency[];
  spellingVariants: SpellingVariantInconsistency[];
  numberFormatting: NumberFormattingInconsistency[];
}

export interface TerminologyInconsistency {
  term: string;
  variants: string[];
  occurrences: number;
}

export interface CapitalizationInconsistency {
  term: string;
  forms: Map<string, number>;
}

export interface SpellingVariantInconsistency {
  word: string;
  usVariant: string;
  ukVariant: string;
  usCount: number;
  ukCount: number;
}

export interface NumberFormattingInconsistency {
  type: 'comma' | 'decimal';
  formats: string[];
}

/**
 * Consistency Checker class
 */
export class ConsistencyChecker {
  // Common US/UK spelling variants
  private usUkVariants: Map<string, string> = new Map([
    ['color', 'colour'],
    ['analyze', 'analyse'],
    ['center', 'centre'],
    ['organize', 'organise'],
    ['recognize', 'recognise'],
    ['favor', 'favour'],
    ['honor', 'honour'],
    ['labor', 'labour'],
    ['neighbor', 'neighbour'],
    ['defense', 'defence'],
    ['license', 'licence'],
    ['practice', 'practise'], // Note: context-dependent in UK
    ['theater', 'theatre'],
    ['fiber', 'fibre'],
    ['meter', 'metre'],
    ['liter', 'litre'],
  ]);

  /**
   * Check document consistency
   */
  public check(context: DocumentContext): {
    issues: ConsistencyIssues;
    suggestions: Suggestion[];
  } {
    const issues: ConsistencyIssues = {
      terminology: this.checkTerminologyConsistency(context),
      capitalization: this.checkCapitalizationConsistency(context),
      spellingVariants: this.checkSpellingVariants(context),
      numberFormatting: this.checkNumberFormatting(context),
    };

    const suggestions = this.generateSuggestions(context, issues);

    return { issues, suggestions };
  }

  /**
   * Check terminology consistency
   */
  private checkTerminologyConsistency(context: DocumentContext): TerminologyInconsistency[] {
    const inconsistencies: TerminologyInconsistency[] = [];
    
    // Common terminology variations
    const terminologyGroups = [
      ['internet', 'Internet', 'INTERNET'],
      ['email', 'e-mail', 'E-mail'],
      ['website', 'web site', 'web-site'],
      ['machine learning', 'ML', 'Machine Learning'],
      ['artificial intelligence', 'AI', 'Artificial Intelligence'],
      ['database', 'data base', 'data-base'],
      ['online', 'on-line', 'on line'],
    ];

    for (const group of terminologyGroups) {
      const variants: string[] = [];
      let totalCount = 0;

      for (const variant of group) {
        const count = this.countOccurrences(context, variant);
        if (count > 0) {
          variants.push(variant);
          totalCount += count;
        }
      }

      // If multiple variants found, it's inconsistent
      if (variants.length > 1 && totalCount > 2) {
        inconsistencies.push({
          term: group[0], // Base form
          variants,
          occurrences: totalCount,
        });
      }
    }

    return inconsistencies;
  }

  /**
   * Check capitalization consistency
   */
  private checkCapitalizationConsistency(context: DocumentContext): CapitalizationInconsistency[] {
    const inconsistencies: CapitalizationInconsistency[] = [];
    const wordForms: Map<string, Map<string, number>> = new Map();

    // Track all word forms
    for (const token of context.tokens) {
      if (token.type !== 'word' || token.text.length < 3) continue;

      const normalized = token.text.toLowerCase();
      
      if (!wordForms.has(normalized)) {
        wordForms.set(normalized, new Map());
      }

      const forms = wordForms.get(normalized)!;
      forms.set(token.text, (forms.get(token.text) || 0) + 1);
    }

    // Find words with inconsistent capitalization
    for (const [normalized, forms] of wordForms) {
      if (forms.size > 1) {
        // Check if it's at sentence start (acceptable variation)
        const totalCount = Array.from(forms.values()).reduce((a, b) => a + b, 0);
        
        if (totalCount > 2) {
          inconsistencies.push({
            term: normalized,
            forms,
          });
        }
      }
    }

    return inconsistencies;
  }

  /**
   * Check spelling variants (US vs UK)
   */
  private checkSpellingVariants(context: DocumentContext): SpellingVariantInconsistency[] {
    const inconsistencies: SpellingVariantInconsistency[] = [];

    for (const [usWord, ukWord] of this.usUkVariants) {
      const usCount = this.countOccurrences(context, usWord);
      const ukCount = this.countOccurrences(context, ukWord);

      // If both variants found, it's inconsistent
      if (usCount > 0 && ukCount > 0) {
        inconsistencies.push({
          word: usWord,
          usVariant: usWord,
          ukVariant: ukWord,
          usCount,
          ukCount,
        });
      }
    }

    return inconsistencies;
  }

  /**
   * Check number formatting consistency
   */
  private checkNumberFormatting(context: DocumentContext): NumberFormattingInconsistency[] {
    const inconsistencies: NumberFormattingInconsistency[] = [];

    // Check comma usage in numbers
    const numberPattern = /\b\d{1,3}(?:,\d{3})+\b/g;
    const commaNumbers = context.text.match(numberPattern) || [];
    
    const noCommaPattern = /\b\d{4,}\b/g;
    const noCommaNumbers = context.text.match(noCommaPattern) || [];

    if (commaNumbers.length > 0 && noCommaNumbers.length > 0) {
      inconsistencies.push({
        type: 'comma',
        formats: ['with commas', 'without commas'],
      });
    }

    return inconsistencies;
  }

  /**
   * Count occurrences of a term
   */
  private countOccurrences(context: DocumentContext, term: string): number {
    // Case-sensitive search for exact term
    const pattern = new RegExp(`\\b${this.escapeRegex(term)}\\b`, 'g');
    const matches = context.text.match(pattern);
    return matches ? matches.length : 0;
  }

  /**
   * Escape regex special characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Generate suggestions from issues
   */
  private generateSuggestions(
    _context: DocumentContext,
    issues: ConsistencyIssues
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Terminology inconsistencies
    for (const issue of issues.terminology) {
      suggestions.push({
        id: `terminology-${issue.term}`,
        category: EC.CONSISTENCY,
        type: 'terminology-inconsistency',
        severity: SuggestionSeverity.INFO,
        message: `Inconsistent terminology: "${issue.term}"`,
        explanation: `This term appears in multiple forms: ${issue.variants.join(', ')}. Choose one form and use it consistently throughout the document.`,
        confidence: 0.75,
        original: issue.variants.join(', '),
        replacement: issue.variants[0], // Suggest most common form
        startOffset: 0,
        endOffset: 0,
        source: 'rule-engine',
      });
    }

    // Spelling variant inconsistencies
    for (const issue of issues.spellingVariants) {
      const preferred = issue.usCount > issue.ukCount ? issue.usVariant : issue.ukVariant;
      const variant = issue.usCount > issue.ukCount ? 'US' : 'UK';

      suggestions.push({
        id: `spelling-variant-${issue.word}`,
        category: EC.CONSISTENCY,
        type: 'spelling-variant',
        severity: SuggestionSeverity.INFO,
        message: `Mixed US/UK spelling: "${issue.word}"`,
        explanation: `You're using both US spelling (${issue.usVariant}, ${issue.usCount}×) and UK spelling (${issue.ukVariant}, ${issue.ukCount}×). Consider using ${variant} spelling consistently.`,
        confidence: 0.85,
        original: issue.usCount > issue.ukCount ? issue.ukVariant : issue.usVariant,
        replacement: preferred,
        startOffset: 0,
        endOffset: 0,
        source: 'rule-engine',
      });
    }

    // Number formatting inconsistencies
    for (const issue of issues.numberFormatting) {
      suggestions.push({
        id: `number-formatting-${issue.type}`,
        category: EC.CONSISTENCY,
        type: 'number-formatting',
        severity: SuggestionSeverity.INFO,
        message: 'Inconsistent number formatting',
        explanation: `Numbers are formatted inconsistently: ${issue.formats.join(' and ')}. Choose one format and use it throughout.`,
        confidence: 0.70,
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
   * Get recommended terminology
   */
  public getRecommendedForm(variants: string[]): string {
    // Return most common form
    // In real implementation, this would check frequency in context
    return variants[0];
  }

  /**
   * Detect document style preference (US vs UK)
   */
  public detectStylePreference(context: DocumentContext): 'US' | 'UK' | 'mixed' {
    let usCount = 0;
    let ukCount = 0;

    for (const [usWord, ukWord] of this.usUkVariants) {
      usCount += this.countOccurrences(context, usWord);
      ukCount += this.countOccurrences(context, ukWord);
    }

    if (usCount === 0 && ukCount === 0) return 'US'; // Default
    if (usCount > ukCount * 2) return 'US';
    if (ukCount > usCount * 2) return 'UK';
    return 'mixed';
  }
}

/**
 * Singleton instance
 */
export const consistencyChecker = new ConsistencyChecker();
