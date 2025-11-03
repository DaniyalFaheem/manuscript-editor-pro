/**
 * Paraphrasing Service
 * 
 * Provides intelligent text paraphrasing with multiple variations,
 * tone adjustments, and length modifications.
 */

export interface ParaphraseOptions {
  formality?: 'casual' | 'neutral' | 'formal' | 'academic';
  length?: 'shorter' | 'same' | 'longer';
  variations?: number;
}

export interface ParaphraseResult {
  original: string;
  paraphrases: string[];
  formality: string;
  lengthChange: string;
}

/**
 * Word replacement maps for different formality levels
 */
const FORMALITY_REPLACEMENTS = {
  casual_to_formal: {
    'get': 'obtain',
    'got': 'obtained',
    'show': 'demonstrate',
    'tell': 'inform',
    'ask': 'inquire',
    'help': 'assist',
    'use': 'utilize',
    'think': 'consider',
    'see': 'observe',
    'look at': 'examine',
    'find out': 'ascertain',
    'lots of': 'numerous',
    'a lot of': 'substantial',
    'kind of': 'somewhat',
    'sort of': 'relatively',
  },
  formal_to_casual: {
    'obtain': 'get',
    'demonstrate': 'show',
    'inform': 'tell',
    'inquire': 'ask',
    'assist': 'help',
    'utilize': 'use',
    'consider': 'think',
    'observe': 'see',
    'examine': 'look at',
    'ascertain': 'find out',
    'numerous': 'lots of',
    'substantial': 'a lot of',
    'somewhat': 'kind of',
  },
};

/**
 * Sentence structure templates for paraphrasing
 */
const STRUCTURE_TEMPLATES = [
  {
    pattern: /^(.+?)\s+(is|are)\s+(.+)\.$/i,
    variations: [
      (match: RegExpMatchArray) => `${match[3]} ${match[2]} characteristic of ${match[1]}.`,
      (match: RegExpMatchArray) => `One can observe that ${match[1]} ${match[2]} ${match[3]}.`,
    ],
  },
  {
    pattern: /^(.+?)\s+(shows?|demonstrates?)\s+(.+)\.$/i,
    variations: [
      (match: RegExpMatchArray) => `${match[3]} ${match[2] === 'shows' ? 'is' : 'are'} evident in ${match[1]}.`,
      (match: RegExpMatchArray) => `It is apparent that ${match[1]} ${match[2]} ${match[3]}.`,
    ],
  },
  {
    pattern: /^(.+?)\s+(because|since)\s+(.+)\.$/i,
    variations: [
      (match: RegExpMatchArray) => `Due to ${match[3]}, ${match[1]}.`,
      (match: RegExpMatchArray) => `${match[1]}, given that ${match[3]}.`,
    ],
  },
];

export class ParaphrasingService {
  /**
   * Generate paraphrases for the given text
   */
  public paraphrase(text: string, options: ParaphraseOptions = {}): ParaphraseResult {
    const {
      formality = 'neutral',
      length = 'same',
      variations = 3,
    } = options;
    
    const paraphrases: string[] = [];
    
    // Generate variations using different techniques
    paraphrases.push(...this.generateFormalityVariations(text, formality));
    paraphrases.push(...this.generateStructureVariations(text));
    paraphrases.push(...this.generateSynonymVariations(text));
    
    // Apply length modifications
    let finalParaphrases = paraphrases.map(p => this.adjustLength(p, length));
    
    // Remove duplicates and limit to requested number
    finalParaphrases = [...new Set(finalParaphrases)];
    finalParaphrases = finalParaphrases.slice(0, variations);
    
    // If we don't have enough variations, add the original with slight modifications
    while (finalParaphrases.length < variations) {
      finalParaphrases.push(this.minorModification(text));
    }
    
    return {
      original: text,
      paraphrases: finalParaphrases,
      formality,
      lengthChange: length,
    };
  }
  
  /**
   * Generate variations with different formality levels
   */
  private generateFormalityVariations(text: string, targetFormality: string): string[] {
    const variations: string[] = [];
    
    if (targetFormality === 'formal' || targetFormality === 'academic') {
      variations.push(this.makeFormal(text));
    } else if (targetFormality === 'casual') {
      variations.push(this.makeCasual(text));
    }
    
    return variations;
  }
  
  /**
   * Make text more formal
   */
  private makeFormal(text: string): string {
    let result = text;
    
    // Replace contractions
    const contractions: Record<string, string> = {
      "don't": "do not",
      "doesn't": "does not",
      "didn't": "did not",
      "can't": "cannot",
      "won't": "will not",
      "wouldn't": "would not",
      "shouldn't": "should not",
      "isn't": "is not",
      "aren't": "are not",
      "wasn't": "was not",
      "weren't": "were not",
      "haven't": "have not",
      "hasn't": "has not",
      "hadn't": "had not",
      "I'm": "I am",
      "you're": "you are",
      "we're": "we are",
      "they're": "they are",
      "it's": "it is",
      "that's": "that is",
    };
    
    for (const [contraction, expansion] of Object.entries(contractions)) {
      const regex = new RegExp(`\\b${contraction}\\b`, 'gi');
      result = result.replace(regex, expansion);
    }
    
    // Replace casual words with formal ones
    for (const [casual, formal] of Object.entries(FORMALITY_REPLACEMENTS.casual_to_formal)) {
      const regex = new RegExp(`\\b${casual}\\b`, 'gi');
      result = result.replace(regex, formal);
    }
    
    // Remove first-person pronouns in academic writing
    result = result.replace(/\bI think that\b/gi, 'It can be argued that');
    result = result.replace(/\bI believe\b/gi, 'It is believed');
    result = result.replace(/\bWe can see\b/gi, 'It is evident');
    
    return result;
  }
  
