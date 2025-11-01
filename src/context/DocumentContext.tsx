import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { 
  Suggestion, 
  TextMetrics, 
  StructureAnalysis, 
  NotationError,
  LanguageVariant,
  LanguageAnalysis,
  ShortcutAction
} from '../types';
import { analyzeText } from '../services/textAnalyzer';
import { calculateReadabilityMetrics } from '../services/readabilityCalculator';
import { analyzeDocumentStructure } from '../services/documentStructureAnalyzer';
import { validateScientificNotation } from '../services/scientificNotationValidator';
import { analyzeLanguageStyle, convertToVariant } from '../services/languageStyleSwitcher';
import { PlagiarismChecker, type PlagiarismResult } from '../services/plagiarismChecker';
import { StatisticsCalculator, type DocumentStatistics } from '../services/statisticsCalculator';

interface DocumentContextType {
  content: string;
  suggestions: Suggestion[];
  metrics: TextMetrics;
  isDarkMode: boolean;
  fileName: string;
  structureAnalysis: StructureAnalysis | null;
  notationErrors: NotationError[];
  languageAnalysis: LanguageAnalysis | null;
  languageVariant: LanguageVariant;
  presentationMode: boolean;
  plagiarismResults: PlagiarismResult[];
  statistics: DocumentStatistics | null;
  setContent: (content: string) => void;
  toggleDarkMode: () => void;
  setFileName: (name: string) => void;
  acceptSuggestion: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  setLanguageVariant: (variant: LanguageVariant) => void;
  convertLanguageVariant: (targetVariant: LanguageVariant) => void;
  togglePresentationMode: () => void;
  handleShortcutAction: (action: ShortcutAction) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

const STORAGE_KEY = 'manuscript-editor-content';
const DARK_MODE_KEY = 'manuscript-editor-dark-mode';
const LANGUAGE_VARIANT_KEY = 'manuscript-editor-language-variant';

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContentState] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [metrics, setMetrics] = useState<TextMetrics>({
    wordCount: 0,
    characterCount: 0,
    sentenceCount: 0,
    paragraphCount: 0,
    complexWordCount: 0,
    averageWordsPerSentence: 0,
    fleschReadingEase: 0,
    fleschKincaidGrade: 0,
    gunningFog: 0,
    passiveVoicePercentage: 0,
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(DARK_MODE_KEY);
    return saved ? JSON.parse(saved) : false;
  });
  const [fileName, setFileName] = useState<string>('untitled.txt');
  const [structureAnalysis, setStructureAnalysis] = useState<StructureAnalysis | null>(null);
  const [notationErrors, setNotationErrors] = useState<NotationError[]>([]);
  const [languageAnalysis, setLanguageAnalysis] = useState<LanguageAnalysis | null>(null);
  const [languageVariant, setLanguageVariantState] = useState<LanguageVariant>(() => {
    const saved = localStorage.getItem(LANGUAGE_VARIANT_KEY);
    return (saved as LanguageVariant) || 'US';
  });
  const [presentationMode, setPresentationMode] = useState(false);
  const [plagiarismResults, setPlagiarismResults] = useState<PlagiarismResult[]>([]);
  const [statistics, setStatistics] = useState<DocumentStatistics | null>(null);

  // Load content from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setContentState(saved);
    }
  }, []);

  // Analyze text with debouncing and performance optimization
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (content) {
        // PERFORMANCE OPTIMIZATION: Run lightweight checks immediately
        // Heavy checks are batched and run less frequently
        
        // 1. FAST: Basic metrics (synchronous, instant)
        const newMetrics = calculateReadabilityMetrics(content);
        setMetrics(newMetrics);

        // 2. FAST: Statistics (synchronous, instant)
        const statisticsCalculator = new StatisticsCalculator();
        const stats = statisticsCalculator.calculate(content);
        setStatistics(stats);

        // 3. MEDIUM: Grammar check (async, but critical for UX)
        // Run in background without blocking
        analyzeText(content).then(newSuggestions => {
          setSuggestions(newSuggestions);
        }).catch(err => {
          console.error('Grammar check failed:', err);
          setSuggestions([]);
        });

        // 4. SLOW: Heavy analysis - only run for longer documents
        const wordCount = content.split(/\s+/).length;
        
        if (wordCount > 100) {
          // Run heavy checks asynchronously without blocking
          Promise.all([
            analyzeDocumentStructure(content),
            validateScientificNotation(content),
            analyzeLanguageStyle(content),
          ]).then(([structure, notation, language]) => {
            setStructureAnalysis(structure);
            setNotationErrors(notation);
            setLanguageAnalysis(language);
          }).catch(err => {
            console.error('Document analysis failed:', err);
          });

          // 5. VERY SLOW: Plagiarism check - only for documents > 500 words
          if (wordCount > 500) {
            const plagiarismChecker = new PlagiarismChecker();
            plagiarismChecker.checkPlagiarism(content).then(plagiarism => {
              setPlagiarismResults(plagiarism);
            }).catch(err => {
              console.error('Plagiarism check failed:', err);
            });
          } else {
            setPlagiarismResults([]);
          }
        } else {
          // Clear heavy analysis results for short documents
          setStructureAnalysis(null);
          setNotationErrors([]);
          setLanguageAnalysis(null);
          setPlagiarismResults([]);
        }
      } else {
        setSuggestions([]);
        setMetrics({
          wordCount: 0,
          characterCount: 0,
          sentenceCount: 0,
          paragraphCount: 0,
          complexWordCount: 0,
          averageWordsPerSentence: 0,
          fleschReadingEase: 0,
          fleschKincaidGrade: 0,
          gunningFog: 0,
          passiveVoicePercentage: 0,
        });
        setStructureAnalysis(null);
        setNotationErrors([]);
        setLanguageAnalysis(null);
        setPlagiarismResults([]);
        setStatistics(null);
      }
    }, 2000); // Increased from 1000ms to 2000ms for better performance

    return () => clearTimeout(timer);
  }, [content]);

  // Save content to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, content);
  }, [content]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem(DARK_MODE_KEY, JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Save language variant preference
  useEffect(() => {
    localStorage.setItem(LANGUAGE_VARIANT_KEY, languageVariant);
  }, [languageVariant]);

  const setContent = useCallback((newContent: string) => {
    setContentState(newContent);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const setLanguageVariant = useCallback((variant: LanguageVariant) => {
    setLanguageVariantState(variant);
  }, []);

  const convertLanguageVariant = useCallback((targetVariant: LanguageVariant) => {
    const converted = convertToVariant(content, targetVariant);
    setContentState(converted);
    setLanguageVariantState(targetVariant);
  }, [content]);

  const togglePresentationMode = useCallback(() => {
    setPresentationMode(prev => !prev);
  }, []);

  const handleShortcutAction = useCallback((action: ShortcutAction) => {
    // This will be implemented by the consuming components
    // Just a placeholder for the context
    console.log('Shortcut action:', action);
  }, []);

  const acceptSuggestion = useCallback((id: string) => {
    const suggestion = suggestions.find(s => s.id === id);
    if (suggestion && suggestion.suggestion) {
      const newContent = 
        content.substring(0, suggestion.startOffset) +
        suggestion.suggestion +
        content.substring(suggestion.endOffset);
      setContentState(newContent);
    }
    // Remove the suggestion
    setSuggestions(prev => prev.filter(s => s.id !== id));
  }, [suggestions, content]);

  const dismissSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  }, []);

  const value: DocumentContextType = {
    content,
    suggestions,
    metrics,
    isDarkMode,
    fileName,
    structureAnalysis,
    notationErrors,
    languageAnalysis,
    languageVariant,
    presentationMode,
    plagiarismResults,
    statistics,
    setContent,
    toggleDarkMode,
    setFileName,
    acceptSuggestion,
    dismissSuggestion,
    setLanguageVariant,
    convertLanguageVariant,
    togglePresentationMode,
    handleShortcutAction,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocument = (): DocumentContextType => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within DocumentProvider');
  }
  return context;
};
