/**
 * Ollama AI Provider
 * Integrates with local Ollama installation for completely free AI
 */

import type {
  AIProvider,
  AIProviderInfo,
  Message,
  ChatOptions,
  AnalysisTask,
  AnalysisResult,
} from './types';
import { AIProviderStatus } from './types';

export class OllamaProvider implements AIProvider {
  readonly name = 'ollama';
  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl = 'http://localhost:11434', defaultModel = 'llama3.2') {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000), // 2 second timeout
      });
      return response.ok;
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

    try {
      await fetch(`${this.baseUrl}/api/tags`);

      return {
        name: this.name,
        status: AIProviderStatus.AVAILABLE,
        model: this.defaultModel,
        capabilities: [
          'chat',
          'stream',
          'grammar-check',
          'style-analysis',
          'document-analysis',
        ],
      };
    } catch {
      return {
        name: this.name,
        status: AIProviderStatus.ERROR,
        capabilities: [],
      };
    }
  }

  async initialize(config?: Record<string, unknown>): Promise<void> {
    if (config?.baseUrl) {
      this.baseUrl = config.baseUrl as string;
    }
    if (config?.model) {
      this.defaultModel = config.model as string;
    }
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const model = options?.model || this.defaultModel;
    
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: {
            temperature: options?.temperature || 0.7,
            num_predict: options?.maxTokens || 2000,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.message?.content || '';
    } catch (error) {
      console.error('Ollama chat error:', error);
      throw error;
    }
  }

  async stream(
    messages: Message[],
    onChunk: (chunk: string) => void,
    options?: ChatOptions
  ): Promise<void> {
    const model = options?.model || this.defaultModel;

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          options: {
            temperature: options?.temperature || 0.7,
            num_predict: options?.maxTokens || 2000,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.message?.content) {
                onChunk(data.message.content);
              }
            } catch (e) {
              console.warn('Failed to parse streaming response:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Ollama stream error:', error);
      throw error;
    }
  }

  async analyzeDocument(
    content: string,
    task: AnalysisTask
  ): Promise<AnalysisResult> {
    const systemPrompt = this.getAnalysisPrompt(task.type);
    
    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this text:\n\n${content}` },
    ];

    const response = await this.chat(messages, { temperature: 0.3 });
    
    // Parse the AI response into structured suggestions
    return this.parseAnalysisResponse(response, task.type);
  }

  private getAnalysisPrompt(type: string): string {
    const prompts: Record<string, string> = {
      grammar: `You are a professional grammar checker. Analyze the text for grammar errors, spelling mistakes, and punctuation issues. Return a JSON array of issues with: type, message, context, offset, length, and suggested replacements.`,
      style: `You are a writing style expert. Analyze the text for style issues including passive voice, wordiness, unclear sentences, and tone inconsistencies. Return a JSON array of suggestions.`,
      citations: `You are an academic citation expert. Check for citation format issues, missing citations, and reference consistency. Support APA, MLA, Chicago, IEEE, and Harvard styles.`,
      plagiarism: `You are a plagiarism detection expert. Identify potentially plagiarized content, missing attributions, and paraphrasing issues.`,
      metrics: `You are a document quality assessor. Provide an overall quality score, grammar accuracy, style consistency, and readability metrics.`,
      full: `You are a comprehensive document editor. Perform a complete analysis covering grammar, style, citations, and overall quality. Provide detailed feedback and metrics.`,
    };

    return prompts[type] || prompts.full;
  }

  private parseAnalysisResponse(
    response: string,
    type: string
  ): AnalysisResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return {
          type,
          suggestions: suggestions.map((s: { type?: string; severity?: string; message?: string; context?: string; offset?: number; length?: number; replacements?: string[] }, idx: number) => ({
            id: `ollama-${type}-${idx}`,
            type: s.type || type,
            severity: s.severity || 'warning',
            message: s.message || '',
            context: s.context || '',
            offset: s.offset || 0,
            length: s.length || 0,
            replacements: s.replacements || [],
          })),
        };
      }
    } catch (error) {
      console.warn('Failed to parse analysis response:', error);
    }

    // Fallback: return empty result
    return {
      type,
      suggestions: [],
    };
  }

  async dispose(): Promise<void> {
    // Cleanup if needed
  }
}
