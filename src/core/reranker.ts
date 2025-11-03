/**
 * Reranker
 * 
 * Scores, filters, deduplicates, and prioritizes suggestions
 */

import type { Suggestion } from './types';

/**
 * Reranks and filters suggestions
 */
export class Reranker {
  /**
   * Rerank suggestions by confidence and priority
   */
  public rerank(
    suggestions: Suggestion[],
    options: {
      minConfidence?: number;
      maxSuggestions?: number;
      deduplicateOverlaps?: boolean;
    } = {}
  ): Suggestion[] {
    const {
      minConfidence = 0.5,
      maxSuggestions = 100,
      deduplicateOverlaps = true,
    } = options;

    let filtered = suggestions;

    // Filter by confidence
    filtered = filtered.filter(s => s.confidence >= minConfidence);

    // Deduplicate overlapping suggestions
    if (deduplicateOverlaps) {
      filtered = this.deduplicateOverlaps(filtered);
    }

    // Sort by priority
    filtered = this.sortByPriority(filtered);

    // Limit results
    if (maxSuggestions && filtered.length > maxSuggestions) {
      filtered = filtered.slice(0, maxSuggestions);
    }

    return filtered;
  }

  /**
   * Remove overlapping suggestions, keeping higher-confidence ones
   */
  private deduplicateOverlaps(suggestions: Suggestion[]): Suggestion[] {
    // Sort by confidence (descending)
    const sorted = [...suggestions].sort((a, b) => b.confidence - a.confidence);
    const kept: Suggestion[] = [];

    for (const suggestion of sorted) {
      // Check if this overlaps with any kept suggestion
      const overlaps = kept.some(k => this.doOverlap(k, suggestion));
      
      if (!overlaps) {
        kept.push(suggestion);
      }
    }

    return kept;
  }

  /**
   * Check if two suggestions overlap
   */
  private doOverlap(a: Suggestion, b: Suggestion): boolean {
    return !(a.endOffset <= b.startOffset || b.endOffset <= a.startOffset);
  }

  /**
   * Sort suggestions by priority
   * Priority order: severity > category > confidence > position
   */
  private sortByPriority(suggestions: Suggestion[]): Suggestion[] {
    return [...suggestions].sort((a, b) => {
      // 1. Sort by severity (error > warning > info)
      const severityOrder = { error: 0, warning: 1, info: 2 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;

      // 2. Sort by category (grammar/spelling > punctuation > style)
      const categoryOrder = {
        grammar: 0,
        spelling: 1,
        punctuation: 2,
        style: 3,
        clarity: 4,
        tone: 5,
        consistency: 6,
        academic: 7,
      };
      const categoryDiff = categoryOrder[a.category] - categoryOrder[b.category];
      if (categoryDiff !== 0) return categoryDiff;

      // 3. Sort by confidence (descending)
      const confidenceDiff = b.confidence - a.confidence;
      if (Math.abs(confidenceDiff) > 0.01) return confidenceDiff;

      // 4. Sort by position (ascending)
      return a.startOffset - b.startOffset;
    });
  }

  /**
   * Calculate ensemble score combining rule and ML confidences
   */
  public calculateEnsembleScore(
    ruleConfidence: number,
    mlConfidence?: number,
    weights: { rule: number; ml: number } = { rule: 0.6, ml: 0.4 }
  ): number {
    if (mlConfidence === undefined) {
      return ruleConfidence;
    }

    return ruleConfidence * weights.rule + mlConfidence * weights.ml;
  }

  /**
   * Group suggestions by category
   */
  public groupByCategory(suggestions: Suggestion[]): Map<string, Suggestion[]> {
    const groups = new Map<string, Suggestion[]>();

    for (const suggestion of suggestions) {
      const category = suggestion.category;
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(suggestion);
    }

    return groups;
  }

  /**
   * Filter suggestions by category
   */
  public filterByCategory(
    suggestions: Suggestion[],
    categories: string[]
  ): Suggestion[] {
    const categorySet = new Set(categories);
    return suggestions.filter(s => categorySet.has(s.category));
  }

  /**
   * Get statistics about suggestions
   */
  public getStatistics(suggestions: Suggestion[]): {
    total: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    averageConfidence: number;
  } {
    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let totalConfidence = 0;

    for (const suggestion of suggestions) {
      // Count by category
      byCategory[suggestion.category] = (byCategory[suggestion.category] || 0) + 1;

      // Count by severity
      bySeverity[suggestion.severity] = (bySeverity[suggestion.severity] || 0) + 1;

      // Sum confidence
      totalConfidence += suggestion.confidence;
    }

    return {
      total: suggestions.length,
      byCategory,
      bySeverity,
      averageConfidence: suggestions.length > 0 ? totalConfidence / suggestions.length : 0,
    };
  }
}

/**
 * Singleton instance
 */
export const reranker = new Reranker();
