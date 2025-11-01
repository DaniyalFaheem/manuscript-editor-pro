/**
 * Reference Manager
 * Manages and tracks references throughout the document
 * Supports bibliography generation and reference validation
 */

import type { CitationStyle } from './citationValidator';

export interface Reference {
  id: string;
  authors: string[];
  year: string;
  title: string;
  source?: string; // Journal, book, conference, etc.
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  isbn?: string;
  url?: string;
  accessDate?: string;
  publisher?: string;
  location?: string;
  type: 'journal' | 'book' | 'conference' | 'website' | 'thesis' | 'other';
}

/**
 * Format reference in APA 7th edition style
 */
export function formatAPA(ref: Reference): string {
  const parts: string[] = [];
  
  // Authors
  if (ref.authors.length > 0) {
    if (ref.authors.length === 1) {
      parts.push(`${ref.authors[0]}.`);
    } else if (ref.authors.length === 2) {
      parts.push(`${ref.authors[0]}, & ${ref.authors[1]}.`);
    } else if (ref.authors.length <= 20) {
      const allButLast = ref.authors.slice(0, -1).join(', ');
      parts.push(`${allButLast}, & ${ref.authors[ref.authors.length - 1]}.`);
    } else {
      const first19 = ref.authors.slice(0, 19).join(', ');
      parts.push(`${first19}, ... ${ref.authors[ref.authors.length - 1]}.`);
    }
  }
  
  // Year
  parts.push(`(${ref.year}).`);
  
  // Title
  if (ref.type === 'journal') {
    parts.push(`${ref.title}.`);
  } else {
    parts.push(`<i>${ref.title}</i>.`);
  }
  
  // Source-specific formatting
  if (ref.type === 'journal' && ref.source) {
    let sourcePart = `<i>${ref.source}</i>`;
    if (ref.volume) {
      sourcePart += `, ${ref.volume}`;
      if (ref.issue) {
        sourcePart += `(${ref.issue})`;
      }
    }
    if (ref.pages) {
      sourcePart += `, ${ref.pages}`;
    }
    parts.push(`${sourcePart}.`);
  } else if (ref.type === 'book' && ref.publisher) {
    parts.push(`${ref.publisher}.`);
  }
  
  // DOI or URL
  if (ref.doi) {
    parts.push(`https://doi.org/${ref.doi}`);
  } else if (ref.url) {
    parts.push(ref.url);
  }
  
  return parts.join(' ');
}

/**
 * Format reference in MLA 9th edition style
 */
export function formatMLA(ref: Reference): string {
  const parts: string[] = [];
  
  // Authors
  if (ref.authors.length > 0) {
    if (ref.authors.length === 1) {
      // Reverse first author (Last, First)
      parts.push(`${ref.authors[0]}.`);
    } else if (ref.authors.length === 2) {
      parts.push(`${ref.authors[0]}, and ${ref.authors[1]}.`);
    } else {
      parts.push(`${ref.authors[0]}, et al.`);
    }
  }
  
  // Title
  if (ref.type === 'journal') {
    parts.push(`"${ref.title}."`);
  } else {
    parts.push(`<i>${ref.title}</i>.`);
  }
  
  // Source
  if (ref.type === 'journal' && ref.source) {
    let sourcePart = `<i>${ref.source}</i>`;
    if (ref.volume) {
      sourcePart += `, vol. ${ref.volume}`;
      if (ref.issue) {
        sourcePart += `, no. ${ref.issue}`;
      }
    }
    parts.push(`${sourcePart},`);
  }
  
  // Year and pages
  if (ref.year) {
    parts.push(`${ref.year},`);
  }
  if (ref.pages) {
    parts.push(`pp. ${ref.pages}.`);
  }
  
  // DOI or URL
  if (ref.doi) {
    parts.push(`https://doi.org/${ref.doi}.`);
  } else if (ref.url) {
    parts.push(`${ref.url}.`);
  }
  
  return parts.join(' ');
}

/**
 * Format reference in IEEE style
 */
