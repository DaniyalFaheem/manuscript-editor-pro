/**
 * Language Style Switcher
 * Converts between US, UK, Australian, and Canadian English variants
 */

export type LanguageVariant = 'US' | 'UK' | 'AU' | 'CA';

export interface LanguageIssue {
  id: string;
  word: string;
  variant: LanguageVariant;
  startOffset: number;
  endOffset: number;
  line: number;
  suggestions: Record<LanguageVariant, string>;
}

export interface LanguageAnalysis {
  detectedVariant: LanguageVariant | 'mixed';
  confidence: number;
  issues: LanguageIssue[];
  variantCounts: Record<LanguageVariant, number>;
}

// Comprehensive word variations database
const WORD_VARIANTS: Record<string, Record<LanguageVariant, string>> = {
  // -or/-our endings
  'color': { US: 'color', UK: 'colour', AU: 'colour', CA: 'colour' },
  'favor': { US: 'favor', UK: 'favour', AU: 'favour', CA: 'favour' },
  'honor': { US: 'honor', UK: 'honour', AU: 'honour', CA: 'honour' },
  'labor': { US: 'labor', UK: 'labour', AU: 'labour', CA: 'labour' },
  'neighbor': { US: 'neighbor', UK: 'neighbour', AU: 'neighbour', CA: 'neighbour' },
  'flavor': { US: 'flavor', UK: 'flavour', AU: 'flavour', CA: 'flavour' },
  'behavior': { US: 'behavior', UK: 'behaviour', AU: 'behaviour', CA: 'behaviour' },
  
  // -ize/-ise endings
  'analyze': { US: 'analyze', UK: 'analyse', AU: 'analyse', CA: 'analyze' },
  'organize': { US: 'organize', UK: 'organise', AU: 'organise', CA: 'organize' },
  'recognize': { US: 'recognize', UK: 'recognise', AU: 'recognise', CA: 'recognize' },
  'realize': { US: 'realize', UK: 'realise', AU: 'realise', CA: 'realize' },
  'criticize': { US: 'criticize', UK: 'criticise', AU: 'criticise', CA: 'criticize' },
  'apologize': { US: 'apologize', UK: 'apologise', AU: 'apologise', CA: 'apologize' },
  'authorize': { US: 'authorize', UK: 'authorise', AU: 'authorise', CA: 'authorize' },
  'standardize': { US: 'standardize', UK: 'standardise', AU: 'standardise', CA: 'standardize' },
  
  // -er/-re endings
  'center': { US: 'center', UK: 'centre', AU: 'centre', CA: 'centre' },
  'theater': { US: 'theater', UK: 'theatre', AU: 'theatre', CA: 'theatre' },
  'meter': { US: 'meter', UK: 'metre', AU: 'metre', CA: 'metre' },
  'fiber': { US: 'fiber', UK: 'fibre', AU: 'fibre', CA: 'fibre' },
  'liter': { US: 'liter', UK: 'litre', AU: 'litre', CA: 'litre' },
  
  // -ense/-ence endings
  'defense': { US: 'defense', UK: 'defence', AU: 'defence', CA: 'defence' },
  'offense': { US: 'offense', UK: 'offence', AU: 'offence', CA: 'offence' },
  'license': { US: 'license', UK: 'licence', AU: 'licence', CA: 'licence' },
  'pretense': { US: 'pretense', UK: 'pretence', AU: 'pretence', CA: 'pretence' },
  
  // -eled/-elled endings
  'traveled': { US: 'traveled', UK: 'travelled', AU: 'travelled', CA: 'travelled' },
  'labeled': { US: 'labeled', UK: 'labelled', AU: 'labelled', CA: 'labelled' },
  'canceled': { US: 'canceled', UK: 'cancelled', AU: 'cancelled', CA: 'cancelled' },
  'modeling': { US: 'modeling', UK: 'modelling', AU: 'modelling', CA: 'modelling' },
  'fueled': { US: 'fueled', UK: 'fuelled', AU: 'fuelled', CA: 'fuelled' },
  
  // Other common variations
  'gray': { US: 'gray', UK: 'grey', AU: 'grey', CA: 'grey' },
  'program': { US: 'program', UK: 'programme', AU: 'programme', CA: 'program' },
  'catalog': { US: 'catalog', UK: 'catalogue', AU: 'catalogue', CA: 'catalogue' },
  'dialog': { US: 'dialog', UK: 'dialogue', AU: 'dialogue', CA: 'dialogue' },
  'check': { US: 'check', UK: 'cheque', AU: 'cheque', CA: 'cheque' },
  'tire': { US: 'tire', UK: 'tyre', AU: 'tyre', CA: 'tire' },
  'aluminum': { US: 'aluminum', UK: 'aluminium', AU: 'aluminium', CA: 'aluminum' },
  'pediatric': { US: 'pediatric', UK: 'paediatric', AU: 'paediatric', CA: 'pediatric' },
  'encyclopedia': { US: 'encyclopedia', UK: 'encyclopaedia', AU: 'encyclopaedia', CA: 'encyclopedia' },
  'maneuver': { US: 'maneuver', UK: 'manoeuvre', AU: 'manoeuvre', CA: 'manoeuvre' },
  'artifact': { US: 'artifact', UK: 'artefact', AU: 'artefact', CA: 'artifact' },
};

