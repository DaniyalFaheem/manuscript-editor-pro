/**
 * Scientific Notation Validator
 * Validates scientific notation, statistical symbols, and units
 */

export interface NotationError {
  id: string;
  type: NotationErrorType;
  message: string;
  original: string;
  suggestion: string;
  startOffset: number;
  endOffset: number;
  line: number;
}

export type NotationErrorType =
  | 'p-value'
  | 'sample-size'
  | 'confidence-interval'
  | 'effect-size'
  | 'statistical-symbol'
  | 'unit-spacing'
  | 'number-formatting';

/**
 * Validate scientific notation in text
 */
export function validateScientificNotation(content: string): NotationError[] {
  const errors: NotationError[] = [];
  let errorIdCounter = 0;

  // Validate p-values
  errors.push(...validatePValues(content, errorIdCounter));
  errorIdCounter += errors.length;

  // Validate sample size notation
  errors.push(...validateSampleSize(content, errorIdCounter));
  errorIdCounter += errors.length;

  // Validate confidence intervals
  errors.push(...validateConfidenceIntervals(content, errorIdCounter));
  errorIdCounter += errors.length;

  // Validate effect sizes
  errors.push(...validateEffectSizes(content, errorIdCounter));
  errorIdCounter += errors.length;

  // Validate unit spacing
  errors.push(...validateUnitSpacing(content, errorIdCounter));
  errorIdCounter += errors.length;

  // Validate number formatting
  errors.push(...validateNumberFormatting(content, errorIdCounter));

  return errors;
}

/**
 * Validate p-value format (p < 0.05, not p=.05 or p<.05)
 */
function validatePValues(content: string, startId: number): NotationError[] {
  const errors: NotationError[] = [];
  const lines = content.split('\n');
  let offset = 0;

  // Pattern for incorrect p-values
  const incorrectPatterns = [
    /p\s*=\s*\.(\d+)/gi,  // p=.05
    /p\s*<\s*\.(\d+)/gi,  // p<.05
    /p\s*=\s*(\d+\.\d+)/gi, // p=0.05 (should use < or >)
  ];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    for (const pattern of incorrectPatterns) {
      let match: RegExpExecArray | null;
      pattern.lastIndex = 0;

      while ((match = pattern.exec(line)) !== null) {
        const originalText = match[0];
        let suggestion = '';

        if (originalText.includes('=.')) {
          suggestion = originalText.replace('=.', '= 0.');
        } else if (originalText.includes('<.')) {
          suggestion = originalText.replace('<.', '< 0.');
        } else if (originalText.includes('=')) {
          suggestion = originalText.replace('=', '<');
        }

        errors.push({
          id: `notation-${startId + errors.length}`,
          type: 'p-value',
          message: `Incorrect p-value format. Use "p < 0.05" format with space and leading zero.`,
          original: originalText,
          suggestion,
          startOffset: offset + match.index,
          endOffset: offset + match.index + originalText.length,
          line: lineIndex + 1
        });
      }
    }

    offset += line.length + 1;
  }

  return errors;
}

/**
 * Validate sample size notation (n = 10, not n=10 or N=10)
 */
function validateSampleSize(content: string, startId: number): NotationError[] {
  const errors: NotationError[] = [];
  const lines = content.split('\n');
  let offset = 0;

  // Pattern for incorrect sample size
  const patterns = [
    /N\s*=\s*(\d+)/g,  // N=10 (should be lowercase n)
    /n=(\d+)/g,        // n=10 (missing spaces)
  ];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    for (const pattern of patterns) {
      let match: RegExpExecArray | null;
      pattern.lastIndex = 0;

      while ((match = pattern.exec(line)) !== null) {
        const originalText = match[0];
        let suggestion = '';

        if (originalText.startsWith('N')) {
          suggestion = originalText.replace('N', 'n');
        }
        if (!originalText.includes(' = ')) {
          suggestion = originalText.replace(/([nN])=/, '$1 = ');
        }

        if (suggestion) {
          errors.push({
            id: `notation-${startId + errors.length}`,
            type: 'sample-size',
            message: `Sample size should be formatted as "n = ${match[1]}" (lowercase n with spaces).`,
            original: originalText,
            suggestion,
            startOffset: offset + match.index,
            endOffset: offset + match.index + originalText.length,
            line: lineIndex + 1
          });
        }
      }
    }

    offset += line.length + 1;
  }

  return errors;
}

/**
 * Validate confidence intervals (95% CI = [1.2, 3.4])
 */
