/**
 * Text Preprocessor
 * 
 * Transforms raw text into structured, analyzable units including:
 * - Sentence segmentation
 * - Tokenization
 * - Language detection
 * - Document structure analysis
 */

import type {
  Token,
  Sentence,
  Paragraph,
  DocumentContext,
} from './types';

/**
 * Common abbreviations that don't end sentences
 */
const ABBREVIATIONS = new Set([
  'dr', 'mr', 'mrs', 'ms', 'prof', 'sr', 'jr',
  'ph.d', 'm.d', 'b.a', 'm.a', 'd.d.s', 'dds',
  'inc', 'ltd', 'co', 'corp',
  'vs', 'etc', 'e.g', 'i.e', 'viz', 'cf',
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun',
]);

/**
 * Preprocesses text into a structured document context
 */
export class Preprocessor {
  /**
   * Process text and return document context
   */
  public process(text: string): DocumentContext {
    // Normalize text
    const normalizedText = this.normalize(text);

    // Segment into paragraphs
    const paragraphs = this.segmentParagraphs(normalizedText);

    // Segment into sentences
    const sentences: Sentence[] = [];
    let sentenceIndex = 0;

    for (const paragraph of paragraphs) {
      const paragraphSentences = this.segmentSentences(
        paragraph.text,
        paragraph.start,
        sentenceIndex
      );
      sentences.push(...paragraphSentences);
      sentenceIndex += paragraphSentences.length;
      paragraph.sentences = paragraphSentences;
    }

    // Tokenize all sentences
    for (const sentence of sentences) {
      sentence.tokens = this.tokenize(sentence.text, sentence.start, sentence.index);
    }

    // Extract all tokens
    const allTokens = sentences.flatMap(s => s.tokens);

    // Detect language
    const language = this.detectLanguage(normalizedText);

    return {
      text: normalizedText,
      sentences,
      paragraphs,
      tokens: allTokens,
      language,
      metadata: {
        wordCount: allTokens.filter(t => t.type === 'word').length,
        sentenceCount: sentences.length,
        paragraphCount: paragraphs.length,
      },
    };
  }

  /**
   * Normalize text (trim, fix whitespace, etc.)
   */
  private normalize(text: string): string {
    return text
      // Remove zero-width characters
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Normalize quotes
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      // Normalize dashes
      .replace(/—/g, '--')
      .replace(/–/g, '-')
      // Normalize whitespace
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove multiple spaces (but preserve intentional formatting)
      .replace(/ {3,}/g, '  ')
      .trim();
  }

  /**
   * Segment text into paragraphs
   */
  private segmentParagraphs(text: string): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    
    // Split by double newlines or more
    const paragraphTexts = text.split(/\n\s*\n/);
    
    let currentPos = 0;
    let paragraphIndex = 0;

    for (const paragraphText of paragraphTexts) {
      const trimmed = paragraphText.trim();
      if (trimmed.length === 0) {
        currentPos += paragraphText.length + 2; // Account for newlines
        continue;
      }

      // Find actual position in original text
      const start = text.indexOf(trimmed, currentPos);
      const end = start + trimmed.length;

      paragraphs.push({
        text: trimmed,
        sentences: [], // Will be filled later
        start,
        end,
        index: paragraphIndex++,
      });

      currentPos = end;
    }

