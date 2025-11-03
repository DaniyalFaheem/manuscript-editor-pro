/**
 * Writing Analytics Service
 * 
 * Provides comprehensive writing statistics, productivity tracking,
 * and insights about writing patterns.
 */

export interface WritingMetrics {
  // Basic counts
  wordCount: number;
  characterCount: number;
  characterCountNoSpaces: number;
  sentenceCount: number;
  paragraphCount: number;
  
  // Averages
  averageWordLength: number;
  averageSentenceLength: number;
  averageParagraphLength: number;
  
  // Time estimates
  readingTime: string; // in minutes
  speakingTime: string; // in minutes
  
  // Vocabulary metrics
  vocabularyDiversity: number; // 0-100 score
  uniqueWords: number;
  
  // Sentence complexity
  complexSentences: number;
  simpleSentences: number;
  compoundSentences: number;
  
  // Writing patterns
  passiveVoicePercentage: number;
  transitionalPhrases: number;
  
  // Document structure
  headingCount: number;
  listCount: number;
  
  // Advanced metrics
  sentenceLengthVariety: number; // 0-100 score for variety
  paragraphLengthVariety: number; // 0-100 score for variety
}

export interface ProductivityStats {
  totalWords: number;
  sessionDuration: number; // in seconds
  wordsPerMinute: number;
  editCount: number;
  lastEditTimestamp: number;
}

export class WritingAnalytics {
  private sessionStartTime: number = Date.now();
  private editCount: number = 0;
  private initialWordCount: number = 0;
  
  /**
   * Calculate comprehensive writing metrics
   */
  public calculateMetrics(text: string): WritingMetrics {
    // Basic counts
    const wordCount = this.countWords(text);
    const characterCount = text.length;
    const characterCountNoSpaces = text.replace(/\s/g, '').length;
    const sentenceCount = this.countSentences(text);
    const paragraphCount = this.countParagraphs(text);
    
    // Averages
    const averageWordLength = characterCountNoSpaces / Math.max(1, wordCount);
    const averageSentenceLength = wordCount / Math.max(1, sentenceCount);
    const averageParagraphLength = sentenceCount / Math.max(1, paragraphCount);
    
    // Time estimates (average reading speed: 200-250 words/min, speaking: 125-150 words/min)
    const readingMinutes = wordCount / 225;
    const speakingMinutes = wordCount / 140;
    
    const readingTime = this.formatTime(readingMinutes);
    const speakingTime = this.formatTime(speakingMinutes);
    
    // Vocabulary metrics
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const uniqueWords = new Set(words).size;
    const vocabularyDiversity = wordCount > 0 ? Math.round((uniqueWords / wordCount) * 100) : 0;
    
    // Sentence complexity
    const sentenceLengths = this.getSentenceLengths(text);
    const complexSentences = sentenceLengths.filter(len => len > 25).length;
    const simpleSentences = sentenceLengths.filter(len => len <= 15).length;
    const compoundSentences = sentenceLengths.filter(len => len > 15 && len <= 25).length;
    
    // Writing patterns
    const passiveVoicePercentage = this.calculatePassiveVoicePercentage(text, sentenceCount);
    const transitionalPhrases = this.countTransitionalPhrases(text);
    
    // Document structure
    const headingCount = this.countHeadings(text);
    const listCount = this.countLists(text);
    
    // Variety scores
    const sentenceLengthVariety = this.calculateVariety(sentenceLengths);
    const paragraphLengthVariety = this.calculateVariety(this.getParagraphLengths(text));
    
    return {
      wordCount,
      characterCount,
      characterCountNoSpaces,
      sentenceCount,
      paragraphCount,
      averageWordLength: Math.round(averageWordLength * 10) / 10,
      averageSentenceLength: Math.round(averageSentenceLength * 10) / 10,
      averageParagraphLength: Math.round(averageParagraphLength * 10) / 10,
      readingTime,
      speakingTime,
      vocabularyDiversity,
      uniqueWords,
      complexSentences,
      simpleSentences,
      compoundSentences,
      passiveVoicePercentage,
      transitionalPhrases,
      headingCount,
      listCount,
      sentenceLengthVariety,
      paragraphLengthVariety,
    };
  }
  
