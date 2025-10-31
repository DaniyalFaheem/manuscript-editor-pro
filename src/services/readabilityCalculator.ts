import type { TextMetrics } from '../types';
import { splitIntoSentences, splitIntoWords, splitIntoParagraphs } from '../utils/textUtils';
import { countSyllables, isComplexWord } from '../utils/syllableCounter';

/**
 * Calculate all readability metrics for the given text
 */
export function calculateReadabilityMetrics(text: string): TextMetrics {
  if (!text || text.trim().length === 0) {
    return {
      wordCount: 0,
      characterCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      complexWordCount: 0,
      averageWordsPerSentence: 0,
      fleschReadingEase: 0,
      fleschKincaidGrade: 0,
      gunningFog: 0,
      passiveVoicePercentage: 0,
    };
  }

  const words = splitIntoWords(text);
  const sentences = splitIntoSentences(text);
  const paragraphs = splitIntoParagraphs(text);

  const wordCount = words.length;
  const characterCount = text.length;
  const sentenceCount = sentences.length || 1;
  const paragraphCount = paragraphs.length || 1;

  // Calculate syllables
  let totalSyllables = 0;
  let complexWords = 0;

  words.forEach(word => {
    const syllables = countSyllables(word);
    totalSyllables += syllables;
    if (isComplexWord(word)) {
      complexWords++;
    }
  });

  const averageWordsPerSentence = wordCount / sentenceCount;
  const averageSyllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 0;

  // Flesch Reading Ease: 206.835 - 1.015(words/sentences) - 84.6(syllables/words)
  const fleschReadingEase = Math.max(
    0,
    Math.min(
      100,
      206.835 - 1.015 * averageWordsPerSentence - 84.6 * averageSyllablesPerWord
    )
  );

  // Flesch-Kincaid Grade Level: 0.39(words/sentences) + 11.8(syllables/words) - 15.59
  const fleschKincaidGrade = Math.max(
    0,
    0.39 * averageWordsPerSentence + 11.8 * averageSyllablesPerWord - 15.59
  );

  // Gunning Fog Index: 0.4 * ((words/sentences) + 100 * (complex words/words))
  const gunningFog = Math.max(
    0,
    0.4 * (averageWordsPerSentence + 100 * (complexWords / wordCount))
  );

  // Passive voice detection (simplified)
  const passiveVoicePercentage = detectPassiveVoice(text, sentences);

  return {
    wordCount,
    characterCount,
    sentenceCount,
    paragraphCount,
    complexWordCount: complexWords,
    averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
    fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
    fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
    gunningFog: Math.round(gunningFog * 10) / 10,
    passiveVoicePercentage: Math.round(passiveVoicePercentage * 10) / 10,
  };
}

/**
 * Detect passive voice percentage
 */
function detectPassiveVoice(_text: string, sentences: string[]): number {
  if (sentences.length === 0) return 0;

  // Simple passive voice detection using common patterns
  const passivePatterns = [
    /\b(is|are|was|were|been|be|being)\s+\w+ed\b/gi,
    /\b(is|are|was|were|been|be|being)\s+\w+en\b/gi,
  ];

  let passiveCount = 0;

  sentences.forEach(sentence => {
    const hasPassive = passivePatterns.some(pattern => pattern.test(sentence));
    if (hasPassive) {
      passiveCount++;
    }
  });

  return (passiveCount / sentences.length) * 100;
}
