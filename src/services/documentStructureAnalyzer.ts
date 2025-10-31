/**
 * Document Structure Analyzer
 * Auto-detects document sections and provides structure analysis
 */

export interface Section {
  id: string;
  title: string;
  type: SectionType;
  level: number;
  startOffset: number;
  endOffset: number;
  wordCount: number;
  children: Section[];
  parent?: Section;
}

export type SectionType = 
  | 'abstract'
  | 'introduction'
  | 'literature-review'
  | 'methodology'
  | 'results'
  | 'discussion'
  | 'conclusion'
  | 'references'
  | 'acknowledgments'
  | 'appendix'
  | 'other';

export interface StructureAnalysis {
  sections: Section[];
  structureScore: number;
  missingRequiredSections: SectionType[];
  totalWordCount: number;
  sectionCompletionStatus: {
    section: SectionType;
    status: 'complete' | 'incomplete' | 'missing';
    wordCount: number;
    expectedMinWords: number;
    warnings: string[];
  }[];
}

const REQUIRED_SECTIONS_PHD: SectionType[] = [
  'abstract',
  'introduction',
  'literature-review',
  'methodology',
  'results',
  'discussion',
  'conclusion',
  'references'
];

const SECTION_MIN_WORDS: Record<SectionType, number> = {
  'abstract': 150,
  'introduction': 500,
  'literature-review': 1000,
  'methodology': 500,
  'results': 500,
  'discussion': 500,
  'conclusion': 300,
  'references': 10,
  'acknowledgments': 0,
  'appendix': 0,
  'other': 0
};

const SECTION_PATTERNS: Record<string, SectionType> = {
  'abstract': 'abstract',
  'introduction': 'introduction',
  'literature review': 'literature-review',
  'related work': 'literature-review',
  'background': 'literature-review',
  'methodology': 'methodology',
  'methods': 'methodology',
  'materials and methods': 'methodology',
  'results': 'results',
  'findings': 'results',
  'discussion': 'discussion',
  'conclusion': 'conclusion',
  'conclusions': 'conclusion',
  'references': 'references',
  'bibliography': 'references',
  'works cited': 'references',
  'acknowledgments': 'acknowledgments',
  'acknowledgements': 'acknowledgments',
  'appendix': 'appendix',
  'appendices': 'appendix'
};

/**
 * Analyze document structure
 */
export function analyzeDocumentStructure(content: string): StructureAnalysis {
  const sections = extractSections(content);
  const structureScore = calculateStructureScore(sections);
  const missingRequiredSections = findMissingRequiredSections(sections);
  const sectionCompletionStatus = analyzeSectionCompletion(sections);
  const totalWordCount = content.split(/\s+/).filter(w => w.length > 0).length;

  return {
    sections,
    structureScore,
    missingRequiredSections,
    totalWordCount,
    sectionCompletionStatus
  };
}

/**
 * Extract sections from document content
 */
function extractSections(content: string): Section[] {
  const lines = content.split('\n');
  const sections: Section[] = [];
  let sectionIdCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for markdown headings (# ## ###)
    const markdownMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (markdownMatch) {
      const level = markdownMatch[1].length;
      const title = markdownMatch[2].trim();
      const type = detectSectionType(title);
      const startOffset = lines.slice(0, i).join('\n').length + (i > 0 ? 1 : 0);
      
      sections.push({
        id: `section-${sectionIdCounter++}`,
        title,
        type,
        level,
        startOffset,
        endOffset: startOffset + line.length,
        wordCount: 0,
        children: []
      });
      continue;
    }

    // Check for ALL CAPS section titles
    if (line.length > 0 && line === line.toUpperCase() && /^[A-Z\s]+$/.test(line)) {
      const title = line;
      const type = detectSectionType(title);
      const startOffset = lines.slice(0, i).join('\n').length + (i > 0 ? 1 : 0);
      
      sections.push({
        id: `section-${sectionIdCounter++}`,
        title,
        type,
        level: 1,
        startOffset,
        endOffset: startOffset + line.length,
        wordCount: 0,
        children: []
      });
    }
  }

  // Calculate word counts for each section
  calculateSectionWordCounts(sections, content);

  // Build hierarchical structure
  return buildHierarchy(sections);
}

/**
 * Detect section type from title
 */
function detectSectionType(title: string): SectionType {
  const normalizedTitle = title.toLowerCase().trim();
  
  for (const [pattern, type] of Object.entries(SECTION_PATTERNS)) {
    if (normalizedTitle.includes(pattern)) {
      return type;
    }
  }
  
  return 'other';
}

/**
 * Calculate word counts for sections
 */
