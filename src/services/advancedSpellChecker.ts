/**
 * Advanced Spell Checker using Natural NLP Library
 * Provides intelligent spell checking with context awareness
 */

import * as natural from 'natural';
import type { Suggestion } from '../types';
import { generateId, getPositionFromOffset } from '../utils/textUtils';

// Note: Natural library doesn't have a built-in comprehensive spell checker
// We'll use its tokenizer and string distance functions for spell checking

// Common academic and technical terms to add to dictionary
const academicTerms = [
  'methodology', 'methodologies', 'quantitative', 'qualitative',
  'hypothesis', 'hypotheses', 'dissertation', 'thesis', 'theses',
  'metadata', 'dataset', 'datasets', 'preprocessing', 'postprocessing',
  'multicenter', 'multivariate', 'univariate', 'bivariate',
  'statistically', 'nonparametric', 'parametric', 'heterogeneous',
  'homogeneous', 'phenotype', 'genotype', 'proteomics', 'genomics',
  'biomarker', 'biomarkers', 'neurological', 'physiological',
  'pharmacological', 'epidemiological', 'socioeconomic',
  'psychosocial', 'neuroscience', 'neurosciences', 'biomedical',
  'bibliographic', 'ethnographic', 'demographic', 'demographics',
  'randomized', 'randomization', 'standardized', 'standardization',
  'subgroup', 'subgroups', 'subpopulation', 'subpopulations',
  'covariate', 'covariates', 'confounding', 'confounders',
  'interquartile', 'percentile', 'percentiles', 'quartile', 'quartiles',
  'logistic', 'polynomial', 'exponential', 'logarithmic',
  'inline', 'runtime', 'metadata', 'workflow', 'workflows',
  'preprocessing', 'postprocessing', 'backend', 'frontend',
  'microservice', 'microservices', 'scalability', 'scalable'
];

// Note: The Natural library's spell checker doesn't have an addWord method
// So we use it for suggestions only and maintain our own dictionary above

// Common words that are often misspelled
const commonMisspellings: Record<string, string> = {
  'teh': 'the',
  'taht': 'that',
  'thsi': 'this',
  'waht': 'what',
  'whcih': 'which',
  'hte': 'the',
  'adn': 'and',
  'nad': 'and',
  'cna': 'can',
  'coudl': 'could',
  'shoudl': 'should',
  'woudl': 'would',
  'recieve': 'receive',
  'beleive': 'believe',
  'acheive': 'achieve',
  'occured': 'occurred',
  'occuring': 'occurring',
  'seperete': 'separate',
  'definately': 'definitely',
  'accomodate': 'accommodate',
  'untill': 'until',
  'wich': 'which',
  'wierd': 'weird',
  'thier': 'their',
  'theyr': 'they\'re',
  'alot': 'a lot',
  'arguement': 'argument',
  'begining': 'beginning',
  'enviroment': 'environment',
  'goverment': 'government',
  'independant': 'independent',
  'mispell': 'misspell',
  'neccessary': 'necessary',
  'noticable': 'noticeable',
  'occassion': 'occasion',
  'refered': 'referred',
  'succesful': 'successful',
  'tommorrow': 'tomorrow',
  'truely': 'truly',
  'usefull': 'useful'
};

// Academic terms whitelist - correctly spelled technical terms
const academicWhitelist = new Set([
  ...academicTerms,
  'pdf', 'doi', 'isbn', 'issn', 'url', 'uri', 'html', 'xml', 'json',
  'api', 'cpu', 'gpu', 'ram', 'usb', 'wifi', 'ai', 'ml', 'nlp',
  'covid', 'rna', 'dna', 'mrna', 'pcr', 'elisa', 'fmri', 'eeg',
  'anova', 'manova', 'ancova', 'anova', 'sem', 'cfa', 'efa',
  'spss', 'stata', 'matlab', 'python', 'javascript', 'typescript'
]);

/**
 * Check if a word is likely a technical term, acronym, or proper noun
 */
function isTechnicalTerm(word: string): boolean {
  // All caps (likely acronym)
  if (word === word.toUpperCase() && word.length <= 6) {
    return true;
  }
  
  // Contains numbers (likely technical identifier)
  if (/\d/.test(word)) {
    return true;
  }
  
  // Starts with capital letter and is short (likely proper noun or acronym)
  if (word[0] === word[0].toUpperCase() && word.length <= 4) {
    return true;
  }
  
  // In whitelist
  if (academicWhitelist.has(word.toLowerCase())) {
    return true;
  }
  
  return false;
}

