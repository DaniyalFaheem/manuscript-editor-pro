/**
 * Academic Structure Validator
 * Validates research paper structure and ensures all required sections are present
 * Supports PhD dissertations, M.Phil theses, and journal articles
 */

import type { Suggestion } from '../types';
import { getPositionFromOffset } from '../utils/textUtils';

export type DocumentType = 'journal-article' | 'dissertation' | 'thesis' | 'conference-paper';

export interface Section {
  name: string;
  startOffset: number;
  endOffset: number;
  level: number;
  content: string;
}

export interface StructureRequirement {
  section: string;
  required: boolean;
  alternatives?: string[];
  description: string;
}

/**
 * Get structure requirements for different document types
 */
export function getStructureRequirements(type: DocumentType): StructureRequirement[] {
  const commonSections: StructureRequirement[] = [
    {
      section: 'Abstract',
      required: true,
      alternatives: ['Summary'],
      description: 'Brief summary of the research (150-300 words)',
    },
    {
      section: 'Introduction',
      required: true,
      alternatives: ['Background'],
      description: 'Research context, problem statement, and objectives',
    },
    {
      section: 'Literature Review',
      required: true,
      alternatives: ['Related Work', 'Background', 'Theoretical Framework'],
      description: 'Review of existing research and theoretical foundation',
    },
    {
      section: 'Methodology',
      required: true,
      alternatives: ['Methods', 'Materials and Methods', 'Research Methods'],
      description: 'Detailed description of research methods and procedures',
    },
    {
      section: 'Results',
      required: true,
      alternatives: ['Findings'],
      description: 'Presentation of research findings without interpretation',
    },
    {
      section: 'Discussion',
      required: true,
      alternatives: ['Analysis', 'Results and Discussion'],
      description: 'Interpretation of results and comparison with existing literature',
    },
    {
      section: 'Conclusion',
      required: true,
      alternatives: ['Conclusions', 'Summary and Conclusions'],
      description: 'Summary of findings, implications, and future research directions',
    },
    {
      section: 'References',
      required: true,
      alternatives: ['Bibliography', 'Works Cited'],
      description: 'List of all cited sources',
    },
  ];

  switch (type) {
    case 'dissertation':
      return [
        {
          section: 'Title Page',
          required: true,
          alternatives: [],
          description: 'Title, author, institution, date',
        },
        {
          section: 'Abstract',
          required: true,
          alternatives: ['Summary'],
          description: 'Comprehensive abstract (300-500 words)',
        },
        {
          section: 'Acknowledgments',
          required: false,
          alternatives: ['Acknowledgements'],
          description: 'Recognition of support and contributions',
        },
        {
          section: 'Table of Contents',
          required: true,
          alternatives: ['Contents'],
          description: 'List of chapters and sections with page numbers',
        },
        ...commonSections,
        {
          section: 'Appendices',
          required: false,
          alternatives: ['Appendix'],
          description: 'Supplementary materials',
        },
      ];

    case 'thesis':
      return [
        {
          section: 'Title Page',
          required: true,
          alternatives: [],
          description: 'Title, author, institution, date',
        },
        {
          section: 'Abstract',
          required: true,
          alternatives: ['Summary'],
          description: 'Brief abstract (250-350 words)',
        },
        ...commonSections,
      ];

    case 'conference-paper':
      return [
        {
          section: 'Abstract',
          required: true,
          alternatives: ['Summary'],
          description: 'Concise abstract (150-200 words)',
        },
        {
          section: 'Introduction',
          required: true,
          alternatives: [],
          description: 'Brief introduction to the problem and approach',
        },
        {
          section: 'Methodology',
          required: true,
          alternatives: ['Methods', 'Approach'],
          description: 'Description of the research method',
        },
        {
          section: 'Results',
          required: true,
          alternatives: ['Findings', 'Evaluation'],
          description: 'Key findings and results',
        },
        {
          section: 'Conclusion',
          required: true,
          alternatives: ['Conclusions'],
          description: 'Summary and future work',
        },
        {
          section: 'References',
          required: true,
          alternatives: ['Bibliography'],
          description: 'List of cited sources',
        },
      ];

    case 'journal-article':
    default:
      return commonSections;
  }
}

/**
 * Extract sections from document
 */
export function extractSections(text: string): Section[] {
  const sections: Section[] = [];
  
  // Patterns for section headers (various levels)
  const patterns = [
    // Level 1: All caps or numbered
    /^(?:(\d+\.?\s+)?([A-Z][A-Z\s]+))$/gm,
    // Level 2: Title case
    /^(?:(\d+\.\d+\.?\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*))$/gm,
    // Level 3: Markdown-style headers
    /^#+\s+(.+)$/gm,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = (match[2] || match[1]).trim();
      const startOffset = match.index;
      
      // Determine level based on pattern and formatting
      let level = 1;
      if (match[0].startsWith('#')) {
        level = match[0].match(/^#+/)?.[0].length || 1;
      } else if (match[1] && match[1].includes('.')) {
        level = match[1].split('.').filter(n => n.trim()).length;
      }
      
      sections.push({
        name,
        startOffset,
        endOffset: startOffset + match[0].length,
        level,
        content: '',
      });
    }
  }
  
  // Sort by position and extract content for each section
  sections.sort((a, b) => a.startOffset - b.startOffset);
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const nextSection = sections[i + 1];
    const endOffset = nextSection ? nextSection.startOffset : text.length;
    section.content = text.substring(section.endOffset, endOffset).trim();
  }
  
  return sections;
}

