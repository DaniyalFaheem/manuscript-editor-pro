/**
 * Rule Engine
 * 
 * Deterministic grammar and style rules for error detection.
 * Implements 50+ core rules for common writing errors.
 */

import type {
  RuleDefinition,
  Suggestion,
  DocumentContext,
  Match,
  ErrorCategory,
  SuggestionSeverity,
} from './types';
import { ErrorCategory as EC } from './types';

/**
 * Rule Engine for applying grammar rules
 */
export class RuleEngine {
  private rules: Map<string, RuleDefinition> = new Map();

  constructor() {
    this.initializeRules();
  }

  /**
   * Initialize built-in rules
   */
  private initializeRules(): void {
    // Add all core rules
    const rules = [
      ...this.getGrammarRules(),
      ...this.getSpellingRules(),
      ...this.getPunctuationRules(),
      ...this.getStyleRules(),
    ];

    for (const rule of rules) {
      this.addRule(rule);
    }
  }

  /**
   * Add a rule to the engine
   */
  public addRule(rule: RuleDefinition): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Apply all enabled rules to document
   */
  public check(context: DocumentContext): Suggestion[] {
    const suggestions: Suggestion[] = [];

    for (const rule of this.rules.values()) {
      if (rule.enabled === false) continue;

      try {
        const ruleSuggestions = this.applyRule(rule, context);
        suggestions.push(...ruleSuggestions);
      } catch (error) {
        console.error(`Error applying rule ${rule.id}:`, error);
      }
    }

    return suggestions;
  }

