/**
 * Quality Metrics Service
 * Calculates document quality metrics
 */

import type { QualityMetrics } from '../providers/types';
import { styleAnalyzer } from './style';
import { citationAnalyzer } from './citations';

export class MetricsCalculator {
  /**
   * Calculate comprehensive quality metrics
   */
  async calculateMetrics(text: string): Promise<QualityMetrics> {
    const wordCount = this.countWords(text);
    const readabilityGrade = this.calculateReadabilityGrade(text);
    const passiveVoicePercent = styleAnalyzer.detectPassiveVoice(text);
    const citations = citationAnalyzer.extractCitations(text);
    
    // Calculate individual scores
    const grammarAccuracy = 95; // Placeholder - would come from actual grammar check
    const styleConsistency = this.calculateStyleConsistency(text);
    const citationCompleteness = this.calculateCitationCompleteness(citations, wordCount);
    
    // Calculate overall score (weighted average)
    const overallScore = (
      grammarAccuracy * 0.4 +
      styleConsistency * 0.3 +
      citationCompleteness * 0.2 +
      Math.max(0, 100 - Math.abs(readabilityGrade - 12) * 5) * 0.1
    );
    
    const improvements: string[] = [];
    
    if (grammarAccuracy < 90) {
      improvements.push('Fix grammar errors to improve accuracy');
    }
    if (passiveVoicePercent > 20) {
      improvements.push('Reduce passive voice usage for clearer writing');
    }
    if (readabilityGrade > 18) {
      improvements.push('Simplify sentence structure for better readability');
    }
    if (citationCompleteness < 50) {
      improvements.push('Add more citations to support claims');
    }
    
    return {
      overallScore: Math.round(overallScore),
      grammarAccuracy,
      styleConsistency: Math.round(styleConsistency),
      citationCompleteness: Math.round(citationCompleteness),
      readabilityGrade: Math.round(readabilityGrade * 10) / 10,
      wordCount,
      improvements,
    };
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  private calculateReadabilityGrade(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const words = text.trim().split(/\s+/).filter(w => w);
    const syllables = this.countSyllables(text);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    // Flesch-Kincaid Grade Level
    const grade = 0.39 * (words.length / sentences.length) + 
                  11.8 * (syllables / words.length) - 15.59;
    
    return Math.max(0, grade);
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;
    
    words.forEach(word => {
      // Simple syllable counting heuristic
      word = word.replace(/[^a-z]/g, '');
      if (word.length <= 3) {
        count += 1;
      } else {
        const matches = word.match(/[aeiouy]{1,2}/g);
        count += matches ? matches.length : 1;
      }
    });
    
    return count;
  }

  private calculateStyleConsistency(text: string): number {
    // Check for consistent sentence structure and tone
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    if (sentences.length === 0) return 100;
    
    const sentenceLengths = sentences.map(s => 
      s.trim().split(/\s+/).filter(w => w).length
    );
    
    // Calculate standard deviation of sentence lengths
    const avg = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, len) => 
      sum + Math.pow(len - avg, 2), 0
    ) / sentenceLengths.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation = more consistent
    // Convert to score (0-100)
    const consistencyScore = Math.max(0, 100 - stdDev * 2);
    
    return consistencyScore;
  }

  private calculateCitationCompleteness(citations: string[], wordCount: number): number {
    // Academic papers typically have 1 citation per 100-200 words
    const expectedCitations = wordCount / 150;
    const actualCitations = citations.length;
    
    if (expectedCitations === 0) return 100;
    
    const ratio = actualCitations / expectedCitations;
    
    // Score: 100% if ratio is 1, decreasing as it deviates
    return Math.min(100, ratio * 100);
  }
}

export const metricsCalculator = new MetricsCalculator();
