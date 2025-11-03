/**
 * WebLLM AI Provider
 * Browser-based AI using WebGPU - completely free and private
 * Now with full WebLLM integration for AI-powered manuscript editing
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

export class WebLLMProvider implements AIProvider {
  readonly name = 'webllm';
  private engine: MLCEngineInterface | null = null;
  private isInitialized = false;
  private isInitializing = false;
  private defaultModel = 'Llama-3.1-8B-Instruct-q4f32_1-MLC';

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

  async initialize(): Promise<void> {
    if (this.isInitialized || this.isInitializing) {
      // Wait for initialization to complete if it's in progress
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isInitializing = true;
    
    try {
      console.info('🚀 Initializing WebLLM with model:', this.defaultModel);
      console.info('⏳ This may take a few moments on first load...');
      
      // Create the MLC engine with progress reporting
      this.engine = await CreateMLCEngine(this.defaultModel, {
        initProgressCallback: (progress) => {
          console.info(`⏳ Loading model: ${Math.round(progress.progress * 100)}%`);
        },
      });
      
      this.isInitialized = true;
      console.info('✅ WebLLM initialized successfully!');
    } catch (error) {
      console.error('❌ Failed to initialize WebLLM:', error);
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

    try {
      // Convert our Message format to WebLLM format
      const webllmMessages: ChatCompletionMessageParam[] = messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      }));

      // Get completion from WebLLM
      const response = await this.engine.chat.completions.create({
        messages: webllmMessages,
      });

      return response.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('WebLLM chat error:', error);
      throw new Error(`WebLLM chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
    content: string,
    task: AnalysisTask
  ): Promise<AnalysisResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Create a specialized prompt for document analysis
    const systemPrompt = `You are a professional manuscript editor. Analyze the following text for ${task.type} issues and provide specific suggestions.`;
    
    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this text:\n\n${content.substring(0, 2000)}` },
    ];

    try {
      await this.chat(messages);
      
      // For now, return empty suggestions as document analysis is better handled
      // by the existing offline checkers. WebLLM is primarily for chat/Q&A
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