function calculateSectionWordCounts(sections: Section[], content: string): void {
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const nextSection = sections[i + 1];
    
    const sectionContent = nextSection 
      ? content.substring(section.endOffset, nextSection.startOffset)
      : content.substring(section.endOffset);
    
    section.wordCount = sectionContent.split(/\s+/).filter(w => w.length > 0).length;
  }
}

/**
 * Build hierarchical section tree
 */
function buildHierarchy(sections: Section[]): Section[] {
  const root: Section[] = [];
  const stack: Section[] = [];

  for (const section of sections) {
    // Pop sections from stack that have higher or equal level
    while (stack.length > 0 && stack[stack.length - 1].level >= section.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      // Top-level section
      root.push(section);
    } else {
      // Child section
      const parent = stack[stack.length - 1];
      parent.children.push(section);
      section.parent = parent;
    }

    stack.push(section);
  }

  return root;
}

/**
 * Calculate structure score (0-100%)
 */
function calculateStructureScore(sections: Section[]): number {
  let score = 0;
  const flatSections = flattenSections(sections);
  
  // Check for required sections (50 points)
  const foundSectionTypes = new Set(flatSections.map(s => s.type));
  const requiredFound = REQUIRED_SECTIONS_PHD.filter(type => foundSectionTypes.has(type));
  score += (requiredFound.length / REQUIRED_SECTIONS_PHD.length) * 50;

  // Check section order (25 points)
  const orderScore = calculateOrderScore(flatSections);
  score += orderScore * 25;

  // Check section completeness (25 points)
  const completenessScore = calculateCompletenessScore(flatSections);
  score += completenessScore * 25;

  return Math.round(score);
}

/**
 * Flatten hierarchical sections
 */
function flattenSections(sections: Section[]): Section[] {
  const result: Section[] = [];
  
  function traverse(sectionList: Section[]) {
    for (const section of sectionList) {
      result.push(section);
      if (section.children.length > 0) {
        traverse(section.children);
      }
    }
  }
  
  traverse(sections);
  return result;
}

/**
 * Calculate order score based on expected section order
 */
function calculateOrderScore(sections: Section[]): number {
  const expectedOrder: SectionType[] = [
    'abstract',
    'introduction',
    'literature-review',
    'methodology',
    'results',
    'discussion',
    'conclusion',
    'references'
  ];

  let orderMatches = 0;
  let lastIndex = -1;

  for (const section of sections) {
    const expectedIndex = expectedOrder.indexOf(section.type);
    if (expectedIndex > lastIndex) {
      orderMatches++;
      lastIndex = expectedIndex;
    }
  }

  return sections.length > 0 ? orderMatches / expectedOrder.length : 0;
}

/**
 * Calculate completeness score based on word counts
 */
function calculateCompletenessScore(sections: Section[]): number {
  let completeCount = 0;
  const relevantSections = sections.filter(s => s.type !== 'other');

  for (const section of relevantSections) {
    const minWords = SECTION_MIN_WORDS[section.type] || 0;
    if (section.wordCount >= minWords) {
      completeCount++;
    }
  }

  return relevantSections.length > 0 ? completeCount / relevantSections.length : 0;
}

/**
 * Find missing required sections
 */
function findMissingRequiredSections(sections: Section[]): SectionType[] {
  const flatSections = flattenSections(sections);
  const foundTypes = new Set(flatSections.map(s => s.type));
  
  return REQUIRED_SECTIONS_PHD.filter(type => !foundTypes.has(type));
}

/**
 * Analyze section completion status
 */
function analyzeSectionCompletion(sections: Section[]) {
  const flatSections = flattenSections(sections);
  const result: StructureAnalysis['sectionCompletionStatus'] = [];

  for (const requiredType of REQUIRED_SECTIONS_PHD) {
    const section = flatSections.find(s => s.type === requiredType);
    const minWords = SECTION_MIN_WORDS[requiredType];

    if (!section) {
      result.push({
        section: requiredType,
        status: 'missing',
        wordCount: 0,
        expectedMinWords: minWords,
        warnings: [`Missing ${requiredType} section`]
      });
    } else if (section.wordCount < minWords) {
      result.push({
        section: requiredType,
        status: 'incomplete',
        wordCount: section.wordCount,
        expectedMinWords: minWords,
        warnings: [`Section is too short (${section.wordCount} words, expected at least ${minWords})`]
      });
    } else {
      result.push({
        section: requiredType,
        status: 'complete',
        wordCount: section.wordCount,
        expectedMinWords: minWords,
        warnings: []
      });
    }
  }

  return result;
}
