export interface DocumentStatistics {
  wordCount: number;
  characterCount: number;
  characterCountNoSpaces: number;
  sentenceCount: number;
  paragraphCount: number;
  pageCount: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
  averageWordsPerSentence: number;
  averageWordsPerParagraph: number;
  longestSentence: string;
  shortestSentence: string;
  mostCommonWords: Array<{ word: string; count: number }>;
}

export class StatisticsCalculator {
  calculate(text: string): DocumentStatistics {
    const words = this.getWords(text);
    const sentences = this.getSentences(text);
    const paragraphs = this.getParagraphs(text);

    const wordCount = words.length;
    const characterCount = text.length;
    const characterCountNoSpaces = text.replace(/\s/g, '').length;
    const sentenceCount = sentences.length;
    const paragraphCount = paragraphs.length;
    const pageCount = Math.ceil(wordCount / 250);
    const readingTimeMinutes = Math.ceil(wordCount / 200);
    const speakingTimeMinutes = Math.ceil(wordCount / 130);
    const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    const averageWordsPerParagraph = paragraphCount > 0 ? wordCount / paragraphCount : 0;

    const sentenceLengths = sentences.map(s => ({ sentence: s, length: s.split(/\s+/).length }));
    sentenceLengths.sort((a, b) => b.length - a.length);
    const longestSentence = sentenceLengths[0]?.sentence || '';
    const shortestSentence = sentenceLengths[sentenceLengths.length - 1]?.sentence || '';

    const wordFrequency = new Map<string, number>();
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were']);

    for (const word of words) {
      const lowerWord = word.toLowerCase();
      if (!stopWords.has(lowerWord) && lowerWord.length > 3) {
        wordFrequency.set(lowerWord, (wordFrequency.get(lowerWord) || 0) + 1);
      }
    }

    const mostCommonWords = Array.from(wordFrequency.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      wordCount, characterCount, characterCountNoSpaces, sentenceCount, paragraphCount,
      pageCount, readingTimeMinutes, speakingTimeMinutes, averageWordsPerSentence,
      averageWordsPerParagraph, longestSentence, shortestSentence, mostCommonWords
    };
  }

  private getWords(text: string): string[] {
    return text.match(/\b\w+\b/g) || [];
  }

  private getSentences(text: string): string[] {
    return text.match(/[^.!?]+[.!?]+/g) || [];
  }

  private getParagraphs(text: string): string[] {
    return text.split(/\n\n+/).filter(p => p.trim().length > 0);
  }
}