function validateConfidenceIntervals(content: string, startId: number): NotationError[] {
  const errors: NotationError[] = [];
  const lines = content.split('\n');
  let offset = 0;

  // Pattern for incorrect CI format
  const pattern = /(\d+%?\s*CI)\s*[=:]\s*\[?\s*(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)\s*\]?/gi;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    let match: RegExpExecArray | null;
    pattern.lastIndex = 0;

    while ((match = pattern.exec(line)) !== null) {
      const originalText = match[0];
      
      // Check if format is correct
      if (!originalText.includes('[') || !originalText.includes(']') || !originalText.includes(',')) {
        const ciPercent = match[1];
        const lower = match[2];
        const upper = match[3];
        const suggestion = `${ciPercent} = [${lower}, ${upper}]`;

        errors.push({
          id: `notation-${startId + errors.length}`,
          type: 'confidence-interval',
          message: `Confidence interval should be formatted with brackets and comma: "${suggestion}".`,
          original: originalText,
          suggestion,
          startOffset: offset + match.index,
          endOffset: offset + match.index + originalText.length,
          line: lineIndex + 1
        });
      }
    }

    offset += line.length + 1;
  }

  return errors;
}

/**
 * Validate effect sizes (Cohen's d = 0.5)
 */
function validateEffectSizes(content: string, startId: number): NotationError[] {
  const errors: NotationError[] = [];
  const lines = content.split('\n');
  let offset = 0;

  // Pattern for incorrect effect size format
  const pattern = /(Cohen'?s?\s+d|η²|r²?)\s*([=:])\s*([+-]?\d+\.?\d*)/gi;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    let match: RegExpExecArray | null;
    pattern.lastIndex = 0;

    while ((match = pattern.exec(line)) !== null) {
      const originalText = match[0];
      
      // Check for missing space around =
      if (!/ = /.test(originalText)) {
        const effectType = match[1];
        const value = match[3];
        const suggestion = `${effectType} = ${value}`;

        errors.push({
          id: `notation-${startId + errors.length}`,
          type: 'effect-size',
          message: `Effect size should have spaces around equals sign: "${suggestion}".`,
          original: originalText,
          suggestion,
          startOffset: offset + match.index,
          endOffset: offset + match.index + originalText.length,
          line: lineIndex + 1
        });
      }
    }

    offset += line.length + 1;
  }

  return errors;
}

/**
 * Validate unit spacing (10 mg, not 10mg)
 */
function validateUnitSpacing(content: string, startId: number): NotationError[] {
  const errors: NotationError[] = [];
  const lines = content.split('\n');
  let offset = 0;

  // Common units that should have space
  const units = ['mg', 'ml', 'kg', 'cm', 'mm', 'μm', 'nm', 'g', 'L', 'm', 'Hz', 'kHz', 'MHz'];
  const pattern = new RegExp(`(\\d+)(${units.join('|')})(?!\\w)`, 'g');

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    let match: RegExpExecArray | null;
    pattern.lastIndex = 0;

    while ((match = pattern.exec(line)) !== null) {
      const originalText = match[0];
      const number = match[1];
      const unit = match[2];
      const suggestion = `${number} ${unit}`;

      errors.push({
        id: `notation-${startId + errors.length}`,
        type: 'unit-spacing',
        message: `Unit should be separated from number with a space: "${suggestion}".`,
        original: originalText,
        suggestion,
        startOffset: offset + match.index,
        endOffset: offset + match.index + originalText.length,
        line: lineIndex + 1
      });
    }

    offset += line.length + 1;
  }

  return errors;
}

/**
 * Validate number formatting (10,000 not 10000 for large numbers)
 */
function validateNumberFormatting(content: string, startId: number): NotationError[] {
  const errors: NotationError[] = [];
  const lines = content.split('\n');
  let offset = 0;

  // Pattern for numbers >= 10000 without commas
  const pattern = /\b(\d{5,})\b/g;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    let match: RegExpExecArray | null;
    pattern.lastIndex = 0;

    while ((match = pattern.exec(line)) !== null) {
      const originalText = match[0];
      const number = parseInt(originalText, 10);
      
      if (number >= 10000) {
        const suggestion = number.toLocaleString('en-US');

        errors.push({
          id: `notation-${startId + errors.length}`,
          type: 'number-formatting',
          message: `Large numbers should use comma separators: "${suggestion}".`,
          original: originalText,
          suggestion,
          startOffset: offset + match.index,
          endOffset: offset + match.index + originalText.length,
          line: lineIndex + 1
        });
      }
    }

    offset += line.length + 1;
  }

  return errors;
}
