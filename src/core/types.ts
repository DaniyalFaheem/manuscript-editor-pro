/**
 * Core type definitions for Manuscript Editor Pro
 * 
 * This module defines the fundamental interfaces and types used throughout
 * the writing assistant system.
 */

/**
 * Categories of errors and suggestions
 */
export enum ErrorCategory {
  GRAMMAR = 'grammar',
  SPELLING = 'spelling',
  PUNCTUATION = 'punctuation',
  STYLE = 'style',
  CLARITY = 'clarity',
  TONE = 'tone',
  CONSISTENCY = 'consistency',
  ACADEMIC = 'academic',
}

/**
 * Severity levels for suggestions
 */
export enum SuggestionSeverity {
  ERROR = 'error',      // Definite error, should be fixed
  WARNING = 'warning',  // Likely issue, review recommended
  INFO = 'info',        // Suggestion for improvement
}

/**
 * A text suggestion with error details and correction
 */
export interface Suggestion {
  /** Unique identifier for this suggestion */
  id: string;

  /** Category of the issue */
  category: ErrorCategory;

  /** Type identifier (matches rule ID) */
  type: string;

  /** Severity of the issue */
  severity: SuggestionSeverity;

  /** Short message describing the issue */
  message: string;

  /** Detailed explanation of why this is wrong and how to fix it */
  explanation: string;

  /** Confidence score (0.0 to 1.0) */
  confidence: number;

  /** The original text that triggered this suggestion */
  original: string;

  /** Suggested replacement text */
  replacement: string | string[];

  /** Start position in the document */
  startOffset: number;

  /** End position in the document */
  endOffset: number;

  /** Optional: Line number where issue starts */
  startLine?: number;

  /** Optional: Line number where issue ends */
  endLine?: number;

  /** Optional: Column number where issue starts */
  startColumn?: number;

  /** Optional: Column number where issue ends */
  endColumn?: number;

  /** Optional: Context around the error */
  context?: {
    before: string;
    after: string;
  };

  /** Optional: Examples of correct usage */
  examples?: Array<{
    incorrect: string;
    correct: string;
  }>;

  /** Optional: Link to learn more */
  learnMoreUrl?: string;

  /** Source of this suggestion (rule engine, ML, etc.) */
  source: 'rule-engine' | 'ml-engine' | 'style-analyzer' | 'other';
}

/**
 * Result from checking a text document
 */
export interface CheckResult {
  /** Array of suggestions found */
  suggestions: Suggestion[];

  /** Processing time in milliseconds */
  processingTime: number;

  /** Text that was checked */
  text: string;

  /** Metadata about the check */
  metadata: {
    /** Rules evaluated */
    rulesEvaluated: number;

    /** ML models used */
    modelsUsed: string[];

    /** Timestamp of check */
    timestamp: Date;
  };
}

/**
 * Definition of a grammar/style rule
 */
export interface RuleDefinition {
  /** Unique identifier for this rule */
  id: string;

  /** Category this rule belongs to */
  category: ErrorCategory;

  /** Name of the rule */
  name: string;

  /** Description of what this rule checks */
  description: string;

  /** Pattern to match (regex or function) */
  pattern: RegExp | ((tokens: Token[], context: DocumentContext) => Match[]);

  /** Short message to show user */
  message: string | ((match: Match) => string);

  /** Detailed explanation */
  explanation: string | ((match: Match) => string);

  /** Base confidence score (0.0 to 1.0) */
  confidence: number;

  /** Function to generate replacement */
  replacement: string | ((match: Match) => string | string[]);

  /** Example cases */
  examples: Array<{
    incorrect: string;
    correct: string;
    explanation?: string;
  }>;

  /** Optional: Tags for categorization */
  tags?: string[];

  /** Optional: Link to grammar resource */
  learnMoreUrl?: string;

  /** Whether this rule is enabled by default */
  enabled?: boolean;
}

/**
 * A token in the text
 */
export interface Token {
  /** The token text */
  text: string;

  /** Token type (word, punctuation, etc.) */
  type: 'word' | 'punctuation' | 'whitespace' | 'number' | 'symbol';

  /** Start position in document */
  start: number;

