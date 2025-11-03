/**
 * Plagiarism Detection Service
 * Detects potential plagiarism and similarity issues
 */

import { getAIOrchestrator } from '../index';
import type { AnalysisResult } from '../providers/types';

export class PlagiarismDetector {
  private orchestrator = getAIOrchestrator();

  /**
   * Check for potential plagiarism
   */
  async checkPlagiarism(text: string): Promise<AnalysisResult> {
    try {
      return await this.orchestrator.analyzeDocument(text, {
        type: 'plagiarism',
      });
    } catch (error) {
      console.error('Plagiarism check error:', error);
      return {
        type: 'plagiarism',
        suggestions: [],
      };
    }
  }

  /**
   * Detect common phrases that might be plagiarized
   */
  detectCommonPhrases(text: string): string[] {
    const commonPhrases: string[] = [];
    
    // Split into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    // Look for very long sentences with formal academic language
    // (potentially copied from sources)
    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/);
      if (words.length > 30) {
        // Long sentence - might be copied
        const academicMarkers = [
          'furthermore', 'moreover', 'consequently', 'therefore',
          'specifically', 'particularly', 'accordingly'
        ];
        
        const hasAcademicMarkers = academicMarkers.some(marker =>
          sentence.toLowerCase().includes(marker)
        );
        
        if (hasAcademicMarkers) {
          commonPhrases.push(sentence.trim());
        }
      }
    });
    
    return commonPhrases;
  }

  /**
   * Calculate originality percentage (simplified)
   */
  calculateOriginality(text: string): number {
    // This is a simplified calculation
    // Real plagiarism detection would require external databases
    const commonPhrases = this.detectCommonPhrases(text);
    const totalSentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    
    if (totalSentences === 0) return 100;
    
    const suspiciousRatio = commonPhrases.length / totalSentences;
    return Math.max(0, Math.min(100, (1 - suspiciousRatio) * 100));
  }
}

export const plagiarismDetector = new PlagiarismDetector();
