/**
 * Change Applier
 * Applies AI-suggested changes to the document
 */

export interface Change {
  id: string;
  description: string;
  offset: number;
  length: number;
  replacement: string;
  category: 'grammar' | 'style' | 'spelling' | 'formatting';
}

export interface ChangeResult {
  success: boolean;
  newContent: string;
  appliedChanges: Change[];
  errors: string[];
}

export class ChangeApplier {
  /**
   * Apply a single change to the document
   */
  static applyChange(content: string, change: Change): string {
    const before = content.substring(0, change.offset);
    const after = content.substring(change.offset + change.length);
    return before + change.replacement + after;
  }

  /**
   * Apply multiple changes to the document
   * Changes are applied from end to start to maintain correct offsets
   */
  static applyChanges(content: string, changes: Change[]): ChangeResult {
    const result: ChangeResult = {
      success: true,
      newContent: content,
      appliedChanges: [],
      errors: [],
    };

    // Sort changes by offset (descending) to apply from end to start
    const sortedChanges = [...changes].sort((a, b) => b.offset - a.offset);

    for (const change of sortedChanges) {
      try {
        // Validate change bounds
        if (change.offset < 0 || change.offset + change.length > result.newContent.length) {
          result.errors.push(
            `Change ${change.id} is out of bounds (offset: ${change.offset}, length: ${change.length})`
          );
          continue;
        }

        result.newContent = this.applyChange(result.newContent, change);
        result.appliedChanges.push(change);
      } catch (error) {
        result.success = false;
        result.errors.push(
          `Failed to apply change ${change.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return result;
  }

  /**
   * Preview changes without applying them
   */
  static previewChanges(content: string, changes: Change[]): string[] {
    return changes.map((change) => {
      const before = content.substring(
        Math.max(0, change.offset - 20),
        change.offset
      );
      const original = content.substring(
        change.offset,
        change.offset + change.length
      );
      const after = content.substring(
        change.offset + change.length,
        Math.min(content.length, change.offset + change.length + 20)
      );

      return `...${before}[${original} → ${change.replacement}]${after}...`;
    });
  }

  /**
   * Parse AI response to extract changes
   */
  static parseAIChanges(aiResponse: string): Change[] {
    const changes: Change[] = [];
    
    // Try to parse JSON response
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed.map((item, idx) => ({
            id: `ai-change-${idx}`,
            description: item.description || item.message || '',
            offset: item.offset || 0,
            length: item.length || 0,
            replacement: item.replacement || item.replace || '',
            category: item.category || 'grammar',
          }));
        }
      }
    } catch (error) {
      console.warn('Failed to parse AI changes:', error);
    }

    return changes;
  }

  /**
   * Create undo history entry
   */
  static createUndoEntry(
    originalContent: string,
    changes: Change[]
  ): UndoEntry {
    return {
      id: `undo-${Date.now()}`,
      timestamp: new Date(),
      originalContent,
      changes,
    };
  }
}

export interface UndoEntry {
  id: string;
  timestamp: Date;
  originalContent: string;
  changes: Change[];
}

/**
 * Manages undo/redo history for document changes
 */
export class UndoManager {
  private undoStack: UndoEntry[] = [];
  private redoStack: UndoEntry[] = [];
  private maxStackSize = 50;

  /**
   * Add an entry to the undo stack
   */
  addUndoEntry(entry: UndoEntry): void {
    this.undoStack.push(entry);
    
    // Limit stack size
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }
    
    // Clear redo stack when new change is made
    this.redoStack = [];
  }

  /**
   * Undo the last change
   */
  undo(): UndoEntry | null {
    const entry = this.undoStack.pop();
    if (entry) {
      this.redoStack.push(entry);
    }
    return entry || null;
  }

  /**
   * Redo the last undone change
   */
  redo(): UndoEntry | null {
    const entry = this.redoStack.pop();
    if (entry) {
      this.undoStack.push(entry);
    }
    return entry || null;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
