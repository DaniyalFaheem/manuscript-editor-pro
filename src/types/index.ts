export interface Suggestion {
  id: string;
  type: 'grammar' | 'punctuation' | 'style' | 'spelling';
  severity: 'error' | 'warning' | 'info';
  message: string;
  original: string;
  suggestion: string;
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
  startOffset: number;
  endOffset: number;
}

export interface TextMetrics {
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  paragraphCount: number;
  complexWordCount: number;
  averageWordsPerSentence: number;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
  passiveVoicePercentage: number;
}

export interface DocumentState {
  content: string;
  suggestions: Suggestion[];
  metrics: TextMetrics;
  isDarkMode: boolean;
  fileName: string;
}

export type ExportFormat = 'txt' | 'md' | 'html' | 'docx' | 'pdf' | 'latex';

export type FileFormat = 'docx' | 'pdf' | 'txt' | 'md' | 'tex';

// Re-export types from services
export type { StructureAnalysis, Section, SectionType } from '../services/documentStructureAnalyzer';
export type { SearchMatch, SearchOptions, SearchResult } from '../services/searchReplace';
export type { ShortcutAction } from '../services/keyboardShortcuts';
export type { NotationError, NotationErrorType } from '../services/scientificNotationValidator';
export type { LanguageVariant, LanguageIssue, LanguageAnalysis } from '../services/languageStyleSwitcher';
export type { ExportOptions } from '../services/exportManager';
