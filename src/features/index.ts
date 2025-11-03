/**
 * Advanced Features
 * 
 * Export all advanced feature modules
 */

export { styleAnalyzer, StyleAnalyzer } from './style-analyzer';
export { consistencyChecker, ConsistencyChecker } from './consistency-checker';

export type {
  ReadabilityMetrics,
  StyleIssues,
} from './style-analyzer';

export type {
  ConsistencyIssues,
  TerminologyInconsistency,
  CapitalizationInconsistency,
  SpellingVariantInconsistency,
  NumberFormattingInconsistency,
} from './consistency-checker';
