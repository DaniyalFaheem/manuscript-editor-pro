/**
 * Citation Format Validator
 * Validates and checks citations in multiple academic formats
 * Supports APA 7, MLA 9, Chicago 17, IEEE, and Harvard styles
 */

import type { Suggestion } from '../types';
import { getPositionFromOffset } from '../utils/textUtils';

export type CitationStyle = 'APA' | 'MLA' | 'Chicago' | 'IEEE' | 'Harvard';

export interface CitationMatch {
  text: string;
  style: CitationStyle;
  startOffset: number;
  endOffset: number;
  isValid: boolean;
  errors: string[];
}

export interface BibliographyEntry {
  text: string;
  style: CitationStyle;
  startOffset: number;
  endOffset: number;
  authors: string[];
  year?: string;
  title?: string;
  isValid: boolean;
  errors: string[];
}

/**
 * Detects citation style from document content
 */
export function detectCitationStyle(text: string): CitationStyle | null {
  const apaPattern = /\([A-Z][a-z]+(?:\s+&\s+[A-Z][a-z]+)?,\s+\d{4}\)/g;
  const mlaPattern = /\([A-Z][a-z]+\s+\d+\)/g;
  const ieeePattern = /\[\d+\]/g;
  const chicagoPattern = /\d+\.\s+[A-Z][a-z]+,\s+[A-Z][a-z]+\./g;
  
  const apaCount = (text.match(apaPattern) || []).length;
  const mlaCount = (text.match(mlaPattern) || []).length;
  const ieeeCount = (text.match(ieeePattern) || []).length;
  const chicagoCount = (text.match(chicagoPattern) || []).length;
  
  const max = Math.max(apaCount, mlaCount, ieeeCount, chicagoCount);
  
  if (max === 0) return null;
  if (apaCount === max) return 'APA';
  if (mlaCount === max) return 'MLA';
  if (ieeeCount === max) return 'IEEE';
  if (chicagoCount === max) return 'Chicago';
  
  return null;
}

/**
 * Validates APA 7th edition in-text citations
 */
export function validateAPACitations(text: string): CitationMatch[] {
  const matches: CitationMatch[] = [];
  
  // Pattern: (Author, Year) or (Author & Author, Year) or (Author et al., Year)
  const apaPattern = /\(([A-Z][a-z]+(?:\s+(?:&|and)\s+[A-Z][a-z]+|\s+et\s+al\.)?),\s+(\d{4}[a-z]?)\)/g;
  
  let match;
  while ((match = apaPattern.exec(text)) !== null) {
    const errors: string[] = [];
    const fullMatch = match[0];
    const authors = match[1];
    const year = match[2];
    
    // Validate year is reasonable (1900-2100)
    const yearNum = parseInt(year);
    if (yearNum < 1900 || yearNum > 2100) {
      errors.push('Year should be between 1900 and 2100');
    }
    
    // Check for ampersand vs "and"
    if (authors.includes(' and ')) {
      errors.push('APA style requires "&" not "and" for multiple authors in citations');
    }
    
    // Check spacing
    if (!fullMatch.match(/,\s+\d{4}/)) {
      errors.push('APA requires space after comma before year');
    }
    
    matches.push({
      text: fullMatch,
      style: 'APA',
      startOffset: match.index,
      endOffset: match.index + fullMatch.length,
      isValid: errors.length === 0,
      errors,
    });
  }
  
  return matches;
}

/**
 * Validates MLA 9th edition in-text citations
 */
export function validateMLACitations(text: string): CitationMatch[] {
  const matches: CitationMatch[] = [];
  
  // Pattern: (Author Page) or (Author and Author Page)
  const mlaPattern = /\(([A-Z][a-z]+(?:\s+and\s+[A-Z][a-z]+)?)\s+(\d+(?:-\d+)?)\)/g;
  
  let match;
  while ((match = mlaPattern.exec(text)) !== null) {
    const errors: string[] = [];
    const fullMatch = match[0];
    const authors = match[1];
    
    // MLA uses "and" not "&"
    if (authors.includes('&')) {
      errors.push('MLA style uses "and" not "&" for multiple authors');
    }
    
    // Check for "p." or "pp." which should not be used
    const surroundingText = text.substring(Math.max(0, match.index - 20), match.index + fullMatch.length + 20);
    if (surroundingText.match(/\(.*\bpp?\.\s*\d+/)) {
      errors.push('MLA does not use "p." or "pp." for page numbers in citations');
    }
    
    matches.push({
      text: fullMatch,
      style: 'MLA',
      startOffset: match.index,
      endOffset: match.index + fullMatch.length,
      isValid: errors.length === 0,
      errors,
    });
  }
  
  return matches;
}

/**
 * Validates IEEE numbered citations
 */
export function validateIEEECitations(text: string): CitationMatch[] {
  const matches: CitationMatch[] = [];
  
  // Pattern: [1] or [1, 2] or [1-3]
  const ieeePattern = /\[(\d+(?:(?:,\s*|-)\d+)*)\]/g;
  
  let match;
  while ((match = ieeePattern.exec(text)) !== null) {
    const errors: string[] = [];
    const fullMatch = match[0];
    const numbers = match[1];
    
    // Parse numbers
    const nums: number[] = [];
    const parts = numbers.split(/[,-]/);
    for (const part of parts) {
      const num = parseInt(part.trim());
      if (num > 0 && num < 10000) {
        nums.push(num);
      }
    }
    
    // Check if numbers are in order
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] <= nums[i-1]) {
        errors.push('IEEE citation numbers should be in ascending order');
        break;
      }
    }
    
    matches.push({
      text: fullMatch,
      style: 'IEEE',
      startOffset: match.index,
      endOffset: match.index + fullMatch.length,
      isValid: errors.length === 0,
      errors,
    });
  }
  
  return matches;
}

