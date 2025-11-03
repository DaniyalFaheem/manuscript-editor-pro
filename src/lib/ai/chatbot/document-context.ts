/**
 * Document Context
 * Provides AI with awareness of the current document
 */

export interface DocumentContext {
  content: string;
  selection?: {
    start: number;
    end: number;
    text: string;
  };
  metadata: {
    wordCount: number;
    characterCount: number;
    paragraphCount: number;
    sentenceCount: number;
  };
}

export class DocumentContextProvider {
  /**
   * Extract context from document content
   */
  static getContext(
    content: string,
    selection?: { start: number; end: number }
  ): DocumentContext {
    const metadata = this.calculateMetadata(content);
    
    let selectionInfo = undefined;
    if (selection && selection.start !== selection.end) {
      selectionInfo = {
        start: selection.start,
        end: selection.end,
        text: content.substring(selection.start, selection.end),
      };
    }

    return {
      content,
      selection: selectionInfo,
      metadata,
    };
  }

  /**
   * Get a summary of the document for AI context
   */
  static getSummary(context: DocumentContext, maxLength = 500): string {
    const { content, selection, metadata } = context;
    
    let summary = '';
    
    if (selection) {
      summary = `Selected text (${selection.text.length} chars): "${selection.text.substring(0, 200)}..."`;
    } else {
      const preview = content.substring(0, maxLength);
      summary = `Document (${metadata.wordCount} words, ${metadata.characterCount} chars): "${preview}${content.length > maxLength ? '...' : ''}"`;
    }
    
    return summary;
  }

  /**
   * Get context-aware prompt for AI
   */
  static getContextPrompt(context: DocumentContext, userIntent: string): string {
    const summary = this.getSummary(context);
    
    let prompt = `Document context: ${summary}\n\n`;
    
    if (context.selection) {
      prompt += `User is working on selected text. `;
    } else {
      prompt += `User is working on the full document. `;
    }
    
    prompt += `User request: ${userIntent}`;
    
    return prompt;
  }

  private static calculateMetadata(content: string) {
    const words = content.trim().split(/\s+/).filter(w => w.length > 0);
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return {
      wordCount: words.length,
      characterCount: content.length,
      paragraphCount: paragraphs.length,
      sentenceCount: sentences.length,
    };
  }
}