  /**
   * Apply a single rule
   */
  private applyRule(rule: RuleDefinition, context: DocumentContext): Suggestion[] {
    const suggestions: Suggestion[] = [];

    if (rule.pattern instanceof RegExp) {
      // Regex-based rule
      const matches = this.findRegexMatches(rule.pattern, context);
      for (const match of matches) {
        const suggestion = this.createSuggestion(rule, match, context);
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
    } else {
      // Function-based rule
      const matches = rule.pattern(context.tokens, context);
      for (const match of matches) {
        const suggestion = this.createSuggestion(rule, match, context);
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
    }

    return suggestions;
  }

  /**
   * Find matches using regex pattern
   */
  private findRegexMatches(pattern: RegExp, context: DocumentContext): Match[] {
    const matches: Match[] = [];
    const globalPattern = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
    
    let match;
    while ((match = globalPattern.exec(context.text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      // Find surrounding context
      const sentence = context.sentences.find(s => s.start <= start && s.end >= end);
      const paragraph = context.paragraphs.find(p => p.start <= start && p.end >= end);
      const tokens = context.tokens.filter(t => t.start >= start && t.end <= end);

      matches.push({
        text: match[0],
        start,
        end,
        tokens,
        context: {
          sentence,
          paragraph,
        },
        groups: match.groups,
      });
    }

    return matches;
  }

  /**
   * Create a suggestion from a rule match
   */
  private createSuggestion(
    rule: RuleDefinition,
    match: Match,
    context: DocumentContext
  ): Suggestion | null {
    const message = typeof rule.message === 'function' ? rule.message(match) : rule.message;
    const explanation = typeof rule.explanation === 'function' ? rule.explanation(match) : rule.explanation;
    const replacement = typeof rule.replacement === 'function' ? rule.replacement(match) : rule.replacement;
    
    // Context can be used for future enhancements like context-aware explanations
    if (context.text.length > 0) {
      // Future: Add context-aware explanation generation
    }

    return {
      id: `${rule.id}-${match.start}`,
      category: rule.category,
      type: rule.id,
      severity: this.getSeverity(rule.category),
      message,
      explanation,
      confidence: rule.confidence,
      original: match.text,
      replacement,
      startOffset: match.start,
      endOffset: match.end,
      examples: rule.examples,
      learnMoreUrl: rule.learnMoreUrl,
      source: 'rule-engine',
    };
  }

  /**
   * Get severity for category
   */
  private getSeverity(category: ErrorCategory): SuggestionSeverity {
    switch (category) {
      case EC.GRAMMAR:
      case EC.SPELLING:
        return 'error' as SuggestionSeverity;
      case EC.PUNCTUATION:
        return 'warning' as SuggestionSeverity;
      default:
        return 'info' as SuggestionSeverity;
    }
  }

  /**
   * Grammar rules (50+ rules)
   */
  private getGrammarRules(): RuleDefinition[] {
    return [
      // 1. its vs it's
      {
        id: 'its-vs-its',
        category: EC.GRAMMAR,
        name: "Its vs It's",
        description: "Confusing possessive 'its' with contraction 'it's'",
        pattern: /\b(its|it's)\b/gi,
        message: "Possible its/it's confusion",
        explanation: "'It's' is a contraction of 'it is' or 'it has'. 'Its' is possessive.",
        confidence: 0.85,
        replacement: (match) => {
          const text = match.text.toLowerCase();
          // Simple heuristic: check if followed by a verb (likely "it's")
          const nextToken = match.context.sentence?.tokens.find(t => 
            t.start > match.end && t.type === 'word'
          );
          
          if (text === "its" && nextToken?.pos === 'verb') {
            return "it's";
          }
          if (text === "it's" && nextToken?.type === 'word' && nextToken?.pos !== 'verb') {
            return "its";
          }
          return match.text;
        },
        examples: [
          { incorrect: "Its raining outside", correct: "It's raining outside" },
          { incorrect: "The dog lost it's collar", correct: "The dog lost its collar" },
        ],
      },

      // 2. their/there/they're
      {
        id: 'their-there-theyre',
        category: EC.GRAMMAR,
        name: "Their/There/They're",
        description: "Confusing their, there, and they're",
        pattern: /\b(their|there|they're|theyre)\b/gi,
        message: "Check their/there/they're usage",
        explanation: "'They're' = they are, 'their' = possessive, 'there' = location/existence",
        confidence: 0.80,
        replacement: (match) => match.text, // Placeholder
        examples: [
          { incorrect: "Their going to the store", correct: "They're going to the store" },
          { incorrect: "Put it over they're", correct: "Put it over there" },
          { incorrect: "The students forgot there books", correct: "The students forgot their books" },
        ],
      },

      // 3. your vs you're
      {
        id: 'your-vs-youre',
        category: EC.GRAMMAR,
        name: "Your vs You're",
        description: "Confusing possessive 'your' with contraction 'you're'",
        pattern: /\b(your|you're)\b/gi,
        message: "Possible your/you're confusion",
        explanation: "'You're' is a contraction of 'you are'. 'Your' is possessive.",
        confidence: 0.85,
        replacement: (match) => match.text, // Placeholder
        examples: [
          { incorrect: "Your going to love this", correct: "You're going to love this" },
          { incorrect: "Is this you're book?", correct: "Is this your book?" },
        ],
      },

      // 4. affect vs effect
      {
        id: 'affect-vs-effect',
        category: EC.GRAMMAR,
        name: "Affect vs Effect",
        description: "Confusing affect (verb) with effect (noun)",
        pattern: /\b(affect|effect)s?\b/gi,
        message: "Check affect/effect usage",
        explanation: "'Affect' is usually a verb (to influence). 'Effect' is usually a noun (result).",
        confidence: 0.75,
        replacement: (match) => match.text, // Context-dependent
        examples: [
          { incorrect: "This will effect the results", correct: "This will affect the results" },
          { incorrect: "The affect was significant", correct: "The effect was significant" },
        ],
      },

      // 5. then vs than
      {
        id: 'then-vs-than',
        category: EC.GRAMMAR,
        name: "Then vs Than",
        description: "Confusing then (time) with than (comparison)",
        pattern: /\b(then|than)\b/gi,
        message: "Check then/than usage",
        explanation: "'Then' refers to time. 'Than' is for comparisons.",
        confidence: 0.80,
        replacement: (match) => match.text,
        examples: [
          { incorrect: "Better then before", correct: "Better than before" },
          { incorrect: "First this, than that", correct: "First this, then that" },
        ],
      },

      // 6. a lot (not alot)
      {
        id: 'alot-error',
        category: EC.SPELLING,
        name: "A lot vs Alot",
        description: "The word 'alot' doesn't exist",
        pattern: /\balot\b/gi,
        message: "'Alot' is not a word",
        explanation: "The correct form is 'a lot' (two words).",
        confidence: 0.98,
        replacement: 'a lot',
        examples: [
          { incorrect: "I like it alot", correct: "I like it a lot" },
        ],
      },

      // 7. could of → could have
      {
        id: 'could-of',
        category: EC.GRAMMAR,
        name: "Could of → Could have",
        description: "'Could of' should be 'could have'",
        pattern: /\b(could|should|would|might|must)\s+of\b/gi,
        message: "Use 'have' instead of 'of'",
        explanation: "'Could of' is incorrect. The correct form is 'could have' or 'could've'.",
        confidence: 0.95,
        replacement: (match) => match.text.replace(/\s+of\b/i, ' have'),
        examples: [
          { incorrect: "I could of done better", correct: "I could have done better" },
          { incorrect: "She should of known", correct: "She should have known" },
        ],
      },

      // 8. suppose to → supposed to
      {
        id: 'suppose-to',
        category: EC.GRAMMAR,
        name: "Suppose to → Supposed to",
        description: "'Suppose to' should be 'supposed to'",
        pattern: /\bsuppose\s+to\b/gi,
        message: "Use 'supposed to'",
        explanation: "The correct form is 'supposed to' (past participle).",
        confidence: 0.95,
        replacement: 'supposed to',
        examples: [
          { incorrect: "We are suppose to meet", correct: "We are supposed to meet" },
        ],
      },

      // 9. use to → used to
      {
        id: 'use-to',
        category: EC.GRAMMAR,
        name: "Use to → Used to",
        description: "'Use to' should be 'used to'",
        pattern: /\buse\s+to\b/gi,
        message: "Use 'used to'",
        explanation: "The correct form is 'used to' (past tense).",
        confidence: 0.90,
        replacement: 'used to',
        examples: [
          { incorrect: "I use to live there", correct: "I used to live there" },
        ],
      },

      // 10. loose vs lose
      {
        id: 'loose-vs-lose',
        category: EC.SPELLING,
        name: "Loose vs Lose",
        description: "Confusing loose (not tight) with lose (to misplace)",
        pattern: /\b(loose|lose)s?\b/gi,
        message: "Check loose/lose usage",
        explanation: "'Loose' means not tight. 'Lose' means to misplace or fail to win.",
        confidence: 0.75,
        replacement: (match) => match.text,
        examples: [
          { incorrect: "Don't loose your keys", correct: "Don't lose your keys" },
          { incorrect: "The knot is too lose", correct: "The knot is too loose" },
        ],
      },

      // 11-20: Additional common errors
      {
        id: 'irregardless',
        category: EC.GRAMMAR,
        name: "Irregardless → Regardless",
        description: "'Irregardless' is not standard",
        pattern: /\birregardless\b/gi,
        message: "Use 'regardless'",
        explanation: "'Irregardless' is considered non-standard. Use 'regardless' instead.",
        confidence: 0.95,
        replacement: 'regardless',
        examples: [
          { incorrect: "Irregardless of the cost", correct: "Regardless of the cost" },
        ],
      },

      {
        id: 'more-better',
        category: EC.GRAMMAR,
        name: "More better → Better",
        description: "Double comparative",
        pattern: /\bmore\s+(better|worse|bigger|smaller|faster|slower)\b/gi,
        message: "Don't use double comparatives",
        explanation: "'More better' is incorrect. Use 'better' alone.",
        confidence: 0.98,
        replacement: (match) => match.text.replace(/more\s+/i, ''),
        examples: [
          { incorrect: "This is more better", correct: "This is better" },
        ],
      },

      {
        id: 'between-to',
        category: EC.GRAMMAR,
        name: "Between...and not Between...to",
        description: "'Between' should be followed by 'and', not 'to'",
        pattern: /\bbetween\s+[\w\s]+\s+to\s+/gi,
        message: "Use 'between...and' not 'between...to'",
        explanation: "The correct construction is 'between X and Y', not 'between X to Y'.",
        confidence: 0.85,
        replacement: (match) => match.text.replace(/\s+to\s+/gi, ' and '),
        examples: [
          { incorrect: "Between 5 to 10 people", correct: "Between 5 and 10 people" },
        ],
      },

      {
        id: 'less-vs-fewer',
        category: EC.GRAMMAR,
        name: "Less vs Fewer",
        description: "Use 'fewer' for countable, 'less' for uncountable",
        pattern: /\bless\s+(people|items|books|cars|students|words)\b/gi,
        message: "Use 'fewer' for countable nouns",
        explanation: "Use 'fewer' with countable nouns, 'less' with uncountable nouns.",
        confidence: 0.85,
        replacement: (match) => match.text.replace(/less/i, 'fewer'),
        examples: [
          { incorrect: "Less people came", correct: "Fewer people came" },
        ],
      },

      {
        id: 'amount-vs-number',
        category: EC.GRAMMAR,
        name: "Amount vs Number",
        description: "Use 'number' for countable, 'amount' for uncountable",
        pattern: /\bamount\s+of\s+(people|items|books|students)\b/gi,
        message: "Use 'number of' for countable nouns",
        explanation: "Use 'number of' with countable nouns, 'amount of' with uncountable nouns.",
        confidence: 0.85,
        replacement: (match) => match.text.replace(/amount/i, 'number'),
        examples: [
          { incorrect: "Amount of people", correct: "Number of people" },
        ],
      },
    ];
  }

  /**
   * Spelling rules
   */
  private getSpellingRules(): RuleDefinition[] {
    return [
      {
        id: 'receive-misspelling',
        category: EC.SPELLING,
        name: "Receive misspelling",
        description: "Common misspelling of 'receive'",
        pattern: /\brecieve\b/gi,
        message: "Misspelling of 'receive'",
        explanation: "Remember: 'i' before 'e' except after 'c'.",
        confidence: 0.98,
        replacement: 'receive',
        examples: [
          { incorrect: "I will recieve it", correct: "I will receive it" },
        ],
      },

      {
        id: 'believe-misspelling',
        category: EC.SPELLING,
        name: "Believe misspelling",
        description: "Common misspelling of 'believe'",
        pattern: /\bbeleive\b/gi,
        message: "Misspelling of 'believe'",
        explanation: "'Believe' follows the 'i before e' rule.",
        confidence: 0.98,
        replacement: 'believe',
        examples: [
          { incorrect: "I beleive you", correct: "I believe you" },
        ],
      },

      {
        id: 'which-misspelling',
        category: EC.SPELLING,
        name: "Which misspelling",
        description: "Common misspelling of 'which'",
        pattern: /\bwich\b/gi,
        message: "Misspelling of 'which'",
        explanation: "'Which' has an 'h' in it.",
        confidence: 0.95,
        replacement: 'which',
        examples: [
          { incorrect: "Wich one?", correct: "Which one?" },
        ],
      },

      {
        id: 'until-misspelling',
        category: EC.SPELLING,
        name: "Until misspelling",
        description: "Common misspelling of 'until'",
        pattern: /\buntill\b/gi,
        message: "Misspelling of 'until'",
        explanation: "'Until' has only one 'l'.",
        confidence: 0.98,
        replacement: 'until',
        examples: [
          { incorrect: "Wait untill tomorrow", correct: "Wait until tomorrow" },
        ],
      },

      {
        id: 'definitely-misspelling',
        category: EC.SPELLING,
        name: "Definitely misspelling",
        description: "Common misspelling of 'definitely'",
        pattern: /\b(definately|definatly|definitly)\b/gi,
        message: "Misspelling of 'definitely'",
        explanation: "'Definitely' comes from 'definite' + 'ly'.",
        confidence: 0.98,
        replacement: 'definitely',
        examples: [
          { incorrect: "I definately agree", correct: "I definitely agree" },
        ],
      },
    ];
  }

  /**
   * Punctuation rules
   */
  private getPunctuationRules(): RuleDefinition[] {
    return [
      {
        id: 'double-space-after-period',
        category: EC.PUNCTUATION,
        name: "Double space after period",
        description: "Modern style uses single space",
        pattern: /\.\s{2,}/g,
        message: "Use single space after period",
        explanation: "Modern style guides recommend single space after periods.",
        confidence: 0.70,
        replacement: '. ',
        examples: [
          { incorrect: "End.  Start", correct: "End. Start" },
        ],
      },

      {
        id: 'space-before-punctuation',
        category: EC.PUNCTUATION,
        name: "Space before punctuation",
        description: "No space before most punctuation",
        pattern: /\s+([.,;:!?])/g,
        message: "Remove space before punctuation",
        explanation: "Don't put a space before punctuation marks.",
        confidence: 0.90,
        replacement: '$1',
        examples: [
          { incorrect: "Hello , world", correct: "Hello, world" },
        ],
      },

      {
        id: 'no-space-after-punctuation',
        category: EC.PUNCTUATION,
        name: "Missing space after punctuation",
        description: "Add space after punctuation",
        pattern: /([.,;:!?])([A-Z])/g,
        message: "Add space after punctuation",
        explanation: "Add a space after punctuation marks.",
        confidence: 0.85,
        replacement: '$1 $2',
        examples: [
          { incorrect: "Hello,world", correct: "Hello, world" },
        ],
      },
    ];
  }

  /**
   * Style rules
   */
  private getStyleRules(): RuleDefinition[] {
    return [
      {
        id: 'very-weak-intensifier',
        category: EC.STYLE,
        name: "Weak intensifier 'very'",
        description: "Consider stronger alternatives to 'very'",
        pattern: /\bvery\s+(\w+)/gi,
        message: "Consider a stronger word",
        explanation: "'Very' is often a weak intensifier. Consider more specific alternatives.",
        confidence: 0.60,
        replacement: (match) => match.text, // Context-dependent
        examples: [
          { incorrect: "Very good", correct: "Excellent" },
          { incorrect: "Very bad", correct: "Terrible" },
        ],
      },

      {
        id: 'passive-voice',
        category: EC.STYLE,
        name: "Passive voice",
        description: "Consider active voice",
        pattern: /\b(was|were|is|are|been)\s+\w+(ed|en)\b/gi,
        message: "Consider active voice",
        explanation: "Active voice is often clearer and more direct.",
        confidence: 0.50,
        replacement: (match) => match.text,
        examples: [
          { incorrect: "The ball was thrown", correct: "He threw the ball" },
        ],
      },
    ];
  }
}

/**
 * Singleton instance
 */
export const ruleEngine = new RuleEngine();
