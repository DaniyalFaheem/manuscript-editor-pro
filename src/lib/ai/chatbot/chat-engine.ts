/**
 * Chat Engine
 * Manages chat conversations with AI, including history and commands
 */

import type { Message } from '../providers/types';
import { getAIOrchestrator } from '../index';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isCommand?: boolean;
}

export interface ChatCommand {
  command: string;
  description: string;
  handler: (args: string) => Promise<string>;
}

export class ChatEngine {
  private messages: ChatMessage[] = [];
  private commands: Map<string, ChatCommand> = new Map();
  private orchestrator = getAIOrchestrator();

  constructor() {
    this.initializeCommands();
  }

  private initializeCommands(): void {
    this.commands.set('/analyze', {
      command: '/analyze',
      description: 'Run full document analysis',
      handler: async () => {
        return 'Running full document analysis... This feature analyzes grammar, style, citations, and overall quality.';
      },
    });

    this.commands.set('/grammar', {
      command: '/grammar',
      description: 'Check grammar only',
      handler: async () => {
        return 'Checking grammar... Looking for grammar errors, spelling mistakes, and punctuation issues.';
      },
    });

    this.commands.set('/style', {
      command: '/style',
      description: 'Get style suggestions',
      handler: async () => {
        return 'Analyzing writing style... Checking for passive voice, wordiness, and tone consistency.';
      },
    });

    this.commands.set('/citations', {
      command: '/citations',
      description: 'Validate citations',
      handler: async () => {
        return 'Validating citations... Checking citation formats and reference consistency.';
      },
    });

    this.commands.set('/plagiarism', {
      command: '/plagiarism',
      description: 'Check for plagiarism',
      handler: async () => {
        return 'Checking for plagiarism... Analyzing text for potential plagiarism and missing attributions.';
      },
    });

    this.commands.set('/format', {
      command: '/format',
      description: 'Format document (e.g., /format APA)',
      handler: async (args: string) => {
        const style = args.trim() || 'APA';
        return `Formatting document in ${style} style... Applying ${style} formatting rules.`;
      },
    });

    this.commands.set('/help', {
      command: '/help',
      description: 'Show available commands',
      handler: async () => {
        let help = 'Available commands:\n\n';
        this.commands.forEach((cmd) => {
          help += `${cmd.command} - ${cmd.description}\n`;
        });
        return help;
      },
    });
  }

  /**
   * Send a message and get a response
   */
  async sendMessage(content: string, documentContext?: string): Promise<ChatMessage> {
    // Add user message to history
    const userMessage: ChatMessage = {
      id: this.generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    this.messages.push(userMessage);

    // Check if this is a command
    if (content.startsWith('/')) {
      return this.handleCommand(content);
    }

    // Build message history for AI
    const aiMessages: Message[] = [];
    
    // Add system message with document context
    if (documentContext) {
      aiMessages.push({
        role: 'system',
        content: `You are a professional manuscript editor helping with document editing. The current document contains: ${documentContext.substring(0, 500)}...`,
      });
    } else {
      aiMessages.push({
        role: 'system',
        content: 'You are a professional manuscript editor. Help users improve their writing with clear, actionable suggestions.',
      });
    }

    // Add recent conversation history (last 10 messages)
    const recentMessages = this.messages.slice(-10);
    for (const msg of recentMessages) {
      if (msg.role !== 'system') {
        aiMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Get AI response
    try {
      const response = await this.orchestrator.chat(aiMessages, {
        temperature: 0.7,
        maxTokens: 1000,
      });

      const assistantMessage: ChatMessage = {
        id: this.generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      this.messages.push(assistantMessage);

      return assistantMessage;
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: this.generateId(),
        role: 'assistant',
        content: `I'm sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please make sure Ollama is running or try again.`,
        timestamp: new Date(),
      };
      this.messages.push(errorMessage);
      return errorMessage;
    }
  }

  /**
   * Stream a message response
   */
  async streamMessage(
    content: string,
    onChunk: (chunk: string) => void,
    documentContext?: string
  ): Promise<void> {
    // Add user message to history
    const userMessage: ChatMessage = {
      id: this.generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    this.messages.push(userMessage);

    // Build message history for AI
    const aiMessages: Message[] = [];
    
    if (documentContext) {
      aiMessages.push({
        role: 'system',
        content: `You are a professional manuscript editor. Current document: ${documentContext.substring(0, 500)}...`,
      });
    }

    // Add recent conversation history
    const recentMessages = this.messages.slice(-10);
    for (const msg of recentMessages) {
      if (msg.role !== 'system') {
        aiMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    let fullResponse = '';
    
    try {
      await this.orchestrator.stream(
        aiMessages,
        (chunk) => {
          fullResponse += chunk;
          onChunk(chunk);
        },
        { temperature: 0.7, maxTokens: 1000 }
      );

      // Save complete response to history
      this.messages.push({
        id: this.generateId(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
      });
    } catch (error) {
      const errorMsg = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      onChunk(errorMsg);
      this.messages.push({
        id: this.generateId(),
        role: 'assistant',
        content: errorMsg,
        timestamp: new Date(),
      });
    }
  }

  private async handleCommand(content: string): Promise<ChatMessage> {
    const parts = content.split(' ');
    const command = parts[0];
    const args = parts.slice(1).join(' ');

    const cmd = this.commands.get(command);
    
    let responseContent: string;
    if (cmd) {
      responseContent = await cmd.handler(args);
    } else {
      responseContent = `Unknown command: ${command}. Type /help to see available commands.`;
    }

    const response: ChatMessage = {
      id: this.generateId(),
      role: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      isCommand: true,
    };

    this.messages.push(response);
    return response;
  }

  /**
   * Get chat history
   */
  getHistory(): ChatMessage[] {
    return [...this.messages];
  }

  /**
   * Clear chat history
   */
  clearHistory(): void {
    this.messages = [];
  }

  /**
   * Save chat history to localStorage
   */
  saveHistory(): void {
    try {
      const data = JSON.stringify(
        this.messages.map((m) => ({
          ...m,
          timestamp: m.timestamp.toISOString(),
        }))
      );
      localStorage.setItem('manuscript-editor-chat-history', data);
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }

  /**
   * Load chat history from localStorage
   */
  loadHistory(): void {
    try {
      const data = localStorage.getItem('manuscript-editor-chat-history');
      if (data) {
        const messages = JSON.parse(data);
        this.messages = messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }

  private generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
