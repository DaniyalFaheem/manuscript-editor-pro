/**
 * Citation Analysis Service
 * Validates citations and references
 */

import { getAIOrchestrator } from '../index';
import type { AnalysisResult } from '../providers/types';

export class CitationAnalyzer {
  private orchestrator = getAIOrchestrator();

  /**
   * Validate citations in the text
   */
  async validateCitations(text: string, style: string = 'APA'): Promise<AnalysisResult> {
    try {
      return await this.orchestrator.analyzeDocument(text, {
        type: 'citations',
        options: { style },
      });
    } catch (error) {
      console.error('Citation validation error:', error);
      return {
        type: 'citations',
        suggestions: [],
      };
    }
  }

  /**
   * Detect citation style used in document
   */
  detectCitationStyle(text: string): string {
    // Simple pattern matching for common citation styles
    if (text.match(/\([A-Z][a-z]+,\s+\d{4}\)/)) {
      return 'APA';
    } else if (text.match(/\([A-Z][a-z]+\s+\d+\)/)) {
      return 'MLA';
    } else if (text.match(/\[\d+\]/)) {
      return 'IEEE';
    }
    return 'Unknown';
  }

  /**
   * Extract all citations from text
   */
  extractCitations(text: string): string[] {
    const citations: string[] = [];
    
    // Match various citation patterns
    const patterns = [
      /\([A-Z][a-z]+(?:,\s*\d{4})?(?:,\s*p\.\s*\d+)?\)/g, // APA style
      /\([A-Z][a-z]+\s+\d+\)/g, // MLA style
      /\[\d+\]/g, // IEEE style
    ];
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        citations.push(...matches);
      }
    });
    
    return [...new Set(citations)]; // Remove duplicates
  }
}

export const citationAnalyzer = new CitationAnalyzer();
