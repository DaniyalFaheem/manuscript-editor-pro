/**
 * Field-Specific Terminology Validator
 * Validates discipline-specific terminology and methodology
 * Supports STEM, Humanities, and Social Sciences
 */

import type { Suggestion } from '../types';
import { getPositionFromOffset } from '../utils/textUtils';

export type AcademicField = 'STEM' | 'Humanities' | 'Social Sciences' | 'Medicine' | 'Engineering' | 'Business';

export interface FieldTerminology {
  field: AcademicField;
  preferredTerms: { [key: string]: string };
  deprecatedTerms: string[];
  requiredElements: string[];
  styleGuidelines: string[];
}

/**
 * STEM field terminology and guidelines
 */
const stemTerminology: FieldTerminology = {
  field: 'STEM',
  preferredTerms: {
    'prove': 'demonstrate',
    'obvious': 'evident',
    'clearly': 'as shown in',
    'very significant': 'statistically significant',
  },
  deprecatedTerms: [
    'proof positive',
    'absolutely certain',
    'undeniable fact',
  ],
  requiredElements: [
    'methodology',
    'results',
    'data',
    'analysis',
  ],
  styleGuidelines: [
    'Use SI units consistently',
    'Report statistical significance with p-values',
    'Include error bars or confidence intervals',
    'Describe reproducibility measures',
  ],
};

/**
 * Social Sciences terminology
 */
const socialSciencesTerminology: FieldTerminology = {
  field: 'Social Sciences',
  preferredTerms: {
    'subjects': 'participants',
    'prove': 'suggest',
    'normal': 'typical',
    'abnormal': 'atypical',
  },
  deprecatedTerms: [
    'crazy',
    'insane',
    'retarded',
    'normal people',
  ],
  requiredElements: [
    'participants',
    'procedure',
    'instruments',
    'ethical approval',
  ],
  styleGuidelines: [
    'Use person-first language',
    'Report demographics',
    'Describe sampling method',
    'Include ethical considerations',
  ],
};

/**
 * Humanities terminology
 */
const humanitiesTerminology: FieldTerminology = {
  field: 'Humanities',
  preferredTerms: {
    'prove': 'argue',
    'show': 'suggest',
    'obviously': 'arguably',
  },
  deprecatedTerms: [
    'clearly proves',
    'definitively shows',
  ],
  requiredElements: [
    'sources',
    'analysis',
    'interpretation',
    'references',
  ],
  styleGuidelines: [
    'Support claims with textual evidence',
    'Acknowledge multiple interpretations',
    'Use appropriate citation format',
    'Contextualize primary sources',
  ],
};

/**
 * Medicine terminology
 */
const medicineTerminology: FieldTerminology = {
  field: 'Medicine',
  preferredTerms: {
    'patient': 'patient',
    'case': 'patient case',
    'subjects': 'patients or participants',
  },
  deprecatedTerms: [
    'victim',
    'suffering from',
    'afflicted with',
  ],
  requiredElements: [
    'ethics approval',
    'informed consent',
    'patient demographics',
    'clinical measures',
  ],
  styleGuidelines: [
    'Use patient-first language',
    'Report adverse events',
    'Include IRB approval information',
    'Follow CONSORT guidelines for trials',
  ],
};

/**
 * Engineering terminology
 */
const engineeringTerminology: FieldTerminology = {
  field: 'Engineering',
  preferredTerms: {
    'system': 'system',
    'design': 'design',
    'optimization': 'optimization',
  },
  deprecatedTerms: [
    'perfect solution',
    'ideal system',
    // Note: 'optimal' should only be used when mathematically proven
  ],
  requiredElements: [
    'specifications',
    'constraints',
    'testing',
    'validation',
  ],
  styleGuidelines: [
    'Specify all design parameters',
    'Include tolerance ranges',
    'Describe testing procedures',
    'Report failure modes',
  ],
};

/**
 * Get terminology for a specific field
 */
export function getFieldTerminology(field: AcademicField): FieldTerminology {
  switch (field) {
    case 'STEM':
      return stemTerminology;
    case 'Social Sciences':
      return socialSciencesTerminology;
    case 'Humanities':
      return humanitiesTerminology;
    case 'Medicine':
      return medicineTerminology;
    case 'Engineering':
      return engineeringTerminology;
    default:
      return stemTerminology;
  }
}

/**
 * Detect academic field from text content
 */
