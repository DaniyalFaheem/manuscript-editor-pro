/**
 * AI Provider Types and Interfaces
 * Defines the contract for all AI providers (Ollama, WebLLM, Transformers.js)
 */

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  model?: string;
}

export interface AnalysisTask {
  type: 'grammar' | 'style' | 'citations' | 'plagiarism' | 'metrics' | 'full';
  options?: Record<string, unknown>;
}

export interface AnalysisResult {
  type: string;
  suggestions: Suggestion[];
  metrics?: QualityMetrics;
}

export interface Suggestion {
  id: string;
  type: 'grammar' | 'style' | 'spelling' | 'punctuation' | 'citation';
  severity: 'error' | 'warning' | 'info';
  message: string;
  context: string;
  offset: number;
  length: number;
  replacements?: string[];
}

export interface QualityMetrics {
  overallScore: number;
  grammarAccuracy: number;
  styleConsistency: number;
  citationCompleteness: number;
  readabilityGrade: number;
  wordCount: number;
  improvements: string[];
}

export const AIProviderStatus = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
  LOADING: 'loading',
  ERROR: 'error'
} as const;

export type AIProviderStatus = typeof AIProviderStatus[keyof typeof AIProviderStatus];

export interface AIProviderInfo {
  name: string;
  status: AIProviderStatus;
  model?: string;
  capabilities: string[];
}

/**
 * Unified AI Provider Interface
 * All AI providers must implement this interface
 */
export interface AIProvider {
  /**
   * Provider name (e.g., 'ollama', 'webllm', 'transformers')
   */
  readonly name: string;

  /**
   * Check if the provider is available and ready to use
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get provider information including status and capabilities
   */
  getInfo(): Promise<AIProviderInfo>;

  /**
   * Initialize the provider with optional configuration
   */
  initialize(config?: Record<string, unknown>): Promise<void>;

  /**
   * Send a chat message and get a complete response
   */
  chat(messages: Message[], options?: ChatOptions): Promise<string>;

  /**
   * Stream chat responses in real-time
   */
  stream(
    messages: Message[],
    onChunk: (chunk: string) => void,
    options?: ChatOptions
  ): Promise<void>;

  /**
   * Analyze document content for issues
   */
  analyzeDocument(content: string, task: AnalysisTask): Promise<AnalysisResult>;

  /**
   * Clean up resources
   */
  dispose(): Promise<void>;
}

/**
 * Configuration for AI providers
 */
export interface AIConfig {
  preferredProvider?: 'ollama' | 'webllm' | 'transformers' | 'auto';
  ollamaUrl?: string;
  selectedModel?: string;
  enableRealtime?: boolean;
  enablePrivacyMode?: boolean;
  grammarStrictness?: 'lenient' | 'normal' | 'strict';
  citationStyle?: 'APA' | 'MLA' | 'Chicago' | 'IEEE' | 'Harvard';
}
