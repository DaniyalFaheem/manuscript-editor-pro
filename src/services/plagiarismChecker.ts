export interface PlagiarismResult {
  text: string;
  similarity: number;
  startOffset: number;
  endOffset: number;
  possibleSource: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class PlagiarismChecker {
  private commonPhrases: string[] = [
    'in recent years',
    'it is well known that',
    'according to the literature',
    'further research is needed',
    'it should be noted that',
    'as a result of',
    'in order to',
    'on the other hand',
    'in addition to',
    'as mentioned above',
    'for the purpose of',
    'with respect to',
    'in the context of',
    'due to the fact that',
    'in light of',
    'by means of',
    'with regard to',
    'as opposed to',
    'in comparison to',
    'as a consequence',
    'it is important to note',
    'it has been shown',
    'it is clear that',
    'there is evidence to suggest',
    'research has shown',
    'studies have indicated',
    'previous studies',
    'numerous studies',
    'a number of studies',
  ];

  async checkPlagiarism(text: string): Promise<PlagiarismResult[]> {
    const results: PlagiarismResult[] = [];
    
    // Check for overused common phrases
    results.push(...this.detectCommonPhrases(text));
    
    // Check sentence structure similarity (self-plagiarism)
    results.push(...this.analyzeSentenceStructure(text));
    
    // Check for repeated paragraphs
    results.push(...this.detectRepeatedParagraphs(text));
    
    // Check for excessive quotations
    results.push(...this.detectExcessiveQuotations(text));
    
    // Check for missing attributions
    results.push(...this.detectMissingAttributions(text));
    
    // Check paraphrasing quality
    results.push(...this.analyzeParaphrasingQuality(text));
    
    return results;
  }

  private detectCommonPhrases(text: string): PlagiarismResult[] {
    const results: PlagiarismResult[] = [];
    
    for (const phrase of this.commonPhrases) {
      const regex = new RegExp(phrase, 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        results.push({
          text: match[0],
          similarity: 100,
          startOffset: match.index,
          endOffset: match.index + match[0].length,
          severity: 'low',
          possibleSource: 'Common academic phrase - consider rephrasing',
        });
      }
    }
    
    return results;
  }

  private analyzeSentenceStructure(text: string): PlagiarismResult[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const results: PlagiarismResult[] = [];
    
    for (let i = 0; i < sentences.length; i++) {
      for (let j = i + 1; j < sentences.length; j++) {
        const similarity = this.calculateSimilarity(sentences[i], sentences[j]);
        
        if (similarity > 0.85) {
          results.push({
            text: sentences[i],
            similarity: similarity * 100,
            startOffset: text.indexOf(sentences[i]),
            endOffset: text.indexOf(sentences[i]) + sentences[i].length,
            severity: similarity > 0.95 ? 'high' : 'medium',
            possibleSource: 'Similar to another sentence in document',
          });
        }
      }
    }
    
    return results;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    return (longer.length - this.editDistance(longer, shorter)) / longer.length;
  }

  private editDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Detect repeated paragraphs (self-plagiarism)
   */
  private detectRepeatedParagraphs(text: string): PlagiarismResult[] {
    const results: PlagiarismResult[] = [];
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);
    
    for (let i = 0; i < paragraphs.length; i++) {
      for (let j = i + 1; j < paragraphs.length; j++) {
        const similarity = this.calculateSimilarity(
          paragraphs[i].trim(),
          paragraphs[j].trim()
        );
        
        if (similarity > 0.70) {
          const offset = text.indexOf(paragraphs[i]);
          results.push({
            text: paragraphs[i].substring(0, 100) + '...',
            similarity: similarity * 100,
            startOffset: offset,
            endOffset: offset + paragraphs[i].length,
            severity: similarity > 0.90 ? 'critical' : similarity > 0.80 ? 'high' : 'medium',
            possibleSource: 'Self-plagiarism: Similar paragraph found elsewhere in document',
          });
          break;
        }
      }
    }
    
    return results;
  }

  /**
   * Detect excessive quotations
   */
  private detectExcessiveQuotations(text: string): PlagiarismResult[] {
    const results: PlagiarismResult[] = [];
    
    // Find all quoted text
    const quotedTextPattern = /"([^"]{50,})"/g;
    const quotes: { text: string; offset: number }[] = [];
    let match;
    
    while ((match = quotedTextPattern.exec(text)) !== null) {
      quotes.push({
        text: match[1],
        offset: match.index,
      });
    }
    
    // Calculate total quoted words vs total words
    const totalWords = text.split(/\s+/).length;
    const quotedWords = quotes.reduce((sum, q) => sum + q.text.split(/\s+/).length, 0);
    const quotedPercentage = (quotedWords / totalWords) * 100;
    
    if (quotedPercentage > 15) {
      results.push({
        text: 'Document overview',
        similarity: quotedPercentage,
        startOffset: 0,
        endOffset: text.length,
        severity: quotedPercentage > 30 ? 'critical' : quotedPercentage > 20 ? 'high' : 'medium',
        possibleSource: `Excessive quotations: ${quotedPercentage.toFixed(1)}% of text is quoted. Aim for <15% quoted material.`,
      });
    }
    
    // Check for very long quotes (over 100 words)
    for (const quote of quotes) {
      const wordCount = quote.text.split(/\s+/).length;
      if (wordCount > 100) {
        results.push({
          text: quote.text.substring(0, 100) + '...',
          similarity: 100,
          startOffset: quote.offset,
          endOffset: quote.offset + quote.text.length,
          severity: 'medium',
          possibleSource: `Long quotation (${wordCount} words). Consider paraphrasing or using block quote format.`,
        });
      }
    }
    
    return results;
  }

  /**
   * Detect missing attributions for statements that require citations
   */
  private detectMissingAttributions(text: string): PlagiarismResult[] {
    const results: PlagiarismResult[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    // Patterns that typically require citations
    const needsCitationPatterns = [
      /(?:research|studies|evidence|data|findings|results)\s+(?:show|indicate|suggest|demonstrate|reveal)/i,
      /according to/i,
      /it has been (?:found|shown|demonstrated|established)/i,
      /previous (?:research|studies|work)/i,
      /statistics show/i,
      /experts (?:say|believe|argue)/i,
      /researchers (?:found|discovered|observed)/i,
    ];
    
    // Citation patterns
    const citationPattern = /\([A-Z][a-z]+(?:\s+(?:&|and|et al\.)\s+[A-Z][a-z]+)?,?\s+\d{4}\)|\[\d+\]/;
    
    for (const sentence of sentences) {
      const needsCitation = needsCitationPatterns.some(pattern => pattern.test(sentence));
      const hasCitation = citationPattern.test(sentence);
      
      if (needsCitation && !hasCitation) {
        const offset = text.indexOf(sentence);
        results.push({
          text: sentence.trim(),
          similarity: 100,
          startOffset: offset,
          endOffset: offset + sentence.length,
          severity: 'high',
          possibleSource: 'Missing citation: This statement appears to require attribution',
        });
      }
    }
    
    return results;
  }

  /**
   * Analyze paraphrasing quality
   */
  private analyzeParaphrasingQuality(text: string): PlagiarismResult[] {
    const results: PlagiarismResult[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    // Check for sentences that are too similar to common academic patterns
    // This is a simplified check - real paraphrasing detection would be more sophisticated
    for (let i = 0; i < sentences.length - 1; i++) {
      const currentSentence = sentences[i].toLowerCase().trim();
      const nextSentence = sentences[i + 1].toLowerCase().trim();
      
      // Extract content words (excluding common words)
      const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'been', 'be', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can']);
      
      const getContentWords = (sentence: string): Set<string> => {
        const words = sentence.match(/\b\w+\b/g) || [];
        return new Set(words.filter(w => !stopWords.has(w.toLowerCase()) && w.length > 3));
      };
      
      const currentWords = getContentWords(currentSentence);
      const nextWords = getContentWords(nextSentence);
      
      // Calculate word overlap
      const intersection = new Set([...currentWords].filter(w => nextWords.has(w)));
      const union = new Set([...currentWords, ...nextWords]);
      
      const overlap = union.size > 0 ? (intersection.size / union.size) : 0;
      
      // If consecutive sentences share too many content words, might be poor paraphrasing
      if (overlap > 0.6 && currentWords.size > 5 && nextWords.size > 5) {
        const offset = text.indexOf(sentences[i]);
        results.push({
          text: sentences[i].trim(),
          similarity: overlap * 100,
          startOffset: offset,
          endOffset: offset + sentences[i].length,
          severity: 'low',
          possibleSource: 'Potential poor paraphrasing: Consecutive sentences share many similar words',
        });
      }
    }
    
    return results;
  }
}