export function formatIEEE(ref: Reference, index: number): string {
  const parts: string[] = [];
  
  // Number
  parts.push(`[${index}]`);
  
  // Authors
  if (ref.authors.length > 0) {
    if (ref.authors.length <= 6) {
      const authorList = ref.authors.map(a => {
        const nameParts = a.split(' ');
        if (nameParts.length >= 2) {
          return `${nameParts[0][0]}. ${nameParts.slice(1).join(' ')}`;
        }
        return a;
      }).join(', ');
      parts.push(authorList);
    } else {
      const first = ref.authors[0].split(' ');
      parts.push(`${first[0][0]}. ${first.slice(1).join(' ')} et al.`);
    }
  }
  
  // Title
  parts.push(`"${ref.title},"`);
  
  // Source
  if (ref.type === 'journal' && ref.source) {
    let sourcePart = `<i>${ref.source}</i>`;
    if (ref.volume) {
      sourcePart += `, vol. ${ref.volume}`;
      if (ref.issue) {
        sourcePart += `, no. ${ref.issue}`;
      }
    }
    if (ref.pages) {
      sourcePart += `, pp. ${ref.pages}`;
    }
    parts.push(`${sourcePart},`);
  }
  
  // Year
  parts.push(`${ref.year}.`);
  
  // DOI
  if (ref.doi) {
    parts.push(`doi: ${ref.doi}.`);
  }
  
  return parts.join(' ');
}

/**
 * Format reference in Chicago 17th edition style
 */
export function formatChicago(ref: Reference): string {
  const parts: string[] = [];
  
  // Authors
  if (ref.authors.length > 0) {
    if (ref.authors.length === 1) {
      parts.push(`${ref.authors[0]}.`);
    } else if (ref.authors.length === 2) {
      parts.push(`${ref.authors[0]}, and ${ref.authors[1]}.`);
    } else if (ref.authors.length === 3) {
      parts.push(`${ref.authors[0]}, ${ref.authors[1]}, and ${ref.authors[2]}.`);
    } else {
      parts.push(`${ref.authors[0]} et al.`);
    }
  }
  
  // Title
  if (ref.type === 'journal') {
    parts.push(`"${ref.title}."`);
  } else {
    parts.push(`<i>${ref.title}</i>.`);
  }
  
  // Source
  if (ref.type === 'journal' && ref.source) {
    let sourcePart = `<i>${ref.source}</i>`;
    if (ref.volume) {
      sourcePart += ` ${ref.volume}`;
      if (ref.issue) {
        sourcePart += `, no. ${ref.issue}`;
      }
    }
    parts.push(sourcePart);
  } else if (ref.type === 'book') {
    if (ref.location && ref.publisher) {
      parts.push(`${ref.location}: ${ref.publisher},`);
    }
  }
  
  // Year and pages
  parts.push(`(${ref.year})`);
  if (ref.pages) {
    parts.push(`: ${ref.pages}.`);
  } else {
    parts.push('.');
  }
  
  // DOI or URL
  if (ref.doi) {
    parts.push(`https://doi.org/${ref.doi}.`);
  } else if (ref.url) {
    parts.push(ref.url);
  }
  
  return parts.join(' ');
}

/**
 * Format reference in Harvard style
 */
export function formatHarvard(ref: Reference): string {
  const parts: string[] = [];
  
  // Authors
  if (ref.authors.length > 0) {
    if (ref.authors.length === 1) {
      parts.push(`${ref.authors[0]}`);
    } else if (ref.authors.length === 2) {
      parts.push(`${ref.authors[0]} and ${ref.authors[1]}`);
    } else if (ref.authors.length === 3) {
      parts.push(`${ref.authors[0]}, ${ref.authors[1]} and ${ref.authors[2]}`);
    } else {
      parts.push(`${ref.authors[0]} et al.`);
    }
  }
  
  // Year
  parts.push(`(${ref.year})`);
  
  // Title
  if (ref.type === 'journal') {
    parts.push(`'${ref.title}',`);
  } else {
    parts.push(`<i>${ref.title}</i>,`);
  }
  
  // Source
  if (ref.type === 'journal' && ref.source) {
    let sourcePart = `<i>${ref.source}</i>`;
    if (ref.volume) {
      sourcePart += `, ${ref.volume}`;
      if (ref.issue) {
        sourcePart += `(${ref.issue})`;
      }
    }
    if (ref.pages) {
      sourcePart += `, pp. ${ref.pages}`;
    }
    parts.push(`${sourcePart}.`);
  } else if (ref.type === 'book' && ref.publisher) {
    if (ref.location) {
      parts.push(`${ref.location}: ${ref.publisher}.`);
    } else {
      parts.push(`${ref.publisher}.`);
    }
  }
  
  // DOI or URL
  if (ref.doi) {
    parts.push(`doi: ${ref.doi}`);
  } else if (ref.url) {
    parts.push(`Available at: ${ref.url}`);
    if (ref.accessDate) {
      parts.push(`(Accessed: ${ref.accessDate})`);
    }
  }
  
  return parts.join(' ');
}

