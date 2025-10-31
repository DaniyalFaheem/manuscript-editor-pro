/**
 * Count syllables in a word using a simple heuristic algorithm
 */
export function countSyllables(word: string): number {
  if (!word || word.length === 0) return 0;
  
  word = word.toLowerCase().trim();
  if (word.length <= 3) return 1;

  // Remove non-alphabetic characters
  word = word.replace(/[^a-z]/g, '');
  
  // Special cases
  if (word.endsWith('e')) {
    word = word.slice(0, -1);
  }
  
  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  let syllableCount = vowelGroups ? vowelGroups.length : 0;
  
  // Ensure at least 1 syllable
  return Math.max(1, syllableCount);
}

/**
 * Check if a word is complex (3+ syllables)
 */
export function isComplexWord(word: string): boolean {
  return countSyllables(word) >= 3;
}
