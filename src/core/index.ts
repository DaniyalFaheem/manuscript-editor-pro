/**
 * Core Analysis Pipeline
 * 
 * Main exports for the writing assistant core functionality
 */

// Type definitions
export * from './types';

// Core modules
export { preprocessor, Preprocessor } from './preprocessor';
export { ruleEngine, RuleEngine } from './rule-engine';
export { mlEngine, MLEngine } from './ml-engine';
export { reranker, Reranker } from './reranker';
export { explainer, Explainer } from './explainer';

// Re-export commonly used types
export type {
  Suggestion,
  CheckResult,
  RuleDefinition,
  DocumentContext,
  Token,
  Sentence,
  Paragraph,
  AnalysisOptions,
  PerformanceMetrics,
} from './types';