export function detectAcademicField(text: string): AcademicField {
  const lowerText = text.toLowerCase();
  
  const fieldKeywords = {
    'STEM': ['algorithm', 'equation', 'hypothesis', 'experiment', 'variable', 'data analysis', 'statistical', 'coefficient'],
    'Medicine': ['patient', 'clinical', 'diagnosis', 'treatment', 'symptoms', 'medical', 'health', 'disease', 'therapy'],
    'Engineering': ['design', 'system', 'implementation', 'performance', 'optimization', 'specifications', 'prototype'],
    'Social Sciences': ['participants', 'survey', 'interview', 'qualitative', 'social', 'cultural', 'behavior', 'psychology'],
    'Humanities': ['interpretation', 'narrative', 'literature', 'historical', 'cultural', 'philosophical', 'textual analysis'],
  };
  
  const scores: { [key: string]: number } = {};
  
  for (const [field, keywords] of Object.entries(fieldKeywords)) {
    scores[field] = keywords.filter(keyword => lowerText.includes(keyword)).length;
  }
  
  const maxScore = Math.max(...Object.values(scores));
  const detectedField = Object.keys(scores).find(field => scores[field] === maxScore);
  
  return (detectedField as AcademicField) || 'STEM';
}

/**
 * Validate terminology for a specific field
 */
export function validateFieldTerminology(text: string, field?: AcademicField): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Auto-detect field if not provided
  const targetField = field || detectAcademicField(text);
  const terminology = getFieldTerminology(targetField);
  
  // Check for deprecated terms
  for (const deprecated of terminology.deprecatedTerms) {
    const pattern = new RegExp(`\\b${deprecated}\\b`, 'gi');
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      const pos = getPositionFromOffset(text, match.index);
      suggestions.push({
        id: `field-deprecated-${match.index}`,
        type: 'style',
        severity: 'warning',
        message: `Avoid using "${match[0]}" in ${targetField} writing`,
        original: match[0],
        suggestion: 'Consider rephrasing to use more appropriate terminology',
        startLine: pos.line,
        endLine: pos.line,
        startColumn: pos.column,
        endColumn: pos.column + match[0].length,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }
  }
  
  // Check for preferred term replacements
  for (const [nonPreferred, preferred] of Object.entries(terminology.preferredTerms)) {
    const pattern = new RegExp(`\\b${nonPreferred}\\b`, 'gi');
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      const pos = getPositionFromOffset(text, match.index);
      suggestions.push({
        id: `field-preferred-${match.index}`,
        type: 'style',
        severity: 'info',
        message: `In ${targetField}, prefer "${preferred}" over "${match[0]}"`,
        original: match[0],
        suggestion: preferred,
        startLine: pos.line,
        endLine: pos.line,
        startColumn: pos.column,
        endColumn: pos.column + match[0].length,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }
  }
  
  return suggestions;
}

/**
 * Validate methodology section for specific field
 */
export function validateMethodologyForField(text: string, field?: AcademicField): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const targetField = field || detectAcademicField(text);
  const terminology = getFieldTerminology(targetField);
  
  // Find methodology section
  const methodSection = text.match(/(?:Methodology|Methods|Materials and Methods)\s*\n([\s\S]+?)(?=\n(?:Results|Findings|Discussion)|\n\n[A-Z]|$)/i);
  
  if (!methodSection) {
    return suggestions; // No methodology section found
  }
  
  const methodText = methodSection[0].toLowerCase();
  
  // Check for required elements
  for (const element of terminology.requiredElements) {
    if (!methodText.includes(element.toLowerCase())) {
      suggestions.push({
        id: `field-method-missing-${element}`,
        type: 'style',
        severity: 'warning',
        message: `${targetField} methodology should include information about ${element}`,
        original: '',
        suggestion: `Add details about ${element} to strengthen your methodology section`,
        startLine: 0,
        endLine: 0,
        startColumn: 0,
        endColumn: 0,
        startOffset: 0,
        endOffset: 0,
      });
    }
  }
  
  return suggestions;
}

/**
 * Validate units and measurements (STEM/Engineering specific)
 */