    return paragraphs;
  }

  /**
   * Segment text into sentences
   */
  private segmentSentences(
    text: string,
    offset: number = 0,
    startIndex: number = 0
  ): Sentence[] {
    const sentences: Sentence[] = [];
    let currentPos = 0;
    let sentenceStart = 0;
    let sentenceIndex = startIndex;

    while (currentPos < text.length) {
      const char = text[currentPos];

      // Check for sentence-ending punctuation
      if (char === '.' || char === '!' || char === '?') {
        // Look ahead to determine if this truly ends a sentence
        const nextChar = text[currentPos + 1];
        const prevChars = text.slice(Math.max(0, currentPos - 10), currentPos).toLowerCase();

        // Check if this is an abbreviation
        const isAbbreviation = this.isAbbreviation(prevChars);

        // Check if next char is uppercase (likely new sentence)
        const nextIsUpper = nextChar && /[A-Z]/.test(nextChar);

        // Check if this is end of text
        const isEndOfText = currentPos === text.length - 1;

        // Determine if this ends a sentence
        const endsSentence = 
          isEndOfText ||
          (!isAbbreviation && (nextIsUpper || nextChar === ' ' || nextChar === '\n'));

        if (endsSentence) {
          // Extract sentence
          let sentenceEnd = currentPos + 1;
          
          // Include trailing whitespace in sentence
          while (sentenceEnd < text.length && /\s/.test(text[sentenceEnd])) {
            sentenceEnd++;
          }

          const sentenceText = text.slice(sentenceStart, sentenceEnd).trim();
          
          if (sentenceText.length > 0) {
            sentences.push({
              text: sentenceText,
              tokens: [], // Will be filled later
              start: offset + sentenceStart,
              end: offset + sentenceEnd,
              index: sentenceIndex++,
            });
          }

          sentenceStart = sentenceEnd;
          currentPos = sentenceEnd;
          continue;
        }
      }

      currentPos++;
    }

    // Handle any remaining text as final sentence
    if (sentenceStart < text.length) {
      const sentenceText = text.slice(sentenceStart).trim();
      if (sentenceText.length > 0) {
        sentences.push({
          text: sentenceText,
          tokens: [],
          start: offset + sentenceStart,
          end: offset + text.length,
          index: sentenceIndex,
        });
      }
    }

    return sentences;
  }

  /**
   * Check if text ends with an abbreviation
   */
  private isAbbreviation(text: string): boolean {
    const words = text.trim().split(/\s+/);
    const lastWord = words[words.length - 1]?.toLowerCase().replace(/\.$/, '');
    return ABBREVIATIONS.has(lastWord);
  }

  /**
   * Tokenize text into tokens
   */
  private tokenize(
    text: string,
    offset: number = 0,
    sentenceIndex: number = 0
  ): Token[] {
    const tokens: Token[] = [];
    let indexInSentence = 0;

    // Regex to match word, punctuation, whitespace, number, or symbol
    const tokenRegex = /(\w+(?:'\w+)?)|([.,;:!?()[\]{}"'])|(\s+)|(\d+)/g;
    let match;

    while ((match = tokenRegex.exec(text)) !== null) {
      const [fullMatch, word, punct, whitespace, number] = match;
      const start = offset + match.index;
      const end = start + fullMatch.length;

      let type: Token['type'];
      if (word) {
        type = 'word';
      } else if (punct) {
        type = 'punctuation';
      } else if (whitespace) {
        type = 'whitespace';
      } else if (number) {
        type = 'number';
      } else {
        type = 'symbol';
      }

      tokens.push({
        text: fullMatch,
        type,
        start,
        end,
        sentenceIndex,
        indexInSentence: type !== 'whitespace' ? indexInSentence++ : undefined,
        lemma: word ? this.getLemma(word) : undefined,
      });
    }

    return tokens;
  }

  /**
   * Get lemma (base form) of a word
   * Simple implementation - can be enhanced with NLP library
   */
  private getLemma(word: string): string {
    const lowerWord = word.toLowerCase();

    // Simple pluralization rules
    if (lowerWord.endsWith('ies') && lowerWord.length > 4) {
      return lowerWord.slice(0, -3) + 'y';
    }
    if (lowerWord.endsWith('es') && lowerWord.length > 3) {
      return lowerWord.slice(0, -2);
    }
    if (lowerWord.endsWith('s') && lowerWord.length > 2) {
      return lowerWord.slice(0, -1);
    }

    // Simple past tense rules
    if (lowerWord.endsWith('ed') && lowerWord.length > 3) {
      return lowerWord.slice(0, -2);
    }
    if (lowerWord.endsWith('ing') && lowerWord.length > 4) {
      return lowerWord.slice(0, -3);
    }

    return lowerWord;
  }

  /**
   * Detect language (simple heuristic, can be enhanced)
   */
  private detectLanguage(_text: string): string {
    // For now, assume English
    // Can be enhanced with language detection library
    return 'en';
  }
}

/**
 * Singleton instance
 */
export const preprocessor = new Preprocessor();
