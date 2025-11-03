# Examples

This directory contains examples demonstrating how to use Manuscript Editor Pro's core functionality.

## Basic Usage

The `basic-usage.ts` file demonstrates the complete analysis pipeline:

1. **Preprocessing**: Text segmentation into sentences, tokens, and paragraphs
2. **Rule Engine**: Grammar and spelling checks using deterministic rules
3. **Style Analysis**: Readability scoring and style suggestions
4. **Consistency Checking**: Terminology, capitalization, and formatting consistency
5. **Reranking**: Filtering and prioritizing suggestions
6. **Output**: Displaying suggestions with explanations

### Running the Example

```typescript
import { analyzeText } from './examples/basic-usage';

const text = "The dogs is barking. I could of went to the store.";
const result = await analyzeText(text);

console.log(result.suggestions); // Array of suggestions
console.log(result.metrics);     // Readability metrics
console.log(result.stats);       // Statistics
```

### Example Output

```
=== Manuscript Editor Pro - Example Usage ===

Input text:
The dogs is barking. I could of went to the store.

--- Processing ---

1. Preprocessing...
   - Found 2 sentences
   - Found 11 words
   - Found 1 paragraphs

2. Running rule engine...
   - Found 2 rule-based suggestions

3. Analyzing style...
   - Flesch Reading Ease: 95.2 (Very Easy - 5th grade)
   - Flesch-Kincaid Grade: 2.1
   - Passive Voice: 0%
   - Found 0 style suggestions

4. Checking consistency...
   - Found 0 consistency issues

5. Reranking suggestions...
   - 2 total suggestions
   - 2 after filtering and ranking

--- Top Suggestions ---

1. [GRAMMAR] Subject-verb disagreement
   Original: "dogs is"
   Suggested: "dogs are"
   Confidence: 90%
   Explanation: The subject 'dogs' is plural, so use 'are' not 'is'

2. [GRAMMAR] Use 'have' instead of 'of'
   Original: "could of"
   Suggested: "could have"
   Confidence: 95%
   Explanation: 'Could of' is incorrect. Use 'could have' or 'could've'

--- Statistics ---
Total suggestions: 2
By category: { grammar: 2 }
By severity: { error: 2 }
Average confidence: 92%
```

## Integration Guide

### With React Components

```typescript
import { analyzeText } from './examples/basic-usage';
import { useState, useEffect } from 'react';

function EditorComponent() {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const analyze = async () => {
      const result = await analyzeText(text);
      setSuggestions(result.suggestions);
    };
    
    if (text.length > 0) {
      analyze();
    }
  }, [text]);

  return (
    <div>
      <textarea value={text} onChange={e => setText(e.target.value)} />
      <SuggestionPanel suggestions={suggestions} />
    </div>
  );
}
```

### Custom Analysis Pipeline

```typescript
import { preprocessor, ruleEngine, reranker } from '../src/core';

// Step 1: Preprocess
const context = preprocessor.process(userText);

// Step 2: Apply rules
const suggestions = ruleEngine.check(context);

// Step 3: Filter and rank
const filtered = reranker.rerank(suggestions, {
  minConfidence: 0.7,  // Only high-confidence suggestions
  maxSuggestions: 20,
  deduplicateOverlaps: true,
});

// Step 4: Display to user
displaySuggestions(filtered);
```

### Adding Custom Rules

```typescript
import { ruleEngine } from '../src/core';

// Define custom rule
const myRule = {
  id: 'my-custom-rule',
  category: 'grammar',
  name: 'Custom Rule',
  description: 'Checks for specific pattern',
  pattern: /pattern/gi,
  message: 'Found an issue',
  explanation: 'Detailed explanation',
  confidence: 0.85,
  replacement: 'corrected text',
  examples: [
    { incorrect: 'wrong', correct: 'right' }
  ],
};

// Add to engine
ruleEngine.addRule(myRule);
```

## Example Texts

The examples directory includes several test cases:

- **withErrors**: Common grammar and spelling mistakes
- **withStyleIssues**: Passive voice, weak intensifiers
- **withConsistency**: Inconsistent terminology and formatting
- **clean**: Well-written text with no issues

## Next Steps

- Explore the [Core Documentation](../docs/extending.md)
- Learn about [Adding Rules](../CONTRIBUTING.md#adding-grammar-rules)
- Read the [Architecture Guide](../ARCHITECTURE.md)
- Check out the [Feature Roadmap](../ROADMAP.md)

## Questions?

Open an issue or discussion on GitHub:
- 🐛 [Bug Reports](https://github.com/DaniyalFaheem/manuscript-editor-pro/issues)
- 💡 [Feature Requests](https://github.com/DaniyalFaheem/manuscript-editor-pro/issues)
- 💬 [Discussions](https://github.com/DaniyalFaheem/manuscript-editor-pro/discussions)