/**
 * Validate document structure
 */
export function validateStructure(text: string, type: DocumentType): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const sections = extractSections(text);
  const requirements = getStructureRequirements(type);
  
  // Check for missing required sections
  for (const req of requirements) {
    if (req.required) {
      const found = sections.some(s => {
        const sectionName = s.name.toLowerCase().trim();
        const requiredName = req.section.toLowerCase();
        
        if (sectionName === requiredName) return true;
        
        if (req.alternatives) {
          return req.alternatives.some(alt => 
            sectionName === alt.toLowerCase()
          );
        }
        
        return false;
      });
      
      if (!found) {
        suggestions.push({
          id: `structure-missing-${req.section}`,
          type: 'style',
          severity: 'error',
          message: `Missing required section: ${req.section}`,
          original: '',
          suggestion: `Add a ${req.section} section. ${req.description}`,
          startLine: 0,
          endLine: 0,
          startColumn: 0,
          endColumn: 0,
          startOffset: 0,
          endOffset: 0,
        });
      }
    }
  }
  
  // Validate section order
  const sectionOrder = validateSectionOrder(sections, type);
  suggestions.push(...sectionOrder);
  
  // Validate section content
  for (const section of sections) {
    const contentIssues = validateSectionContent(section, type);
    suggestions.push(...contentIssues);
  }
  
  return suggestions;
}

/**
 * Validate section order
 */
function validateSectionOrder(sections: Section[], type: DocumentType): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const expectedOrder = getStructureRequirements(type).map(r => r.section.toLowerCase());
  
  const actualOrder = sections
    .filter(s => s.level === 1)
    .map(s => s.name.toLowerCase());
  
  // Check if major sections are in correct order
  let lastExpectedIndex = -1;
  for (const actual of actualOrder) {
    const expectedIndex = expectedOrder.findIndex(e => 
      actual.includes(e) || e.includes(actual)
    );
    
    if (expectedIndex !== -1) {
      if (expectedIndex < lastExpectedIndex) {
        const section = sections.find(s => s.name.toLowerCase() === actual);
        if (section) {
          const pos = getPositionFromOffset('', section.startOffset);
          suggestions.push({
            id: `structure-order-${section.startOffset}`,
            type: 'style',
            severity: 'warning',
            message: `Section "${section.name}" appears to be out of order`,
            original: section.name,
            suggestion: 'Consider reordering sections to follow standard academic structure',
            startLine: pos.line,
            endLine: pos.line,
            startColumn: pos.column,
            endColumn: pos.column + section.name.length,
            startOffset: section.startOffset,
            endOffset: section.endOffset,
          });
        }
      }
      lastExpectedIndex = expectedIndex;
    }
  }
  
  return suggestions;
}

/**
 * Validate section content
 */
function validateSectionContent(section: Section, type: DocumentType): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const sectionName = section.name.toLowerCase();
  const wordCount = section.content.split(/\s+/).filter(w => w.length > 0).length;
  
  // Abstract length validation
  if (sectionName.includes('abstract')) {
    let minWords = 150;
    let maxWords = 300;
    
    if (type === 'dissertation') {
      minWords = 300;
      maxWords = 500;
    } else if (type === 'conference-paper') {
      minWords = 150;
      maxWords = 200;
    }
    
    if (wordCount < minWords) {
      const pos = getPositionFromOffset('', section.startOffset);
      suggestions.push({
        id: `structure-abstract-short-${section.startOffset}`,
        type: 'style',
        severity: 'warning',
        message: `Abstract is too short (${wordCount} words). Minimum: ${minWords} words`,
        original: section.name,
        suggestion: `Expand the abstract to at least ${minWords} words`,
        startLine: pos.line,
        endLine: pos.line,
        startColumn: pos.column,
        endColumn: pos.column + section.name.length,
        startOffset: section.startOffset,
        endOffset: section.endOffset,
      });
    } else if (wordCount > maxWords) {
      const pos = getPositionFromOffset('', section.startOffset);
      suggestions.push({
        id: `structure-abstract-long-${section.startOffset}`,
        type: 'style',
        severity: 'warning',
        message: `Abstract is too long (${wordCount} words). Maximum: ${maxWords} words`,
        original: section.name,
        suggestion: `Reduce the abstract to ${maxWords} words or fewer`,
        startLine: pos.line,
        endLine: pos.line,
        startColumn: pos.column,
        endColumn: pos.column + section.name.length,
        startOffset: section.startOffset,
        endOffset: section.endOffset,
      });
    }
  }
  
  // Check for empty sections
  if (wordCount < 10) {
    const pos = getPositionFromOffset('', section.startOffset);
    suggestions.push({
      id: `structure-empty-${section.startOffset}`,
      type: 'style',
      severity: 'error',
      message: `Section "${section.name}" appears to be empty or too short`,
      original: section.name,
      suggestion: 'Add content to this section or remove it',
      startLine: pos.line,
      endLine: pos.line,
      startColumn: pos.column,
      endColumn: pos.column + section.name.length,
      startOffset: section.startOffset,
      endOffset: section.endOffset,
    });
  }
  
  return suggestions;
}

