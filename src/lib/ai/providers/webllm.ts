/**
 * WebLLM AI Provider
 * Browser-based AI using WebGPU - completely free and private
 * Now with optimized initialization, caching, and background loading
 */

import { CreateMLCEngine, type MLCEngineInterface, type ChatCompletionMessageParam } from '@mlc-ai/web-llm';
import type {
  AIProvider,
  AIProviderInfo,
  Message,
  AnalysisTask,
  AnalysisResult,
} from './types';
import { AIProviderStatus } from './types';
import { requestQueue } from '../utils/request-queue';

export interface InitializationProgress {
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
}

export class WebLLMProvider implements AIProvider {
  readonly name = 'webllm';
  private engine: MLCEngineInterface | null = null;
  private isInitialized = false;
  private isInitializing = false;
  private defaultModel = 'Llama-3.1-8B-Instruct-q4f32_1-MLC';
  private initializationCallbacks: ((progress: InitializationProgress) => void)[] = [];
  private initializationStartTime = 0;
  private backgroundInitStarted = false;

  async isAvailable(): Promise<boolean> {
    // Check for WebGPU support
    const nav = navigator as { gpu?: { requestAdapter: () => Promise<unknown | null> } };
    if (!nav.gpu) {
      return false;
    }

    try {
      const adapter = await nav.gpu.requestAdapter();
      return adapter !== null;
    } catch {
      return false;
    }
  }

  async getInfo(): Promise<AIProviderInfo> {
    const available = await this.isAvailable();

    if (!available) {
      return {
        name: this.name,
        status: AIProviderStatus.UNAVAILABLE,
        capabilities: [],
      };
    }

    return {
      name: this.name,
      status: this.isInitializing
        ? AIProviderStatus.LOADING
        : this.isInitialized
        ? AIProviderStatus.AVAILABLE
        : AIProviderStatus.UNAVAILABLE,
      model: this.defaultModel,
      capabilities: [
        'chat',
        'stream',
        'browser-based',
        'no-installation',
        '100%-private',
      ],
    };
  }

  /**
   * Start background initialization (non-blocking)
   * This can be called early to pre-load the model
   */
  startBackgroundInitialization(): void {
    if (this.backgroundInitStarted || this.isInitialized || this.isInitializing) {
      return;
    }

    this.backgroundInitStarted = true;
    
    // Start initialization in background without blocking
    this.initialize().catch(error => {
      console.warn('Background initialization failed:', error);
      this.backgroundInitStarted = false;
    });
  }