  /**
   * Make text more casual
   */
  private makeCasual(text: string): string {
    let result = text;
    
    // Replace formal words with casual ones
    for (const [formal, casual] of Object.entries(FORMALITY_REPLACEMENTS.formal_to_casual)) {
      const regex = new RegExp(`\\b${formal}\\b`, 'gi');
      result = result.replace(regex, casual);
    }
    
    // Simplify some formal phrases
    result = result.replace(/\bit is evident that\b/gi, 'clearly');
    result = result.replace(/\bone can observe\b/gi, 'you can see');
    result = result.replace(/\bdue to the fact that\b/gi, 'because');
    
    return result;
  }
  
  /**
   * Generate variations by changing sentence structure
   */
  private generateStructureVariations(text: string): string[] {
    const variations: string[] = [];
    
    for (const template of STRUCTURE_TEMPLATES) {
      const match = text.match(template.pattern);
      if (match) {
        for (const varFunc of template.variations) {
          try {
            variations.push(varFunc(match));
          } catch (e) {
            // Skip if variation fails
          }
        }
      }
    }
    
    return variations;
  }
  
  /**
   * Generate variations using synonym replacement
   */
  private generateSynonymVariations(text: string): string[] {
    const synonymMap: Record<string, string[]> = {
      'important': ['significant', 'crucial', 'essential', 'vital'],
      'show': ['demonstrate', 'illustrate', 'reveal', 'display'],
      'many': ['numerous', 'several', 'multiple', 'various'],
      'different': ['distinct', 'diverse', 'varied', 'dissimilar'],
      'use': ['utilize', 'employ', 'apply', 'implement'],
      'find': ['discover', 'identify', 'locate', 'determine'],
      'make': ['create', 'produce', 'generate', 'construct'],
      'big': ['large', 'substantial', 'significant', 'considerable'],
      'small': ['minor', 'limited', 'modest', 'minimal'],
      'help': ['assist', 'aid', 'support', 'facilitate'],
    };
    
    const variations: string[] = [];
    let result = text;
    
    // Try replacing each word that has synonyms
    for (const [word, synonyms] of Object.entries(synonymMap)) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(result)) {
        // Create a variation with the first synonym
        const variation = result.replace(regex, synonyms[0]);
        if (variation !== result) {
          variations.push(variation);
        }
      }
    }
    
    return variations.slice(0, 2); // Limit synonym variations
  }
  
  /**
   * Adjust text length
   */
  private adjustLength(text: string, targetLength: 'shorter' | 'same' | 'longer'): string {
    if (targetLength === 'same') {
      return text;
    }
    
    if (targetLength === 'shorter') {
      return this.shorten(text);
    } else {
      return this.lengthen(text);
    }
  }
  
  /**
   * Shorten text by removing redundancy
   */
  private shorten(text: string): string {
    let result = text;
    
    // Remove redundant phrases
    const redundant = [
      { pattern: /\bvery\s+/gi, replacement: '' },
      { pattern: /\breally\s+/gi, replacement: '' },
      { pattern: /\bquite\s+/gi, replacement: '' },
      { pattern: /\bin order to\b/gi, replacement: 'to' },
      { pattern: /\bdue to the fact that\b/gi, replacement: 'because' },
      { pattern: /\bat the present time\b/gi, replacement: 'now' },
      { pattern: /\bin the event that\b/gi, replacement: 'if' },
    ];
    
    for (const { pattern, replacement } of redundant) {
      result = result.replace(pattern, replacement);
    }
    
    return result.trim();
  }
  
  /**
   * Lengthen text by adding detail
   */
  private lengthen(text: string): string {
    let result = text;
    
    // Add qualifying phrases
    result = result.replace(/\b(shows?|indicates?)\b/gi, '$1 clearly');
    result = result.replace(/\b(important)\b/gi, 'particularly $1');
    result = result.replace(/\b(research)\b/gi, 'comprehensive $1');
    
    return result;
  }
  
  /**
   * Make minor modifications to create variety
   */
  private minorModification(text: string): string {
    // Change word order slightly
    let result = text;
    
    // Move common adverbs (more specific pattern to avoid false matches)
    const commonAdverbs = [
      'quickly', 'slowly', 'carefully', 'easily', 'simply',
      'clearly', 'directly', 'effectively', 'frequently', 'generally'
    ];
    
    for (const adverb of commonAdverbs) {
      const pattern = new RegExp(`\\b${adverb}\\s+(\\w+)`, 'gi');
      result = result.replace(pattern, '$1 ' + adverb);
    }
    
    // Add emphasis
    if (!result.includes('indeed') && !result.includes('certainly')) {
      result = result.replace(/\b(is|are)\b/, '$1 indeed');
    }
    
    return result;
  }
  
  /**
   * Simplify complex sentences
   */
  public simplify(text: string): string {
    let result = text;
    
    // Replace complex words with simpler alternatives
    const simplifications: Record<string, string> = {
      'utilize': 'use',
      'commence': 'begin',
      'terminate': 'end',
      'demonstrate': 'show',
      'facilitate': 'help',
      'implement': 'carry out',
      'numerous': 'many',
      'sufficient': 'enough',
      'ascertain': 'find out',
      'endeavor': 'try',
    };
    
    for (const [complex, simple] of Object.entries(simplifications)) {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      result = result.replace(regex, simple);
    }
    
    // Simplify phrases
    result = result.replace(/\bin the event that\b/gi, 'if');
    result = result.replace(/\bdue to the fact that\b/gi, 'because');
    result = result.replace(/\bat this point in time\b/gi, 'now');
    result = result.replace(/\bfor the purpose of\b/gi, 'to');
    
    return result;
  }
}

export default new ParaphrasingService();