/**
 * Check for proper heading hierarchy
 */
export function validateHeadingHierarchy(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const sections = extractSections(text);
  
  let previousLevel = 0;
  for (const section of sections) {
    // Check for skipped levels (e.g., jumping from level 1 to level 3)
    if (section.level > previousLevel + 1) {
      const pos = getPositionFromOffset(text, section.startOffset);
      suggestions.push({
        id: `structure-heading-skip-${section.startOffset}`,
        type: 'style',
        severity: 'warning',
        message: `Heading hierarchy skips a level (from level ${previousLevel} to level ${section.level})`,
        original: section.name,
        suggestion: 'Use consecutive heading levels without skipping',
        startLine: pos.line,
        endLine: pos.line,
        startColumn: pos.column,
        endColumn: pos.column + section.name.length,
        startOffset: section.startOffset,
        endOffset: section.endOffset,
      });
    }
    
    previousLevel = section.level;
  }
  
  return suggestions;
}

/**
 * Validate table and figure numbering
 */
export function validateNumberedElements(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Extract table numbers
  const tablePattern = /Table\s+(\d+)[:.]?/gi;
  const tableNumbers: number[] = [];
  let match;
  
  while ((match = tablePattern.exec(text)) !== null) {
    tableNumbers.push(parseInt(match[1]));
  }
  
  // Check for sequential numbering
  for (let i = 0; i < tableNumbers.length; i++) {
    if (tableNumbers[i] !== i + 1) {
      suggestions.push({
        id: `structure-table-numbering-${i}`,
        type: 'style',
        severity: 'warning',
        message: `Table numbering is not sequential (found Table ${tableNumbers[i]}, expected Table ${i + 1})`,
        original: `Table ${tableNumbers[i]}`,
        suggestion: 'Ensure tables are numbered sequentially',
        startLine: 0,
        endLine: 0,
        startColumn: 0,
        endColumn: 0,
        startOffset: 0,
        endOffset: 0,
      });
    }
  }
  
  // Extract figure numbers
  const figurePattern = /Figure\s+(\d+)[:.]?/gi;
  const figureNumbers: number[] = [];
  
  while ((match = figurePattern.exec(text)) !== null) {
    figureNumbers.push(parseInt(match[1]));
  }
  
  // Check for sequential numbering
  for (let i = 0; i < figureNumbers.length; i++) {
    if (figureNumbers[i] !== i + 1) {
      suggestions.push({
        id: `structure-figure-numbering-${i}`,
        type: 'style',
        severity: 'warning',
        message: `Figure numbering is not sequential (found Figure ${figureNumbers[i]}, expected Figure ${i + 1})`,
        original: `Figure ${figureNumbers[i]}`,
        suggestion: 'Ensure figures are numbered sequentially',
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
 * Validate methodology section completeness
 */
export function validateMethodologySection(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const sections = extractSections(text);
  
  const methodSection = sections.find(s => 
    s.name.toLowerCase().includes('method') ||
    s.name.toLowerCase().includes('material')
  );
  
  if (!methodSection) return suggestions;
  
  const content = methodSection.content.toLowerCase();
  
  // Check for essential methodology components
  const essentialComponents = [
    { term: ['participant', 'subject', 'sample'], description: 'participants/subjects/sample description' },
    { term: ['procedure', 'protocol'], description: 'research procedure/protocol' },
    { term: ['material', 'instrument', 'tool', 'equipment'], description: 'materials/instruments used' },
    { term: ['analysis', 'statistical'], description: 'data analysis methods' },
  ];
  
  for (const component of essentialComponents) {
    const found = component.term.some(term => content.includes(term));
    
    if (!found) {
      const pos = getPositionFromOffset('', methodSection.startOffset);
      suggestions.push({
        id: `methodology-missing-${component.term[0]}`,
        type: 'style',
        severity: 'info',
        message: `Methodology section may be missing ${component.description}`,
        original: methodSection.name,
        suggestion: `Consider adding information about ${component.description}`,
        startLine: pos.line,
        endLine: pos.line,
        startColumn: pos.column,
        endColumn: pos.column + methodSection.name.length,
        startOffset: methodSection.startOffset,
        endOffset: methodSection.endOffset,
      });
    }
  }
  
  return suggestions;
}