export function validateUnitsAndMeasurements(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Check for non-SI units that should be SI
  const nonSIUnits: { [key: string]: string } = {
    'inches': 'cm or mm',
    'feet': 'meters',
    'miles': 'kilometers',
    'pounds': 'kilograms',
    'ounces': 'grams',
    'fahrenheit': 'Celsius or Kelvin',
    'psi': 'Pascals or kPa',
  };
  
  for (const [nonSI, siUnit] of Object.entries(nonSIUnits)) {
    const pattern = new RegExp(`\\d+\\s*${nonSI}`, 'gi');
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      const pos = getPositionFromOffset(text, match.index);
      suggestions.push({
        id: `units-nonsi-${match.index}`,
        type: 'style',
        severity: 'info',
        message: `Consider using SI units: ${siUnit} instead of ${nonSI}`,
        original: match[0],
        suggestion: `Convert to SI units (${siUnit})`,
        startLine: pos.line,
        endLine: pos.line,
        startColumn: pos.column,
        endColumn: pos.column + match[0].length,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }
  }
  
  // Check for missing units - with improved context detection
  // Only match numbers that are likely measurements (isolated numbers with spaces around them)
  const numberPattern = /(?:^|\s)(\d+\.?\d*)(?:\s|$)/g;
  let match;
  
  while ((match = numberPattern.exec(text)) !== null) {
    const numberIndex = match.index + match[0].indexOf(match[1]);
    const number = match[1];
    
    // Check context - skip if it's clearly not a measurement
    const contextBefore = text.substring(Math.max(0, numberIndex - 30), numberIndex).toLowerCase();
    const contextAfter = text.substring(numberIndex + number.length, Math.min(text.length, numberIndex + number.length + 30)).toLowerCase();
    const fullContext = contextBefore + contextAfter;
    
    // Enhanced skip patterns for academic writing
    const skipPatterns = [
      'page', 'table', 'figure', 'fig', 'section', 'chapter', 'appendix',
      'year', 'participants', 'n =', 'p =', 'r =', 't =', 'f =', 'χ²', 'chi-square',
      'reference', 'ref', 'citation', 'cite', '[', ']', '(', ')',
      'sample', 'group', 'study', 'trial', 'experiment',
      'version', 'step', 'phase', 'stage', 'week', 'day', 'month',
      'equation', 'formula', 'model', 'id', 'number', 'no.',
      'df =', 'α =', 'β =', 'r² =', 'sd =', 'm =', 'age'
    ];
    
    // Check if this is a heading number (e.g., "2.6", "3.1.2")
    const isHeadingNumber = /^\d+(\.\d+)+/.test(number) || 
                           (contextBefore.match(/\n\s*$/) && contextAfter.match(/^\s+[A-Z]/));
    
    // Check if this is a reference citation (e.g., "[35]", "(35)")
    const isReferenceCitation = /[[(]\s*$/.test(contextBefore) && /^\s*[\])]/.test(contextAfter);
    
    // Check if this is a year (1900-2099)
    const isYear = /^(19|20)\d{2}$/.test(number);
    
    // Check if number is followed by units or measurement indicators
    const hasUnitsAfter = /^\s*[a-zA-Z%°]/.test(contextAfter);
    
    // Skip if any skip pattern is found, or if it's a special case
    if (skipPatterns.some(pattern => fullContext.includes(pattern)) || 
        isHeadingNumber || 
        isReferenceCitation || 
        isYear ||
        hasUnitsAfter) {
      continue;
    }
    
    const pos = getPositionFromOffset(text, numberIndex);
    suggestions.push({
      id: `units-missing-${numberIndex}`,
      type: 'style',
      severity: 'info',
      message: 'Number without units - ensure measurement units are specified',
      original: number,
      suggestion: 'Add appropriate units if this is a measurement',
      startLine: pos.line,
      endLine: pos.line,
      startColumn: pos.column,
      endColumn: pos.column + number.length,
      startOffset: numberIndex,
      endOffset: numberIndex + number.length,
    });
  }
  
  return suggestions;
}

/**
 * Validate ethical considerations (Medicine/Social Sciences specific)
 */
export function validateEthicalConsiderations(text: string, field?: AcademicField): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const targetField = field || detectAcademicField(text);
  
  // Only check for fields that require ethics approval
  if (!['Medicine', 'Social Sciences'].includes(targetField)) {
    return suggestions;
  }
  
  const lowerText = text.toLowerCase();
  const ethicsKeywords = [
    'ethics approval',
    'ethical approval',
    'irb approval',
    'institutional review board',
    'ethics committee',
    'informed consent',
    'ethical considerations',
  ];
  
  const hasEthicsStatement = ethicsKeywords.some(keyword => lowerText.includes(keyword));
  
  if (!hasEthicsStatement && (lowerText.includes('participant') || lowerText.includes('patient'))) {
    suggestions.push({
      id: 'ethics-missing',
      type: 'style',
      severity: 'error',
      message: `${targetField} research with human participants requires ethics approval statement`,
      original: '',
      suggestion: 'Add information about ethics approval and informed consent',
      startLine: 0,
      endLine: 0,
      startColumn: 0,
      endColumn: 0,
      startOffset: 0,
      endOffset: 0,
    });
  }
  
  return suggestions;
}

/**
 * Comprehensive field-specific validation
 */
export function validateAllFieldSpecific(text: string, field?: AcademicField): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const targetField = field || detectAcademicField(text);
  
  suggestions.push(...validateFieldTerminology(text, targetField));
  suggestions.push(...validateMethodologyForField(text, targetField));
  
  // Add field-specific validators
  if (['STEM', 'Engineering', 'Medicine'].includes(targetField)) {
    suggestions.push(...validateUnitsAndMeasurements(text));
  }
  
  if (['Medicine', 'Social Sciences'].includes(targetField)) {
    suggestions.push(...validateEthicalConsiderations(text, targetField));
  }
  
  return suggestions;
}