/**
 * Validates Chicago style footnote citations
 */
export function validateChicagoCitations(text: string): CitationMatch[] {
  const matches: CitationMatch[] = [];
  
  // Pattern: superscript numbers (represented as ^1 or ¹)
  const chicagoPattern = /(\^|¹|²|³|⁴|⁵|⁶|⁷|⁸|⁹|⁰)+/g;
  
  let match;
  while ((match = chicagoPattern.exec(text)) !== null) {
    const errors: string[] = [];
    const fullMatch = match[0];
    
    // Chicago style should have superscript after punctuation
    const prevChar = text.charAt(match.index - 1);
    if (prevChar && /[a-zA-Z0-9]/.test(prevChar)) {
      errors.push('Chicago style footnote numbers should come after punctuation, not within words');
    }
    
    matches.push({
      text: fullMatch,
      style: 'Chicago',
      startOffset: match.index,
      endOffset: match.index + fullMatch.length,
      isValid: errors.length === 0,
      errors,
    });
  }
  
  return matches;
}

/**
 * Validates Harvard style citations
 */
export function validateHarvardCitations(text: string): CitationMatch[] {
  const matches: CitationMatch[] = [];
  
  // Pattern: (Author Year) or (Author and Author Year)
  const harvardPattern = /\(([A-Z][a-z]+(?:\s+and\s+[A-Z][a-z]+)?)\s+(\d{4}[a-z]?)\)/g;
  
  let match;
  while ((match = harvardPattern.exec(text)) !== null) {
    const errors: string[] = [];
    const fullMatch = match[0];
    const year = match[2];
    
    // Validate year
    const yearNum = parseInt(year);
    if (yearNum < 1900 || yearNum > 2100) {
      errors.push('Year should be between 1900 and 2100');
    }
    
    // Check for comma (Harvard doesn't use comma between author and year)
    if (fullMatch.includes(',')) {
      errors.push('Harvard style does not use comma between author and year');
    }
    
    matches.push({
      text: fullMatch,
      style: 'Harvard',
      startOffset: match.index,
      endOffset: match.index + fullMatch.length,
      isValid: errors.length === 0,
      errors,
    });
  }
  
  return matches;
}

/**
 * Extract and validate bibliography entries (references section)
 */
export function extractBibliography(text: string, style: CitationStyle): BibliographyEntry[] {
  const entries: BibliographyEntry[] = [];
  
  // Find references/bibliography section
  const refSection = text.match(/(?:References|Bibliography|Works Cited)\s*\n([\s\S]+?)(?=\n\n[A-Z]|\n\n$|$)/i);
  if (!refSection) return entries;
  
  const refText = refSection[1];
  const lines = refText.split('\n').filter(line => line.trim().length > 0);
  
  for (const line of lines) {
    const entry = parseBibliographyEntry(line, style);
    if (entry) {
      entries.push(entry);
    }
  }
  
  return entries;
}

/**
 * Parse a single bibliography entry
 */
