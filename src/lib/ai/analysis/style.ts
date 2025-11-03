/**
 * Style Analysis Service
 * Analyzes writing style and provides suggestions
 */

import { getAIOrchestrator } from '../index';
import type { AnalysisResult } from '../providers/types';

export class StyleAnalyzer {
  private orchestrator = getAIOrchestrator();

  /**
   * Analyze writing style
   */
  async analyzeStyle(text: string): Promise<AnalysisResult> {
    try {
      return await this.orchestrator.analyzeDocument(text, {
        type: 'style',
      });
    } catch (error) {
      console.error('Style analysis error:', error);
      return {
        type: 'style',
        suggestions: [],
      };
    }
  }

  /**
   * Detect passive voice usage
   */
  detectPassiveVoice(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const passivePattern = /\b(was|were|is|are|been|being)\s+\w+ed\b/i;
    
    let passiveCount = 0;
    sentences.forEach(sentence => {
      if (passivePattern.test(sentence)) {
        passiveCount++;
      }
    });
    
    return sentences.length > 0 ? (passiveCount / sentences.length) * 100 : 0;
  }

  /**
   * Calculate sentence complexity
   */
  analyzeSentenceComplexity(text: string): {
    avgWordsPerSentence: number;
    complexSentences: number;
  } {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    let totalWords = 0;
    let complexCount = 0;
    
    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/).filter(w => w);
      totalWords += words.length;
      
      // Consider sentences with >25 words as complex
      if (words.length > 25) {
        complexCount++;
      }
    });
    
    return {
      avgWordsPerSentence: sentences.length > 0 ? totalWords / sentences.length : 0,
      complexSentences: complexCount,
    };
  }
}

export const styleAnalyzer = new StyleAnalyzer();
