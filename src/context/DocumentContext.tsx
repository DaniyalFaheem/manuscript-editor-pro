import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Suggestion, TextMetrics } from '../types';
import { analyzeText } from '../services/textAnalyzer';
import { calculateReadabilityMetrics } from '../services/readabilityCalculator';

interface DocumentContextType {
  content: string;
  suggestions: Suggestion[];
  metrics: TextMetrics;
  isDarkMode: boolean;
  fileName: string;
  setContent: (content: string) => void;
  toggleDarkMode: () => void;
  setFileName: (name: string) => void;
  acceptSuggestion: (id: string) => void;
  dismissSuggestion: (id: string) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

const STORAGE_KEY = 'manuscript-editor-content';
const DARK_MODE_KEY = 'manuscript-editor-dark-mode';

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

  // Load content from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setContentState(saved);
    }
  }, []);

  // Analyze text with debouncing
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (content) {
        const newSuggestions = await analyzeText(content);
        setSuggestions(newSuggestions);
        
        const newMetrics = calculateReadabilityMetrics(content);
        setMetrics(newMetrics);
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
      }
    }, 1000);

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

  const setContent = useCallback((newContent: string) => {
    setContentState(newContent);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
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
    setContent,
    toggleDarkMode,
    setFileName,
    acceptSuggestion,
    dismissSuggestion,
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
