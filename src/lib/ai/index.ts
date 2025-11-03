/**
 * AI Orchestrator
 * Manages multiple AI providers with automatic fallback
 */

import type {
  AIProvider,
  AIProviderInfo,
  Message,
  ChatOptions,
  AnalysisTask,
  AnalysisResult,
  AIConfig,
} from './providers/types';

import { OllamaProvider } from './providers/ollama';
import { WebLLMProvider } from './providers/webllm';
import { TransformersProvider } from './providers/transformers';

export class AIOrchestrator {
  private providers: Map<string, AIProvider> = new Map();
  private config: AIConfig;
  private activeProvider: AIProvider | null = null;
  private backgroundInitStarted = false;

  constructor(config: AIConfig = {}) {
    this.config = {
      preferredProvider: 'auto',
      ollamaUrl: 'http://localhost:11434',
      selectedModel: 'llama3.2',
      enableRealtime: true,
      enablePrivacyMode: true,
      grammarStrictness: 'normal',
      citationStyle: 'APA',
      ...config,
    };

    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize all providers
    this.providers.set(
      'ollama',
      new OllamaProvider(this.config.ollamaUrl, this.config.selectedModel)
    );
    this.providers.set('webllm', new WebLLMProvider());
    this.providers.set('transformers', new TransformersProvider());
  }

  /**
   * Start background initialization of AI providers
   * This should be called early (e.g., on app startup) to pre-load models
   */
  startBackgroundInitialization(): void {
    if (this.backgroundInitStarted) {
      return;
    }

    this.backgroundInitStarted = true;

    // Try to initialize providers in background
    this.getBestProvider().catch(error => {
      console.warn('Background initialization failed:', error);
    });
  }

  /**
   * Get the best available provider based on configuration and availability
   */
  async getBestProvider(): Promise<AIProvider | null> {
    if (this.activeProvider) {
      return this.activeProvider;
    }

    // If a specific provider is preferred and available, use it
    if (this.config.preferredProvider && this.config.preferredProvider !== 'auto') {
      const preferred = this.providers.get(this.config.preferredProvider);
      if (preferred && (await preferred.isAvailable())) {
        await preferred.initialize(this.config as Record<string, unknown>);
        this.activeProvider = preferred;
        return preferred;
      }
    }

    // Auto mode: try providers in order of preference
    const providerOrder = ['ollama', 'webllm', 'transformers'];
    
    for (const providerName of providerOrder) {
      const provider = this.providers.get(providerName);
      if (provider && (await provider.isAvailable())) {
        await provider.initialize(this.config as Record<string, unknown>);
        this.activeProvider = provider;
        return provider;
      }
    }

    return null;
  }

  /**
   * Get information about all providers
   */
  async getAllProviderInfo(): Promise<AIProviderInfo[]> {
    const infos: AIProviderInfo[] = [];
    
    for (const provider of this.providers.values()) {
      const info = await provider.getInfo();
      infos.push(info);
    }
    
    return infos;
  }

  /**
   * Send a chat message using the best available provider
   */
  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const provider = await this.getBestProvider();
    
    if (!provider) {
      throw new Error('No AI provider available');
    }

    return provider.chat(messages, options);
  }

  /**
   * Stream chat responses using the best available provider
   */
  async stream(
    messages: Message[],
    onChunk: (chunk: string) => void,
    options?: ChatOptions
  ): Promise<void> {
    const provider = await this.getBestProvider();
    
    if (!provider) {
      throw new Error('No AI provider available');
    }

    return provider.stream(messages, onChunk, options);
  }

  /**
   * Analyze document using the best available provider
   */
  async analyzeDocument(
    content: string,
    task: AnalysisTask
  ): Promise<AnalysisResult> {
    const provider = await this.getBestProvider();
    
    if (!provider) {
      throw new Error('No AI provider available');
    }

    return provider.analyzeDocument(content, task);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.activeProvider = null; // Force re-selection on next use
  }

  /**
   * Get current configuration
   */
  getConfig(): AIConfig {
    return { ...this.config };
  }

  /**
   * Dispose all providers
   */
  async dispose(): Promise<void> {
    for (const provider of this.providers.values()) {
      await provider.dispose();
    }
    this.activeProvider = null;
  }
}

// Singleton instance
let orchestratorInstance: AIOrchestrator | null = null;

/**
 * Get the global AI orchestrator instance
 */
export function getAIOrchestrator(config?: AIConfig): AIOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AIOrchestrator(config);
  }
  return orchestratorInstance;
}

/**
 * Reset the AI orchestrator (useful for testing)
 */
export function resetAIOrchestrator(): void {
  if (orchestratorInstance) {
    orchestratorInstance.dispose();
  }
  orchestratorInstance = null;
}

// Re-export types for convenience
export * from './providers/types';