// Build reverse lookup map
const VARIANT_TO_BASE: Map<string, string> = new Map();
for (const [base, variants] of Object.entries(WORD_VARIANTS)) {
  for (const variant of Object.values(variants)) {
    if (variant !== base) {
      VARIANT_TO_BASE.set(variant.toLowerCase(), base);
    }
  }
}

/**
 * Analyze text for language variant
 */
export function analyzeLanguageStyle(content: string): LanguageAnalysis {
  const issues: LanguageIssue[] = [];
  const variantCounts: Record<LanguageVariant, number> = { US: 0, UK: 0, AU: 0, CA: 0 };
  
  const words = tokenizeWords(content);
  let issueIdCounter = 0;

  for (const wordInfo of words) {
    const lowerWord = wordInfo.word.toLowerCase();
    
    // Check if this word is a variant
    const baseWord = VARIANT_TO_BASE.get(lowerWord) || lowerWord;
    const variants = WORD_VARIANTS[baseWord];
    
    if (variants) {
      // Determine which variant this word is
      let detectedVariant: LanguageVariant | null = null;
      
      for (const [variant, spelling] of Object.entries(variants)) {
        if (spelling.toLowerCase() === lowerWord) {
          detectedVariant = variant as LanguageVariant;
          variantCounts[detectedVariant]++;
          break;
        }
      }
      
      if (detectedVariant) {
        issues.push({
          id: `lang-${issueIdCounter++}`,
          word: wordInfo.word,
          variant: detectedVariant,
          startOffset: wordInfo.startOffset,
          endOffset: wordInfo.endOffset,
          line: wordInfo.line,
          suggestions: variants
        });
      }
    }
  }

  // Determine dominant variant
  const { detectedVariant, confidence } = detectDominantVariant(variantCounts);

  return {
    detectedVariant,
    confidence,
    issues,
    variantCounts
  };
}

/**
 * Convert text to specific language variant
 */
export function convertToVariant(content: string, targetVariant: LanguageVariant): string {
  let result = content;
  
  // Get all words with their positions
  const words = tokenizeWords(content);
  
  // Sort by offset in reverse order to maintain positions
  words.sort((a, b) => b.startOffset - a.startOffset);
  
  for (const wordInfo of words) {
    const lowerWord = wordInfo.word.toLowerCase();
    const baseWord = VARIANT_TO_BASE.get(lowerWord) || lowerWord;
    const variants = WORD_VARIANTS[baseWord];
    
    if (variants && variants[targetVariant]) {
      const targetWord = variants[targetVariant];
      
      // Preserve original casing
      const convertedWord = preserveCase(wordInfo.word, targetWord);
      
      result = 
        result.substring(0, wordInfo.startOffset) +
        convertedWord +
        result.substring(wordInfo.endOffset);
    }
  }
  
  return result;
}

/**
 * Tokenize words from content with position information
 */
function tokenizeWords(content: string): Array<{
  word: string;
  startOffset: number;
  endOffset: number;
  line: number;
}> {
  const words: Array<{
    word: string;
    startOffset: number;
    endOffset: number;
    line: number;
  }> = [];
  
  const lines = content.split('\n');
  let offset = 0;
  
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const wordPattern = /\b[a-zA-Z]+\b/g;
    let match: RegExpExecArray | null;
    
    while ((match = wordPattern.exec(line)) !== null) {
      words.push({
        word: match[0],
        startOffset: offset + match.index,
        endOffset: offset + match.index + match[0].length,
        line: lineIndex + 1
      });
    }
    
    offset += line.length + 1;
  }
  
  return words;
}

/**
 * Detect dominant language variant
 */
function detectDominantVariant(
  variantCounts: Record<LanguageVariant, number>
): { detectedVariant: LanguageVariant | 'mixed'; confidence: number } {
  const total = Object.values(variantCounts).reduce((sum, count) => sum + count, 0);
  
  if (total === 0) {
    return { detectedVariant: 'US', confidence: 0 };
  }
  
  const sortedVariants = Object.entries(variantCounts)
    .sort(([, a], [, b]) => b - a);
  
  const [dominantVariant, dominantCount] = sortedVariants[0];
  const confidence = dominantCount / total;
  
  // If confidence is low, mark as mixed
  if (confidence < 0.6) {
    return { detectedVariant: 'mixed', confidence };
  }
  
  return {
    detectedVariant: dominantVariant as LanguageVariant,
    confidence
  };
}

/**
 * Preserve original casing when converting word
 */
function preserveCase(original: string, target: string): string {
  if (original === original.toUpperCase()) {
    return target.toUpperCase();
  }
  
  if (original[0] === original[0].toUpperCase()) {
    return target.charAt(0).toUpperCase() + target.slice(1).toLowerCase();
  }
  
  return target.toLowerCase();
}

/**
 * Get conversion suggestion for a specific issue
 */
export function getConversionSuggestion(
  issue: LanguageIssue,
  targetVariant: LanguageVariant
): string {
  const targetWord = issue.suggestions[targetVariant];
  return preserveCase(issue.word, targetWord);
}

/**
 * Check if text has mixed language usage
 */
export function hasMixedLanguageUsage(analysis: LanguageAnalysis): boolean {
  return analysis.detectedVariant === 'mixed' || analysis.confidence < 0.8;
}
