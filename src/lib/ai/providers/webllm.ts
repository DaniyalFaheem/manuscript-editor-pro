/**
 * WebLLM AI Provider
 * Browser-based AI using WebGPU - completely free and private
 * Note: This is a placeholder implementation. Actual WebLLM integration
 * would require installing @mlc-ai/web-llm package
 */

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
  private isInitialized = false;
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
      status: this.isInitialized
        ? AIProviderStatus.AVAILABLE
        : AIProviderStatus.LOADING,
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
    if (this.isInitialized) return;

    // WebLLM initialization would happen here
    // For now, this is a placeholder that indicates the feature is available
    // but requires the actual WebLLM package to be installed
    
    console.info('WebLLM provider initialized (placeholder mode)');
    console.info('To enable WebLLM, install: npm install @mlc-ai/web-llm');
    
    this.isInitialized = true;
  }

  async chat(messages: Message[]): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Placeholder implementation
    return this.generatePlaceholderResponse(messages);
  }

  async stream(
    messages: Message[],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Placeholder implementation - simulate streaming
    const response = await this.chat(messages);
    const words = response.split(' ');
    
    for (const word of words) {
      onChunk(word + ' ');
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  async analyzeDocument(
    _content: string,
    task: AnalysisTask
  ): Promise<AnalysisResult> {
    // Placeholder analysis
    return {
      type: task.type,
      suggestions: [],
    };
  }

  private generatePlaceholderResponse(messages: Message[]): string {
    const lastMessage = messages[messages.length - 1];
    // Sanitize content to prevent any potential issues
    const sanitizedContent = lastMessage.content.replace(/[<>]/g, '');
    
    return `WebLLM is currently in placeholder mode. To enable full functionality, install the @mlc-ai/web-llm package. Your message was: "${sanitizedContent.substring(0, 100)}"`;
  }

  async dispose(): Promise<void> {
    this.isInitialized = false;
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