  /** End position in document */
  end: number;

  /** Part of speech tag (if available) */
  pos?: string;

  /** Lemma (base form) */
  lemma?: string;

  /** Sentence index */
  sentenceIndex?: number;

  /** Index within sentence */
  indexInSentence?: number;
}

/**
 * A sentence in the document
 */
export interface Sentence {
  /** Sentence text */
  text: string;

  /** Tokens in this sentence */
  tokens: Token[];

  /** Start position */
  start: number;

  /** End position */
  end: number;

  /** Sentence index in document */
  index: number;
}

/**
 * A paragraph in the document
 */
export interface Paragraph {
  /** Paragraph text */
  text: string;

  /** Sentences in this paragraph */
  sentences: Sentence[];

  /** Start position */
  start: number;

  /** End position */
  end: number;

  /** Paragraph index in document */
  index: number;
}

/**
 * Context for a match
 */
export interface Match {
  /** Matched text */
  text: string;

  /** Start position */
  start: number;

  /** End position */
  end: number;

  /** Tokens that matched */
  tokens: Token[];

  /** Context */
  context: {
    /** Previous tokens */
    prev?: Token[];

    /** Next tokens */
    next?: Token[];

    /** Current sentence */
    sentence?: Sentence;

    /** Current paragraph */
    paragraph?: Paragraph;
  };

  /** Captured groups (if regex pattern) */
  groups?: Record<string, string>;
}

/**
 * Document context for analysis
 */
export interface DocumentContext {
  /** Full document text */
  text: string;

  /** All sentences */
  sentences: Sentence[];

  /** All paragraphs */
  paragraphs: Paragraph[];

  /** All tokens */
  tokens: Token[];

  /** Detected language */
  language?: string;

  /** Language variant (US, UK, etc.) */
  variant?: string;

  /** Document metadata */
  metadata?: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
  };
}

/**
 * Configuration for ML models
 */
export interface ModelConfig {
  /** Model name */
  name: string;

  /** Task type */
  task: 'grammar' | 'paraphrase' | 'style' | 'tone' | 'similarity';

  /** Path to model file (ONNX) */
  modelPath: string;

  /** Path to tokenizer config */
  tokenizerPath?: string;

  /** Maximum input length */
  maxLength: number;

  /** Batch size for inference */
  batchSize: number;

  /** Model size in MB */
  size: number;

  /** Whether to load this model by default */
  autoLoad?: boolean;

  /** Minimum confidence threshold */
  confidenceThreshold?: number;
}

/**
 * Result from ML inference
 */
export interface MLInferenceResult {
  /** Suggestions generated */
  suggestions: Suggestion[];

  /** Model that generated suggestions */
  model: string;

  /** Inference time in ms */
  inferenceTime: number;

  /** Confidence scores */
  confidences: number[];
}

/**
 * Options for text analysis
 */
export interface AnalysisOptions {
  /** Categories to check */
  categories?: ErrorCategory[];

  /** Minimum confidence threshold */
  minConfidence?: number;

  /** Enable ML features */
  enableML?: boolean;

  /** Language variant */
  languageVariant?: 'US' | 'UK' | 'CA' | 'AU';

  /** Target audience */
  audience?: 'general' | 'academic' | 'business' | 'creative';

  /** Formality level */
  formality?: 'casual' | 'neutral' | 'formal';

  /** Maximum suggestions to return */
  maxSuggestions?: number;
}

/**
 * Cache entry for processed text
 */
export interface CacheEntry {
  /** Text that was cached */
  text: string;

  /** Hash of the text */
  hash: string;

  /** Cached suggestions */
  suggestions: Suggestion[];

  /** When this was cached */
  timestamp: Date;

  /** Options used for analysis */
  options: AnalysisOptions;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Preprocessing time */
  preprocessingMs: number;

  /** Rule engine time */
  ruleEngineMs: number;

  /** ML engine time */
  mlEngineMs: number;

  /** Reranking time */
  rerankingMs: number;

  /** Total time */
  totalMs: number;

  /** Number of suggestions */
  suggestionCount: number;

  /** Cache hit rate */
  cacheHitRate?: number;
}
