/**
 * Grammar Analysis Service
 * Integrates AI for grammar, spelling, and punctuation checking
 */

import { getAIOrchestrator } from '../index';
import type { AnalysisResult, Suggestion, Message } from '../providers/types';
import { requestQueue } from '../utils/request-queue';
import { offlineChecker } from '../fallback/offline-checker';

export interface GrammarCheckOptions {
  checkSpelling?: boolean;
  checkPunctuation?: boolean;
  checkGrammar?: boolean;
  context?: string;
}

interface ParsedSuggestion {
  type?: string;
  severity?: string;
  message?: string;
  context?: string;
  offset?: number;
  length?: number;
  replacements?: string[];
}

export class GrammarAnalyzer {
  private orchestrator = getAIOrchestrator();

  /**
   * Comprehensive grammar, spelling, and punctuation check
   */
  async checkAll(text: string, options: GrammarCheckOptions = {}): Promise<AnalysisResult> {
    const {
      checkSpelling = true,
      checkPunctuation = true,
      checkGrammar = true,
    } = options;

    const cacheKey = `grammar-all-${text.substring(0, 100)}`;
    
    return requestQueue.enqueue(
      cacheKey,
      async () => {
        try {
          const provider = await this.orchestrator.getBestProvider();
          if (!provider) {
            return this.getFallbackAnalysis(text);
          }

          // Build comprehensive prompt for AI
          const messages: Message[] = [
            {
              role: 'system',
              content: `You are an expert grammar, spelling, and punctuation checker. Analyze the text and identify all errors with their positions, types, and corrections. 

Return a JSON array of issues in this format:
[
  {
    "type": "grammar" | "spelling" | "punctuation",
    "severity": "error" | "warning" | "info",
    "message": "Brief description of the issue",
    "context": "The surrounding text",
    "offset": start_position,
    "length": error_length,
    "replacements": ["suggestion1", "suggestion2"]
  }
]

Focus on:
${checkGrammar ? '- Grammar errors (subject-verb agreement, tense, articles, etc.)' : ''}
${checkSpelling ? '- Spelling mistakes and typos' : ''}
${checkPunctuation ? '- Punctuation errors (commas, periods, apostrophes, etc.)' : ''}`,
            },
            {
              role: 'user',
              content: `Check this text:\n\n${text}`,
            },
          ];

          const response = await provider.chat(messages, {
            temperature: 0.1, // Low temperature for consistent results
            maxTokens: 2000,
          });

          // Parse AI response
          const suggestions = this.parseAIResponse(response);

          return {
            type: 'grammar',
            suggestions,
          };
        } catch (error) {
          console.error('Grammar check error:', error);
          return this.getFallbackAnalysis(text);
        }
      },
      {
        debounceMs: 500,
        useCache: true,
        priority: 2,
      }
    );
  }

  /**
   * Check grammar in the given text
   */
  async checkGrammar(text: string): Promise<AnalysisResult> {
    return this.checkAll(text, {
      checkGrammar: true,
      checkSpelling: false,
      checkPunctuation: false,
    });
  }

  /**
   * Check spelling in the given text
   */
  async checkSpelling(text: string): Promise<AnalysisResult> {
    return this.checkAll(text, {
      checkGrammar: false,
      checkSpelling: true,
      checkPunctuation: false,
    });
  }

  /**
   * Check punctuation in the given text
   */
  async checkPunctuation(text: string): Promise<AnalysisResult> {
    return this.checkAll(text, {
      checkGrammar: false,
      checkSpelling: false,
      checkPunctuation: true,
    });
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
    const result = await this.checkAll(selection);
    
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

  /**
   * Parse AI response to extract suggestions
   */
  private parseAIResponse(response: string): Suggestion[] {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.map((item: ParsedSuggestion, index: number) => ({
          id: `ai-${index}`,
          type: (item.type || 'grammar') as 'grammar' | 'spelling' | 'punctuation',
          severity: (item.severity || 'warning') as 'error' | 'warning' | 'info',
          message: item.message || 'Issue detected',
          context: item.context || '',
          offset: item.offset || 0,
          length: item.length || 1,
          replacements: item.replacements || [],
        }));
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }

    return [];
  }

  /**
   * Fallback analysis using offline checker
   */
  private getFallbackAnalysis(text: string): AnalysisResult {
    console.info('Using offline fallback checker');
    
    return {
      type: 'grammar',
      suggestions: offlineChecker.checkAll(text),
    };
  }
}

export const grammarAnalyzer = new GrammarAnalyzer();
