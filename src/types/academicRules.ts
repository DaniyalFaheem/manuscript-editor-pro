/**
 * Type definitions for academic grammar rules
 */

/**
 * Rule categories for academic writing
 */
export type RuleCategory = 
  | 'grammar'           // Fundamental grammar rules
  | 'academic-tone'     // Academic formality and tone
  | 'citation'          // Citation and methodology language
  | 'punctuation'       // Punctuation and formatting
  | 'wordiness'         // Redundancy and wordiness
  | 'spelling';         // Academic spelling and terminology

/**
 * Rule type classification
 */
export type RuleType = 'grammar' | 'punctuation' | 'style' | 'spelling';

/**
 * Rule severity levels
 */
export type RuleSeverity = 'error' | 'warning' | 'info';

/**
 * Context information for applying rules
 */
export interface RuleContext {
  text: string;
  sentenceStart: number;
  sentenceEnd: number;
  paragraphStart: number;
  paragraphEnd: number;
  sectionType?: 'abstract' | 'introduction' | 'methodology' | 'results' | 'discussion' | 'conclusion';
}

/**
 * Example of incorrect and correct usage
 */
export interface RuleExample {
  incorrect: string;
  correct: string;
}

/**
 * Academic grammar rule definition
 */
export interface AcademicGrammarRule {
  id: string;
  pattern: RegExp;
  message: string;
  suggestion?: (match: RegExpExecArray, context?: RuleContext) => string | string[];
  type: RuleType;
  severity: RuleSeverity;
  category: RuleCategory;
  explanation?: string;
  examples?: RuleExample[];
  contextFilter?: (context: RuleContext, match: RegExpExecArray) => boolean;
}

/**
 * Match result from applying a rule
 */
export interface RuleMatch {
  ruleId: string;
  startOffset: number;
  endOffset: number;
  original: string;
  message: string;
  suggestions: string[];
  type: RuleType;
  severity: RuleSeverity;
  category: RuleCategory;
  explanation?: string;
}
