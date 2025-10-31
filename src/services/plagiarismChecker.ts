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
  ];

  async checkPlagiarism(text: string): Promise<PlagiarismResult[]> {
    const results: PlagiarismResult[] = [];
    
    // Check for overused common phrases
    results.push(...this.detectCommonPhrases(text));
    
    // Check sentence structure similarity
    results.push(...this.analyzeSentenceStructure(text));
    
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
}