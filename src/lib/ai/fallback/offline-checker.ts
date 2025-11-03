/**
 * Offline Fallback Checker
 * Provides basic grammar and spelling checking when AI is unavailable
 */

import type { Suggestion } from '../providers/types';

export class OfflineChecker {
  /**
   * Common spelling mistakes database
   */
  private commonMistakes: Map<string, string> = new Map([
    // Common typos
    ['recieve', 'receive'],
    ['beleive', 'believe'],
    ['definately', 'definitely'],
    ['occured', 'occurred'],
    ['seperate', 'separate'],
    ['alot', 'a lot'],
    ['untill', 'until'],
    ['wich', 'which'],
    ['thier', 'their'],
    ['teh', 'the'],
    ['adn', 'and'],
    ['waht', 'what'],
    
    // Academic terms
    ['arguement', 'argument'],
    ['independant', 'independent'],
    ['concious', 'conscious'],
    ['occurance', 'occurrence'],
    ['persistant', 'persistent'],
    ['existance', 'existence'],
    ['maintainance', 'maintenance'],
    ['accomodate', 'accommodate'],
    ['reccommend', 'recommend'],
    ['necesary', 'necessary'],
  ]);

  /**
   * Common grammar patterns
   */
  private grammarPatterns: Array<{
    pattern: RegExp;
    message: string;
    replacement?: string;
  }> = [
    {
      pattern: /\b(its)\s+(a|an|the|their|his|her)\b/gi,
      message: "Use \"it's\" (it is) instead of \"its\" when followed by an article",
    },
    {
      pattern: /\b(could|should|would)\s+of\b/gi,
      message: "Use \"have\" instead of \"of\" (e.g., could have, should have)",
      replacement: '$1 have',
    },
    {
      pattern: /\b(suppose|use)\s+to\b/gi,
      message: "Use \"supposed to\" or \"used to\" (past tense)",
      replacement: '$1d to',
    },
    {
      pattern: /\bthan\s+(me|him|her|us|them)\b/gi,
      message: "Consider using subject pronoun (I, he, she, we, they) after \"than\"",
    },
    {
      pattern: /\b(less)\s+(people|students|researchers|writers)\b/gi,
      message: "Use \"fewer\" for countable nouns",
      replacement: 'fewer $2',
    },
  ];

  /**
   * Check text for spelling and grammar issues
   */
  checkText(text: string): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Check spelling
    suggestions.push(...this.checkSpelling(text));

    // Check grammar patterns
    suggestions.push(...this.checkGrammar(text));

    return suggestions;
  }

  /**
   * Check spelling mistakes
   */
  private checkSpelling(text: string): Suggestion[] {
    const suggestions: Suggestion[] = [];
    let suggestionId = 0;

    this.commonMistakes.forEach((correct, wrong) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        const contextStart = Math.max(0, match.index - 20);
        const contextEnd = Math.min(text.length, match.index + wrong.length + 20);
        
        suggestions.push({
          id: `offline-spell-${suggestionId++}`,
          type: 'spelling',
          severity: 'error',
          message: `Spelling: "${match[0]}" should be "${correct}"`,
          context: text.substring(contextStart, contextEnd),
          offset: match.index,
          length: wrong.length,
          replacements: [correct],
        });
      }
    });

    return suggestions;
  }

  /**
   * Check grammar patterns
   */
  private checkGrammar(text: string): Suggestion[] {
    const suggestions: Suggestion[] = [];
    let suggestionId = 0;

    this.grammarPatterns.forEach(({ pattern, message, replacement }) => {
      let match;
      
      while ((match = pattern.exec(text)) !== null) {
        const contextStart = Math.max(0, match.index - 20);
        const contextEnd = Math.min(text.length, match.index + match[0].length + 20);
        
        suggestions.push({
          id: `offline-grammar-${suggestionId++}`,
          type: 'grammar',
          severity: 'warning',
          message: `Grammar: ${message}`,
          context: text.substring(contextStart, contextEnd),
          offset: match.index,
          length: match[0].length,
          replacements: replacement ? [match[0].replace(pattern, replacement)] : [],
        });
      }
    });

    return suggestions;
  }

  /**
   * Check for double spaces
   */
  checkPunctuation(text: string): Suggestion[] {
    const suggestions: Suggestion[] = [];
    let suggestionId = 0;

    // Double spaces
    const doubleSpaceRegex = /\s{2,}/g;
    let match;
    
    while ((match = doubleSpaceRegex.exec(text)) !== null) {
      suggestions.push({
        id: `offline-punct-${suggestionId++}`,
        type: 'punctuation',
        severity: 'info',
        message: 'Extra spaces detected',
        context: text.substring(Math.max(0, match.index - 10), match.index + match[0].length + 10),
        offset: match.index,
        length: match[0].length,
        replacements: [' '],
      });
    }

    // Missing space after punctuation
    const missingSpaceRegex = /([.,:;!?])([A-Z])/g;
    while ((match = missingSpaceRegex.exec(text)) !== null) {
      suggestions.push({
        id: `offline-punct-${suggestionId++}`,
        type: 'punctuation',
        severity: 'warning',
        message: 'Missing space after punctuation',
        context: text.substring(Math.max(0, match.index - 10), match.index + match[0].length + 10),
        offset: match.index,
        length: match[0].length,
        replacements: [`${match[1]} ${match[2]}`],
      });
    }

    return suggestions;
  }

  /**
   * Comprehensive check combining all methods
   */
  checkAll(text: string): Suggestion[] {
    return [
      ...this.checkText(text),
      ...this.checkPunctuation(text),
    ];
  }
}

// Singleton instance
export const offlineChecker = new OfflineChecker();
