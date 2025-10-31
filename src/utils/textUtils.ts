/**
 * Split text into sentences
 */
export function splitIntoSentences(text: string): string[] {
  if (!text) return [];
  
  // Split on sentence-ending punctuation followed by space or end of string
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Split text into words
 */
export function splitIntoWords(text: string): string[] {
  if (!text) return [];
  
  // Match word characters including hyphens
  const words = text.match(/\b[\w'-]+\b/g) || [];
  return words.filter(w => w.length > 0);
}

/**
 * Split text into paragraphs
 */
export function splitIntoParagraphs(text: string): string[] {
  if (!text) return [];
  
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs.map(p => p.trim()).filter(p => p.length > 0);
}

/**
 * Get line and column from offset
 */
export function getPositionFromOffset(text: string, offset: number): { line: number; column: number } {
  const lines = text.substring(0, offset).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
