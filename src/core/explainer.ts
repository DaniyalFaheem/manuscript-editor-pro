/**
 * Explainer
 * 
 * Generates human-readable explanations for suggestions
 */

import type { Suggestion } from './types';

/**
 * Generates explanations for suggestions
 */
export class Explainer {
  /**
   * Enhance a suggestion with detailed explanation
   */
  public enhance(suggestion: Suggestion): Suggestion {
    return {
      ...suggestion,
      explanation: this.generateExplanation(suggestion),
    };
  }

  /**
   * Generate detailed explanation
   */
  private generateExplanation(suggestion: Suggestion): string {
    const base = suggestion.explanation || '';
    const context = this.addContext(suggestion);
    const reasoning = this.addReasoning(suggestion);
    
    let full = base;
    
    if (context) {
      full += '\n\n' + context;
    }
    
    if (reasoning) {
      full += '\n\n' + reasoning;
    }

    return full.trim();
  }

  /**
   * Add contextual information
   */
  private addContext(suggestion: Suggestion): string {
    if (!suggestion.context) return '';

    const { before, after } = suggestion.context;
    
    if (before || after) {
      return `Context: "${before || ''}[${suggestion.original}]${after || ''}"`;
    }

    return '';
  }

  /**
   * Add reasoning about why this matters
   */
  private addReasoning(suggestion: Suggestion): string {
    switch (suggestion.category) {
      case 'grammar':
        return 'Why this matters: Grammatical errors can confuse readers and reduce the credibility of your writing.';
      
      case 'spelling':
        return 'Why this matters: Spelling errors distract readers and may cause misunderstandings.';
      
      case 'punctuation':
        return 'Why this matters: Proper punctuation ensures clarity and helps readers understand your intended meaning.';
      
      case 'style':
        return 'Why this matters: Clear, concise writing is easier to read and understand.';
      
      case 'clarity':
        return 'Why this matters: Clear communication helps your readers grasp your ideas quickly.';
      
      case 'tone':
        return 'Why this matters: Appropriate tone helps you connect with your intended audience.';
      
      case 'consistency':
        return 'Why this matters: Consistency makes your writing appear more professional and polished.';
      
      case 'academic':
        return 'Why this matters: Academic writing has specific conventions that demonstrate expertise.';
      
      default:
        return '';
    }
  }

  /**
   * Generate comparison explanation
   */
  public generateComparison(original: string, replacement: string | string[]): string {
    if (Array.isArray(replacement)) {
      return `Original: "${original}"\n\nSuggested alternatives:\n${replacement.map((r, i) => `${i + 1}. "${r}"`).join('\n')}`;
    }

    return `Original: "${original}"\nSuggested: "${replacement}"`;
  }

  /**
   * Generate example-based explanation
   */
  public generateExampleExplanation(
    examples: Array<{ incorrect: string; correct: string; explanation?: string }>
  ): string {
    return examples
      .map((ex, i) => {
        let text = `Example ${i + 1}:\n❌ ${ex.incorrect}\n✅ ${ex.correct}`;
        if (ex.explanation) {
          text += `\n  ${ex.explanation}`;
        }
        return text;
      })
      .join('\n\n');
  }

  /**
   * Format suggestion for display
   */
  public formatForDisplay(suggestion: Suggestion): {
    title: string;
    message: string;
    explanation: string;
    examples: string;
    action: string;
  } {
    const replacementText = Array.isArray(suggestion.replacement)
      ? suggestion.replacement[0]
      : suggestion.replacement;

    return {
      title: `${suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)} Issue`,
      message: suggestion.message,
      explanation: suggestion.explanation,
      examples: suggestion.examples
        ? this.generateExampleExplanation(suggestion.examples)
        : '',
      action: `Change "${suggestion.original}" to "${replacementText}"`,
    };
  }

  /**
   * Generate confidence explanation
   */
  public explainConfidence(confidence: number): string {
    if (confidence >= 0.95) {
      return 'Very high confidence - this is almost certainly an error.';
    } else if (confidence >= 0.85) {
      return 'High confidence - this is likely an error.';
    } else if (confidence >= 0.70) {
      return 'Moderate confidence - this may be an error depending on context.';
    } else if (confidence >= 0.50) {
      return 'Low confidence - this might be worth reviewing.';
    } else {
      return 'Very low confidence - this is a weak suggestion.';
    }
  }

  /**
   * Generate summary of multiple suggestions
   */
  public summarizeSuggestions(suggestions: Suggestion[]): string {
    if (suggestions.length === 0) {
      return 'No issues found. Great job!';
    }

    const byCategory: Record<string, number> = {};
    
    for (const suggestion of suggestions) {
      byCategory[suggestion.category] = (byCategory[suggestion.category] || 0) + 1;
    }

    const parts = Object.entries(byCategory).map(
      ([category, count]) => `${count} ${category} ${count === 1 ? 'issue' : 'issues'}`
    );

    return `Found ${suggestions.length} ${suggestions.length === 1 ? 'issue' : 'issues'}: ${parts.join(', ')}.`;
  }

  /**
   * Generate markdown explanation
   */
  public toMarkdown(suggestion: Suggestion): string {
    const formatted = this.formatForDisplay(suggestion);
    
    let md = `## ${formatted.title}\n\n`;
    md += `**${formatted.message}**\n\n`;
    md += `${formatted.explanation}\n\n`;
    
    if (formatted.examples) {
      md += `### Examples\n\n${formatted.examples}\n\n`;
    }
    
    md += `### Suggestion\n\n${formatted.action}\n\n`;
    md += `**Confidence:** ${Math.round(suggestion.confidence * 100)}% - ${this.explainConfidence(suggestion.confidence)}\n`;
    
    if (suggestion.learnMoreUrl) {
      md += `\n[Learn more](${suggestion.learnMoreUrl})`;
    }

    return md;
  }

  /**
   * Generate plain text explanation
   */
  public toPlainText(suggestion: Suggestion): string {
    const formatted = this.formatForDisplay(suggestion);
    
    let text = `${formatted.title}\n`;
    text += `${'='.repeat(formatted.title.length)}\n\n`;
    text += `${formatted.message}\n\n`;
    text += `${formatted.explanation}\n\n`;
    
    if (formatted.examples) {
      text += `Examples:\n${formatted.examples}\n\n`;
    }
    
    text += `Suggestion: ${formatted.action}\n\n`;
    text += `Confidence: ${Math.round(suggestion.confidence * 100)}%\n`;

    return text;
  }
}

/**
 * Singleton instance
 */
export const explainer = new Explainer();