/**
 * Calculate edit distance between two words (Levenshtein distance)
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Get spelling suggestions for a word using edit distance
 */
function getSpellingSuggestions(word: string): string[] {
  const lowerWord = word.toLowerCase();
  
  // Check common misspellings first (instant correction)
  if (commonMisspellings[lowerWord]) {
    return [commonMisspellings[lowerWord]];
  }
  
  // Generate suggestions based on Levenshtein distance from our dictionary
  const dictionary = Object.values(commonMisspellings);
  const candidates = dictionary
    .map(correctWord => ({
      word: correctWord,
      distance: levenshteinDistance(lowerWord, correctWord.toLowerCase())
    }))
    .filter(candidate => candidate.distance <= 2)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map(candidate => candidate.word);
  
  return candidates;
}

/**
 * Check text for spelling errors using Natural NLP
 * This provides an additional layer of spell checking beyond pattern-based rules
 */
export function checkAdvancedSpelling(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Tokenize text into words
  const tokenizer = new natural.WordTokenizer();
  const words = tokenizer.tokenize(text);
  
  if (!words) return suggestions;
  
  let currentOffset = 0;
  
  for (const word of words) {
    // Skip if it's not a word (punctuation, etc.)
    if (!/^[a-zA-Z]+$/.test(word)) {
      currentOffset = text.indexOf(word, currentOffset) + word.length;
      continue;
    }
    
    // Skip technical terms and acronyms
    if (isTechnicalTerm(word)) {
      currentOffset = text.indexOf(word, currentOffset) + word.length;
      continue;
    }
    
    // Skip very short words (likely correct)
    if (word.length <= 2) {
      currentOffset = text.indexOf(word, currentOffset) + word.length;
      continue;
    }
    
    // Check common misspellings
    const lowerWord = word.toLowerCase();
    const hasCommonMisspelling = commonMisspellings[lowerWord];
    
    // Only flag if it's in our common misspellings dictionary
    // This keeps the checker fast and accurate for known errors
    if (hasCommonMisspelling) {
      // Find the actual position in text
      const startOffset = text.indexOf(word, currentOffset);
      if (startOffset === -1) {
        currentOffset += word.length;
        continue;
      }
      
      const endOffset = startOffset + word.length;
      const startPos = getPositionFromOffset(text, startOffset);
      const endPos = getPositionFromOffset(text, endOffset);
      
      // Get suggestions
      const spellingSuggestions = getSpellingSuggestions(word);
      
      if (spellingSuggestions.length > 0) {
        suggestions.push({
          id: generateId(),
          type: 'spelling',
          severity: 'error',
          message: hasCommonMisspelling 
            ? `Common misspelling: "${word}". Did you mean "${spellingSuggestions[0]}"?`
            : `Possible spelling error: "${word}". Suggestions: ${spellingSuggestions.join(', ')}`,
          original: word,
          suggestion: spellingSuggestions[0],
          startLine: startPos.line,
          endLine: endPos.line,
          startColumn: startPos.column,
          endColumn: endPos.column,
          startOffset,
          endOffset,
        });
      }
      
      currentOffset = endOffset;
    } else {
      currentOffset = text.indexOf(word, currentOffset) + word.length;
    }
  }
  
  return suggestions;
}

/**
 * Quick spell check for real-time checking (limited to common misspellings)
 */
export function quickSpellCheck(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Only check common misspellings for speed
  for (const [misspelled, correct] of Object.entries(commonMisspellings)) {
    const pattern = new RegExp(`\\b${misspelled}\\b`, 'gi');
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      const startOffset = match.index;
      const endOffset = startOffset + match[0].length;
      const startPos = getPositionFromOffset(text, startOffset);
      const endPos = getPositionFromOffset(text, endOffset);
      
      suggestions.push({
        id: generateId(),
        type: 'spelling',
        severity: 'error',
        message: `Common misspelling: "${match[0]}". Did you mean "${correct}"?`,
        original: match[0],
        suggestion: correct,
        startLine: startPos.line,
        endLine: endPos.line,
        startColumn: startPos.column,
        endColumn: endPos.column,
        startOffset,
        endOffset,
      });
    }
  }
  
  return suggestions;
}
