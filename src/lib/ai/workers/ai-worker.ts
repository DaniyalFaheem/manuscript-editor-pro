/**
 * AI Worker
 * Handles AI model loading and inference in a separate thread
 * to prevent blocking the main UI thread
 */

import { CreateMLCEngine, type MLCEngineInterface } from '@mlc-ai/web-llm';

interface WorkerMessage {
  id: string;
  type: 'initialize' | 'chat' | 'stream' | 'dispose';
  data?: unknown;
}

interface WorkerResponse {
  id: string;
  type: 'success' | 'error' | 'progress' | 'chunk';
  data?: unknown;
}

let engine: MLCEngineInterface | null = null;
let isInitializing = false;
let isInitialized = false;

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { id, type, data } = e.data;

  try {
    switch (type) {
      case 'initialize':
        await handleInitialize(id, data as { model: string });
        break;
      case 'chat':
        await handleChat(id, data as { messages: unknown[] });
        break;
      case 'stream':
        await handleStream(id, data as { messages: unknown[] });
        break;
      case 'dispose':
        await handleDispose(id);
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    postMessage({
      id,
      type: 'error',
      data: { message: error instanceof Error ? error.message : 'Unknown error' },
    } as WorkerResponse);
  }
};

async function handleInitialize(id: string, data: { model: string }) {
  if (isInitialized || isInitializing) {
    if (isInitializing) {
      while (isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    postMessage({
      id,
      type: 'success',
      data: { initialized: true },
    } as WorkerResponse);
    return;
  }

  isInitializing = true;

  try {
    const model = data.model || 'Llama-3.1-8B-Instruct-q4f32_1-MLC';
    
    // Send progress updates
    postMessage({
      id,
      type: 'progress',
      data: { progress: 0, message: 'Starting model initialization...' },
    } as WorkerResponse);

    engine = await CreateMLCEngine(model, {
      initProgressCallback: (progress) => {
        postMessage({
          id,
          type: 'progress',
          data: { 
            progress: progress.progress,
            message: `Loading model: ${Math.round(progress.progress * 100)}%`
          },
        } as WorkerResponse);
      },
    });

    isInitialized = true;
    
    postMessage({
      id,
      type: 'success',
      data: { initialized: true },
    } as WorkerResponse);
  } catch (error) {
    throw new Error(`Failed to initialize AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    isInitializing = false;
  }
}

async function handleChat(id: string, data: { messages: unknown[] }) {
  if (!isInitialized || !engine) {
    throw new Error('AI not initialized');
  }

  try {
    const response = await engine.chat.completions.create({
      messages: data.messages as never,
    });

    postMessage({
      id,
      type: 'success',
      data: { content: response.choices[0]?.message?.content || '' },
    } as WorkerResponse);
  } catch (error) {
    throw new Error(`Chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleStream(id: string, data: { messages: unknown[] }) {
  if (!isInitialized || !engine) {
    throw new Error('AI not initialized');
  }

  try {
    const stream = await engine.chat.completions.create({
      messages: data.messages as never,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        postMessage({
          id,
          type: 'chunk',
          data: { content },
        } as WorkerResponse);
      }
    }

    postMessage({
      id,
      type: 'success',
      data: { completed: true },
    } as WorkerResponse);
  } catch (error) {
    throw new Error(`Stream failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleDispose(id: string) {
  if (engine) {
    engine = null;
  }
  isInitialized = false;
  isInitializing = false;

  postMessage({
    id,
    type: 'success',
    data: { disposed: true },
  } as WorkerResponse);
}