  /**
   * Track productivity during writing session
   */
  public trackEdit(currentWordCount: number): void {
    if (this.initialWordCount === 0) {
      this.initialWordCount = currentWordCount;
    }
    this.editCount++;
  }
  
  /**
   * Get productivity statistics for current session
   */
  public getProductivityStats(currentWordCount: number): ProductivityStats {
    const now = Date.now();
    const sessionDuration = (now - this.sessionStartTime) / 1000; // in seconds
    const totalWords = currentWordCount - this.initialWordCount;
    const wordsPerMinute = (totalWords / Math.max(1, sessionDuration / 60));
    
    return {
      totalWords: Math.max(0, totalWords),
      sessionDuration: Math.round(sessionDuration),
      wordsPerMinute: Math.round(wordsPerMinute * 10) / 10,
      editCount: this.editCount,
      lastEditTimestamp: now,
    };
  }
  
  /**
   * Reset session tracking
   */
  public resetSession(currentWordCount: number): void {
    this.sessionStartTime = Date.now();
    this.editCount = 0;
    this.initialWordCount = currentWordCount;
  }
  
  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
  
  /**
   * Count sentences in text
   */
  private countSentences(text: string): number {
    const sentences = text.match(/[.!?]+/g);
    return sentences ? sentences.length : Math.max(1, text.length > 0 ? 1 : 0);
  }
  
  /**
   * Count paragraphs in text
   */
  private countParagraphs(text: string): number {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    return Math.max(1, paragraphs.length);
  }
  
  /**
   * Get sentence lengths
   */
  private getSentenceLengths(text: string): number[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.map(s => s.trim().split(/\s+/).length);
  }
  
  /**
   * Get paragraph lengths
   */
  private getParagraphLengths(text: string): number[] {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    return paragraphs.map(p => p.trim().split(/\s+/).length);
  }
  
  /**
   * Calculate passive voice percentage
   */
  private calculatePassiveVoicePercentage(text: string, sentenceCount: number): number {
    // Simple passive voice detection
    const passivePatterns = [
      /\b(is|are|was|were|been|be|being)\s+\w+ed\b/gi,
      /\b(is|are|was|were|been|be|being)\s+\w+en\b/gi,
    ];
    
    let passiveCount = 0;
    for (const pattern of passivePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        passiveCount += matches.length;
      }
    }
    
    return sentenceCount > 0 ? Math.round((passiveCount / sentenceCount) * 100) : 0;
  }
  
  /**
   * Count transitional phrases
   */
  private countTransitionalPhrases(text: string): number {
    const transitionalPhrases = [
      /\bhowever\b/gi,
      /\btherefore\b/gi,
      /\bmoreover\b/gi,
      /\bfurthermore\b/gi,
      /\bnevertheless\b/gi,
      /\bconsequently\b/gi,
      /\bin addition\b/gi,
      /\bfor example\b/gi,
      /\bin contrast\b/gi,
      /\bon the other hand\b/gi,
    ];
    
    let count = 0;
    for (const pattern of transitionalPhrases) {
      const matches = text.match(pattern);
      if (matches) {
        count += matches.length;
      }
    }
    
    return count;
  }
  
  /**
   * Count headings in text (markdown style)
   */
  private countHeadings(text: string): number {
    const headings = text.match(/^#+\s+/gm);
    return headings ? headings.length : 0;
  }
  
  /**
   * Count lists in text (markdown style)
   */
  private countLists(text: string): number {
    const lists = text.match(/^[\s]*[-*+]\s+/gm);
    return lists ? lists.length : 0;
  }
  
  /**
   * Calculate variety score (0-100) based on standard deviation
   */
  private calculateVariety(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Normalize to 0-100 scale (higher std dev = more variety)
    // Typical std dev for sentence length is 5-15
    const normalizedScore = Math.min(100, (stdDev / 15) * 100);
    
    return Math.round(normalizedScore);
  }
  
  /**
   * Format time in minutes to human-readable string
   */
  private formatTime(minutes: number): string {
    if (minutes < 1) {
      return '< 1 min';
    } else if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `${hours}h ${mins}m`;
    }
  }
}

export default new WritingAnalytics();