function parseBibliographyEntry(text: string, style: CitationStyle): BibliographyEntry | null {
  const errors: string[] = [];
  const authors: string[] = [];
  let year: string | undefined;
  let title: string | undefined;
  
  // Simple author extraction (this can be enhanced)
  const authorMatch = text.match(/^([A-Z][a-z]+(?:,\s+[A-Z]\.)+)/);
  if (authorMatch) {
    authors.push(authorMatch[1]);
  }
  
  // Simple year extraction
  const yearMatch = text.match(/\((\d{4})\)/);
  if (yearMatch) {
    year = yearMatch[1];
  }
  
  // Title extraction (between quotes or italics)
  const titleMatch = text.match(/"([^"]+)"|'([^']+)'|<i>([^<]+)<\/i>/);
  if (titleMatch) {
    title = titleMatch[1] || titleMatch[2] || titleMatch[3];
  }
  
  // Validate format based on style
  switch (style) {
    case 'APA':
      if (!text.match(/^[A-Z][a-z]+,\s+[A-Z]\./)) {
        errors.push('APA format requires: Last name, First initial.');
      }
      if (!yearMatch) {
        errors.push('APA format requires year in parentheses');
      }
      break;
    case 'MLA':
      if (!text.match(/^[A-Z][a-z]+,\s+[A-Z][a-z]+\./)) {
        errors.push('MLA format requires: Last name, First name.');
      }
      break;
    case 'IEEE':
      if (!text.match(/^\[\d+\]/)) {
        errors.push('IEEE format requires numbered references');
      }
      break;
  }
  
  return {
    text,
    style,
    startOffset: 0,
    endOffset: text.length,
    authors,
    year,
    title,
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Cross-reference in-text citations with bibliography
 */
export function crossReferenceCitations(
  text: string,
  inTextCitations: CitationMatch[],
  bibliography: BibliographyEntry[]
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Extract authors and years from bibliography
  const bibRefs = new Set(
    bibliography.map(entry => {
      const author = entry.authors[0]?.split(',')[0] || '';
      return `${author}${entry.year || ''}`.toLowerCase();
    })
  );
  
  // Check each in-text citation
  for (const citation of inTextCitations) {
    const match = citation.text.match(/([A-Z][a-z]+).*?(\d{4})/);
    if (match) {
      const author = match[1];
      const year = match[2];
      const key = `${author}${year}`.toLowerCase();
      
      if (!bibRefs.has(key)) {
        const pos = getPositionFromOffset(text, citation.startOffset);
        suggestions.push({
          id: `cite-missing-${citation.startOffset}`,
          type: 'grammar',
          severity: 'error',
          message: `Citation "${citation.text}" not found in bibliography/references section`,
          original: citation.text,
          suggestion: 'Add this reference to your bibliography or remove the citation',
          startLine: pos.line,
          endLine: pos.line,
          startColumn: pos.column,
          endColumn: pos.column + citation.text.length,
          startOffset: citation.startOffset,
          endOffset: citation.endOffset,
        });
      }
    }
  }
  
  return suggestions;
}

/**
 * Validate all citations in text
 */
export function validateAllCitations(text: string, preferredStyle?: CitationStyle): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Auto-detect style if not provided
  const style = preferredStyle || detectCitationStyle(text);
  
  if (!style) {
    return suggestions; // No citations detected
  }
  
  let citations: CitationMatch[] = [];
  
  // Validate based on detected/preferred style
  switch (style) {
    case 'APA':
      citations = validateAPACitations(text);
      break;
    case 'MLA':
      citations = validateMLACitations(text);
      break;
    case 'IEEE':
      citations = validateIEEECitations(text);
      break;
    case 'Chicago':
      citations = validateChicagoCitations(text);
      break;
    case 'Harvard':
      citations = validateHarvardCitations(text);
      break;
  }
  
  // Convert invalid citations to suggestions
  for (const citation of citations) {
    if (!citation.isValid) {
      const pos = getPositionFromOffset(text, citation.startOffset);
      
      for (const error of citation.errors) {
        suggestions.push({
          id: `cite-${citation.style}-${citation.startOffset}`,
          type: 'grammar',
          severity: 'warning',
          message: `${citation.style} citation error: ${error}`,
          original: citation.text,
          suggestion: `Review and correct ${citation.style} citation format`,
          startLine: pos.line,
          endLine: pos.line,
          startColumn: pos.column,
          endColumn: pos.column + citation.text.length,
          startOffset: citation.startOffset,
          endOffset: citation.endOffset,
        });
      }
    }
  }
  
  // Extract and validate bibliography
  const bibliography = extractBibliography(text, style);
  
  // Cross-reference citations with bibliography
  const crossRefSuggestions = crossReferenceCitations(text, citations, bibliography);
  suggestions.push(...crossRefSuggestions);
  
  return suggestions;
}

/**
 * Validate DOI format
 */
export function validateDOI(doi: string): boolean {
  // DOI format: 10.xxxx/xxxxx
  const doiPattern = /^10\.\d{4,}\/[-._;()/:A-Za-z0-9]+$/;
  return doiPattern.test(doi);
}

/**
 * Validate ISBN format (ISBN-10 or ISBN-13)
 */
export function validateISBN(isbn: string): boolean {
  // Remove hyphens and spaces
  const cleaned = isbn.replace(/[-\s]/g, '');
  
  // ISBN-10
  if (cleaned.length === 10) {
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned[i]) * (10 - i);
    }
    const checkDigit = cleaned[9] === 'X' ? 10 : parseInt(cleaned[9]);
    sum += checkDigit;
    return sum % 11 === 0;
  }
  
  // ISBN-13
  if (cleaned.length === 13) {
    let sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned[i]) * (i % 2 === 0 ? 1 : 3);
    }
    return sum % 10 === 0;
  }
  
  return false;
}
