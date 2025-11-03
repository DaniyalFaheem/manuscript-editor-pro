/**
 * Grammar Analysis Service
 * Integrates AI for grammar checking
 */

import { getAIOrchestrator } from '../index';
import type { AnalysisResult, Suggestion } from '../providers/types';

export class GrammarAnalyzer {
  private orchestrator = getAIOrchestrator();

  /**
   * Check grammar in the given text
   */
  async checkGrammar(text: string): Promise<AnalysisResult> {
    try {
      return await this.orchestrator.analyzeDocument(text, {
        type: 'grammar',
      });
    } catch (error) {
      console.error('Grammar check error:', error);
      return {
        type: 'grammar',
        suggestions: [],
      };
    }
  }

  /**
   * Check grammar for a specific selection
   */
  async checkSelection(
    text: string,
    start: number,
    end: number
  ): Promise<AnalysisResult> {
    const selection = text.substring(start, end);
    const result = await this.checkGrammar(selection);
    
    // Adjust offsets to match full document
    result.suggestions = result.suggestions.map((s) => ({
      ...s,
      offset: s.offset + start,
    }));
    
    return result;
  }

  /**
   * Get quick fixes for common grammar issues
   */
  getQuickFixes(issue: Suggestion): string[] {
    // Return suggested replacements if available
    if (issue.replacements && issue.replacements.length > 0) {
      return issue.replacements;
    }

    // Provide default suggestions based on issue type
    return [];
  }
}

export const grammarAnalyzer = new GrammarAnalyzer();