/**
 * Format reference based on citation style
 */
export function formatReference(ref: Reference, style: CitationStyle, index?: number): string {
  switch (style) {
    case 'APA':
      return formatAPA(ref);
    case 'MLA':
      return formatMLA(ref);
    case 'IEEE':
      return formatIEEE(ref, index || 1);
    case 'Chicago':
      return formatChicago(ref);
    case 'Harvard':
      return formatHarvard(ref);
    default:
      return formatAPA(ref);
  }
}

/**
 * Generate bibliography from list of references
 */
export function generateBibliography(references: Reference[], style: CitationStyle): string {
  const lines: string[] = [];
  
  // Add header
  switch (style) {
    case 'APA':
    case 'Harvard':
    case 'IEEE':
      lines.push('References\n');
      break;
    case 'MLA':
      lines.push('Works Cited\n');
      break;
    case 'Chicago':
      lines.push('Bibliography\n');
      break;
  }
  
  // Sort references
  const sorted = sortReferences(references, style);
  
  // Format each reference
  sorted.forEach((ref, index) => {
    const formatted = formatReference(ref, style, index + 1);
    lines.push(formatted);
  });
  
  return lines.join('\n');
}

/**
 * Sort references according to style guidelines
 */
function sortReferences(references: Reference[], style: CitationStyle): Reference[] {
  const sorted = [...references];
  
  switch (style) {
    case 'IEEE':
      // IEEE uses numbered order (as cited in text)
      // Keep original order
      return sorted;
    
    case 'APA':
    case 'MLA':
    case 'Chicago':
    case 'Harvard':
      // Alphabetical by first author's last name
      sorted.sort((a, b) => {
        const authorA = a.authors[0] || '';
        const authorB = b.authors[0] || '';
        return authorA.localeCompare(authorB);
      });
      return sorted;
    
    default:
      return sorted;
  }
}

/**
 * Extract reference information from formatted text
 */
export function parseReference(text: string): Partial<Reference> | null {
  const ref: Partial<Reference> = {};
  
  // Extract year
  const yearMatch = text.match(/\((\d{4})\)/);
  if (yearMatch) {
    ref.year = yearMatch[1];
  }
  
  // Extract DOI
  const doiMatch = text.match(/(?:doi:|https?:\/\/doi\.org\/)([^\s]+)/i);
  if (doiMatch) {
    ref.doi = doiMatch[1];
  }
  
  // Extract URL
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch && !doiMatch) {
    ref.url = urlMatch[0];
  }
  
  // Extract title (between quotes or italics)
  const titleMatch = text.match(/"([^"]+)"|'([^']+)'|<i>([^<]+)<\/i>/);
  if (titleMatch) {
    ref.title = titleMatch[1] || titleMatch[2] || titleMatch[3];
  }
  
  // Simple author extraction (can be enhanced)
  const authorMatch = text.match(/^([A-Z][a-z]+(?:,?\s+(?:&|and)?\s*[A-Z][a-z]+)*)/);
  if (authorMatch) {
    ref.authors = authorMatch[1].split(/(?:,\s*(?:&|and)\s*|,\s+)/);
  }
  
  return Object.keys(ref).length > 0 ? ref : null;
}

/**
 * Validate reference completeness
 */
export function validateReference(ref: Reference): string[] {
  const errors: string[] = [];
  
  if (!ref.authors || ref.authors.length === 0) {
    errors.push('Missing authors');
  }
  
  if (!ref.year) {
    errors.push('Missing publication year');
  }
  
  if (!ref.title) {
    errors.push('Missing title');
  }
  
  if (ref.type === 'journal' && !ref.source) {
    errors.push('Missing journal name');
  }
  
  if (ref.type === 'book' && !ref.publisher) {
    errors.push('Missing publisher');
  }
  
  return errors;
}

/**
 * Convert between citation styles
 */
export function convertCitationStyle(
  _currentStyle: CitationStyle,
  targetStyle: CitationStyle,
  references: Reference[]
): string {
  return generateBibliography(references, targetStyle);
}
