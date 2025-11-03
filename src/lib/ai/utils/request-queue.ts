/**
 * Request Queue
 * Manages AI requests with queuing, debouncing, and caching
 */

export interface QueuedRequest<T> {
  id: string;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  priority: number;
  timestamp: number;
}

export class RequestQueue {
  private queue: QueuedRequest<unknown>[] = [];
  private processing = false;
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private maxConcurrent = 1;
  private currentConcurrent = 0;
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  /**
   * Add a request to the queue with optional debouncing
   */
  async enqueue<T>(
    key: string,
    execute: () => Promise<T>,
    options: {
      priority?: number;
      debounceMs?: number;
      useCache?: boolean;
    } = {}
  ): Promise<T> {
    const {
      priority = 0,
      debounceMs = 0,
      useCache = true,
    } = options;

    // Check cache first
    if (useCache) {
      const cached = this.getFromCache<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    // Handle debouncing
    if (debounceMs > 0) {
      return new Promise((resolve, reject) => {
        // Clear existing timer
        const existingTimer = this.debounceTimers.get(key);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        // Set new timer
        const timer = setTimeout(() => {
          this.debounceTimers.delete(key);
          this.addToQueue(key, execute, priority, useCache).then(resolve).catch(reject);
        }, debounceMs);

        this.debounceTimers.set(key, timer);
      });
    }

    return this.addToQueue(key, execute, priority, useCache);
  }

  private async addToQueue<T>(
    key: string,
    execute: () => Promise<T>,
    priority: number,
    useCache: boolean
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id: key,
        execute: async () => {
          const result = await execute();
          if (useCache) {
            this.addToCache(key, result);
          }
          return result;
        },
        resolve: resolve as (value: unknown) => void,
        reject,
        priority,
        timestamp: Date.now(),
      };

      // Insert based on priority (higher priority first)
      const insertIndex = this.queue.findIndex(r => r.priority < priority);
      if (insertIndex === -1) {
        this.queue.push(request as QueuedRequest<unknown>);
      } else {
        this.queue.splice(insertIndex, 0, request as QueuedRequest<unknown>);
      }

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.currentConcurrent >= this.maxConcurrent) {
      return;
    }

    const request = this.queue.shift();
    if (!request) {
      return;
    }

    this.processing = true;
    this.currentConcurrent++;

    try {
      const result = await request.execute();
      request.resolve(result);
    } catch (error) {
      request.reject(error as Error);
    } finally {
      this.currentConcurrent--;
      this.processing = false;
      
      // Process next request
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private addToCache(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear specific cache entry
   */
  clearCacheEntry(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Cancel pending requests matching a key pattern
   */
  cancelPending(keyPattern: string): void {
    this.queue = this.queue.filter(request => {
      const shouldCancel = request.id.includes(keyPattern);
      if (shouldCancel) {
        request.reject(new Error('Request cancelled'));
      }
      return !shouldCancel;
    });
  }

  /**
   * Get queue status
   */
  getStatus(): {
    queueLength: number;
    cacheSize: number;
    processing: boolean;
  } {
    return {
      queueLength: this.queue.length,
      cacheSize: this.cache.size,
      processing: this.processing,
    };
  }
}

// Singleton instance
export const requestQueue = new RequestQueue();