  /**
   * Subscribe to initialization progress updates
   */
  onInitializationProgress(callback: (progress: InitializationProgress) => void): () => void {
    this.initializationCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.initializationCallbacks.indexOf(callback);
      if (index > -1) {
        this.initializationCallbacks.splice(index, 1);
      }
    };
  }

  private notifyProgress(progress: InitializationProgress): void {
    this.initializationCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.error('Error in progress callback:', error);
      }
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.isInitializing) {
      // Wait for initialization to complete if it's in progress
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isInitializing = true;
    this.initializationStartTime = Date.now();
    
    try {
      console.info('🚀 Initializing WebLLM with model:', this.defaultModel);
      
      this.notifyProgress({
        progress: 0,
        message: 'Starting AI initialization...',
        estimatedTimeRemaining: 60,
      });

      // TODO: Implement model caching via IndexedDB for faster subsequent loads
      // Currently, caching infrastructure is in place but not yet active
      // const cachedEngine = await this.loadFromCache();
      // if (cachedEngine) { ... }

      // Create the MLC engine with progress reporting
      this.engine = await CreateMLCEngine(this.defaultModel, {
        initProgressCallback: (progress) => {
          const elapsed = (Date.now() - this.initializationStartTime) / 1000;
          const estimatedTotal = elapsed / progress.progress;
          const estimatedRemaining = Math.max(0, estimatedTotal - elapsed);
          
          this.notifyProgress({
            progress: progress.progress,
            message: `Loading model: ${Math.round(progress.progress * 100)}%`,
            estimatedTimeRemaining: Math.round(estimatedRemaining),
          });
          
          console.info(`⏳ Loading model: ${Math.round(progress.progress * 100)}% (${Math.round(estimatedRemaining)}s remaining)`);
        },
      });
      
      this.isInitialized = true;
      
      // TODO: Save engine state to cache for future use
      // await this.saveToCache();
      
      this.notifyProgress({
        progress: 1,
        message: 'AI ready!',
        estimatedTimeRemaining: 0,
      });
      
      const totalTime = ((Date.now() - this.initializationStartTime) / 1000).toFixed(1);
      console.info(`✅ WebLLM initialized successfully in ${totalTime}s!`);
    } catch (error) {
      console.error('❌ Failed to initialize WebLLM:', error);
      
      this.notifyProgress({
        progress: 0,
        message: 'Initialization failed',
        estimatedTimeRemaining: 0,
      });
      
      throw new Error(`Failed to initialize WebLLM: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.isInitializing = false;
    }
  }



  async chat(messages: Message[]): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.engine) {
      throw new Error('WebLLM engine not initialized');
    }

    // Use request queue with debouncing and caching
    const cacheKey = `chat-${JSON.stringify(messages)}`;
    
    return requestQueue.enqueue(
      cacheKey,
      async () => {
        try {
          // Convert our Message format to WebLLM format
          const webllmMessages: ChatCompletionMessageParam[] = messages.map(msg => ({
            role: msg.role as 'system' | 'user' | 'assistant',
            content: msg.content,
          }));

          // Get completion from WebLLM
          const response = await this.engine!.chat.completions.create({
            messages: webllmMessages,
          });

          return response.choices[0]?.message?.content || 'No response generated';
        } catch (error) {
          console.error('WebLLM chat error:', error);
          throw new Error(`WebLLM chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      },
      {
        debounceMs: 300,
        useCache: true,
        priority: 1,
      }
    );
  }

  async stream(
    messages: Message[],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.engine) {
      throw new Error('WebLLM engine not initialized');
    }

    try {
      // Convert our Message format to WebLLM format
      const webllmMessages: ChatCompletionMessageParam[] = messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      }));

      // Stream completion from WebLLM
      const stream = await this.engine.chat.completions.create({
        messages: webllmMessages,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          onChunk(content);
        }
      }
    } catch (error) {
      console.error('WebLLM stream error:', error);
      throw new Error(`WebLLM stream failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeDocument(
    _content: string,
    task: AnalysisTask
  ): Promise<AnalysisResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // For now, return empty suggestions as document analysis is better handled
    // by the existing offline checkers. WebLLM is primarily for interactive chat/Q&A
    // Document analysis through AI can be added later if needed
    try {
      return {
        type: task.type,
        suggestions: [],
      };
    } catch (error) {
      console.error('Document analysis error:', error);
      return {
        type: task.type,
        suggestions: [],
      };
    }
  }

  async dispose(): Promise<void> {
    if (this.engine) {
      // Clean up the engine
      this.engine = null;
    }
    this.isInitialized = false;
    this.isInitializing = false;
  }
}

/**
 * Check if WebGPU is supported in the current browser
 */
export async function checkWebGPUSupport(): Promise<{
  supported: boolean;
  message: string;
}> {
  const nav = navigator as { gpu?: { requestAdapter: () => Promise<unknown | null> } };
  if (!nav.gpu) {
    return {
      supported: false,
      message: 'WebGPU is not supported in this browser. Try Chrome 113+ or Edge 113+',
    };
  }

  try {
    const adapter = await nav.gpu.requestAdapter();
    if (!adapter) {
      return {
        supported: false,
        message: 'WebGPU adapter not available',
      };
    }

    return {
      supported: true,
      message: 'WebGPU is supported and ready',
    };
  } catch (error) {
    return {
      supported: false,
      message: `WebGPU check failed: ${error}`,
    };
  }
}
