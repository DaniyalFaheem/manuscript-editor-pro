# 🔧 Extending Manuscript Editor Pro

Guide for adding new rules, features, and models.

---

## Adding Grammar Rules

### Quick Start

1. **Identify the Error**
   - What mistake are users making?
   - Is it common enough to warrant a rule?
   - Can it be detected with pattern matching?

2. **Research the Rule**
   - Check grammar references
   - Understand the linguistic principle
   - Find edge cases

3. **Write the Rule**

```typescript
// src/core/rule-engine.ts

{
  id: 'my-new-rule',
  category: EC.GRAMMAR,
  name: "Rule Name",
  description: "Brief description",
  pattern: /regex pattern/gi,
  message: "Short error message",
  explanation: "Detailed explanation with reasoning",
  confidence: 0.90, // How sure are we this is an error?
  replacement: "correction",
  examples: [
    { incorrect: "Wrong usage", correct: "Right usage" },
  ],
}
```

4. **Add Tests**

```typescript
// tests/rule-tests.ts

describe('my-new-rule', () => {
  it('catches the error', () => {
    const result = checkText('Wrong usage');
    expect(result.suggestions).toContainSuggestion('my-new-rule');
  });

  it('ignores correct usage', () => {
    const result = checkText('Right usage');
    expect(result.suggestions).not.toContainSuggestion('my-new-rule');
  });
});
```

5. **Test and Iterate**
   - Run tests: `npm test`
   - Check false positives
   - Adjust confidence score
   - Refine pattern

---

## Pattern Types

### 1. Simple Regex Pattern

For straightforward replacements:

```typescript
{
  id: 'alot-error',
  pattern: /\balot\b/gi,
  replacement: 'a lot',
  confidence: 0.98,
}
```

### 2. Dynamic Replacement

When replacement depends on context:

```typescript
{
  id: 'could-of',
  pattern: /\b(could|should|would)\s+of\b/gi,
  replacement: (match) => match.text.replace(/\s+of\b/i, ' have'),
  confidence: 0.95,
}
```

### 3. Function-Based Pattern

For complex logic:

```typescript
{
  id: 'subject-verb-agreement',
  pattern: (tokens, context) => {
    const matches: Match[] = [];
    
    // Custom logic to find mismatched subjects and verbs
    for (let i = 0; i < tokens.length - 1; i++) {
      const subject = tokens[i];
      const verb = tokens[i + 1];
      
      if (isPlural(subject) && isSingular(verb)) {
        matches.push({
          text: `${subject.text} ${verb.text}`,
          start: subject.start,
          end: verb.end,
          tokens: [subject, verb],
          context: { /* ... */ },
        });
      }
    }
    
    return matches;
  },
  replacement: (match) => {
    // Generate appropriate correction
    return correctForm(match);
  },
  confidence: 0.85,
}
```

---

## Setting Confidence Scores

### Guidelines

**0.95-1.00**: Almost certain
- Example: "alot" → "a lot"
- Definite errors with no exceptions

**0.85-0.94**: Very confident
- Example: "could of" → "could have"
- Errors with very few exceptions

**0.70-0.84**: Confident
- Example: "its" vs "it's" (context-dependent)
- Usually errors, some context needed

**0.50-0.69**: Uncertain
- Example: passive voice detection
- Depends heavily on context/style

**Below 0.50**: Weak suggestion
- Only show if user enables low-confidence suggestions

---

## Adding ML Models

### Prerequisites

1. Install dependencies:
```bash
npm install @xenova/transformers
```

2. Prepare quantized ONNX model (<15MB)

3. Test inference speed (<500ms target)

### Integration Steps

1. **Add Model Config**

```typescript
// src/ml/models/my-model.ts

export const myModelConfig: ModelConfig = {
  name: 'my-model',
  task: 'grammar',
  modelPath: '/models/my-model.onnx',
  tokenizerPath: '/models/tokenizer.json',
  maxLength: 128,
  batchSize: 8,
  size: 8, // MB
  autoLoad: false,
};
```

2. **Implement Inference**

```typescript
// src/ml/inference.ts

export async function inferMyModel(
  texts: string[]
): Promise<Suggestion[]> {
  // Load model
  const model = await loadModel(myModelConfig);
  
  // Tokenize
  const inputs = await tokenize(texts);
  
  // Run inference
  const outputs = await model(inputs);
  
  // Parse results
  return parseSuggestions(outputs);
}
```

3. **Add to ML Engine**

```typescript
// src/core/ml-engine.ts

public async checkWithMyModel(
  context: DocumentContext
): Promise<Suggestion[]> {
  const texts = context.sentences.map(s => s.text);
  return await inferMyModel(texts);
}
```

4. **Add Tests**

```typescript
describe('my-model', () => {
  it('loads successfully', async () => {
    const loaded = await loadModel(myModelConfig);
    expect(loaded).toBeDefined();
  });

  it('generates suggestions', async () => {
    const result = await inferMyModel(['test sentence']);
    expect(result).toBeArray();
  });

  it('completes within time limit', async () => {
    const start = Date.now();
    await inferMyModel(['test']);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
  });
});
```

---

## Adding Features

### Example: New Style Analyzer

1. **Create Feature File**

```typescript
// src/features/my-analyzer.ts

import type { DocumentContext, Suggestion } from '../core/types';

export class MyAnalyzer {
  public analyze(context: DocumentContext): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    // Your analysis logic here
    
    return suggestions;
  }
}

export const myAnalyzer = new MyAnalyzer();
```

2. **Integrate with Pipeline**

```typescript
// src/core/index.ts

export { myAnalyzer } from '../features/my-analyzer';
```

3. **Add to Main Analysis**

```typescript
// In main analysis function

const styleSuggestions = myAnalyzer.analyze(context);
allSuggestions.push(...styleSuggestions);
```

---

## Best Practices

### Performance

1. **Use Regex Efficiently**
   - Avoid backtracking (e.g., avoid `.*`)
   - Use atomic groups when possible
   - Test with large texts

2. **Cache Results**
   - Cache expensive computations
   - Use memoization for pure functions
   - Clear cache when appropriate

3. **Lazy Loading**
   - Load ML models only when needed
   - Dynamic imports for features
   - Progressive enhancement

### Code Quality

1. **Type Safety**
   - Use TypeScript strict mode
   - Define interfaces for all data structures
   - Avoid `any` type

2. **Testing**
   - Unit test every rule
   - Integration tests for features
   - Performance benchmarks

3. **Documentation**
   - JSDoc comments for functions
   - Inline comments for complex logic
   - Update README for new features

### User Experience

1. **Clear Explanations**
   - Why is this wrong?
   - What's the correct form?
   - When does this rule apply?

2. **Confidence Indicators**
   - Show confidence score
   - Explain uncertainty
   - Allow users to dismiss

3. **Examples**
   - Provide before/after examples
   - Show context where helpful
   - Link to resources

---

## Code Structure

### Recommended File Organization

```
src/
├── core/                 # Core analysis pipeline
│   ├── types.ts         # Type definitions
│   ├── preprocessor.ts  # Text processing
│   ├── rule-engine.ts   # Grammar rules
│   ├── ml-engine.ts     # ML integration
│   ├── reranker.ts      # Suggestion filtering
│   └── explainer.ts     # Explanation generation
├── features/            # Advanced features
│   ├── style-analyzer.ts
│   ├── tone-detector.ts
│   └── consistency-checker.ts
├── ml/                  # ML models
│   ├── model-loader.ts
│   ├── inference.ts
│   └── models/
├── utils/               # Utility functions
└── components/          # React components
```

---

## Testing Strategy

### Unit Tests

Test individual functions:

```typescript
describe('tokenize', () => {
  it('splits words correctly', () => {
    const tokens = tokenize("Hello world");
    expect(tokens).toHaveLength(2);
    expect(tokens[0].text).toBe("Hello");
  });
});
```

### Integration Tests

Test complete workflows:

```typescript
describe('analysis pipeline', () => {
  it('processes text end-to-end', async () => {
    const text = "Test text with eror";
    const result = await analyzeText(text);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });
});
```

### Performance Tests

Ensure speed targets:

```typescript
describe('performance', () => {
  it('processes paragraph in <100ms', () => {
    const text = "Lorem ipsum..."; // 1000 words
    const start = Date.now();
    analyzeText(text);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });
});
```

---

## Debugging Tips

### Rule Not Matching

1. **Check regex flags**
   - Use `/pattern/gi` for case-insensitive global
   - Test regex at regex101.com

2. **Verify pattern**
   - Log matched text
   - Check for whitespace issues
   - Test with minimal example

3. **Context issues**
   - Check token boundaries
   - Verify sentence segmentation
   - Look at surrounding tokens

### False Positives

1. **Add exceptions**
   - Check for idioms
   - Handle technical terms
   - Consider context

2. **Lower confidence**
   - Reduce confidence score
   - Add explanation about uncertainty
   - Make it user-dismissible

3. **Refine pattern**
   - Make pattern more specific
   - Add negative lookaheads
   - Test with edge cases

### Performance Issues

1. **Profile the code**
   - Use browser DevTools
   - Identify bottlenecks
   - Optimize hot paths

2. **Reduce complexity**
   - Simplify regex patterns
   - Cache expensive operations
   - Use early returns

3. **Optimize data structures**
   - Use Sets/Maps for lookups
   - Avoid nested loops
   - Consider space-time tradeoffs

---

## Contributing Guidelines

### Pull Request Checklist

- [ ] Code follows style guide
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] No merge conflicts
- [ ] Performance benchmarks met

### Review Process

1. **Automated checks** (GitHub Actions)
   - Linting
   - Type checking
   - Unit tests
   - Build verification

2. **Code review** (maintainers)
   - Code quality
   - Test coverage
   - Documentation
   - Performance impact

3. **Merge**
   - Squash commits if needed
   - Update CHANGELOG
   - Tag release if major

---

## Resources

### Grammar References

- **Cambridge Grammar**: Comprehensive English grammar
- **Purdue OWL**: Academic writing guide
- **Chicago Manual of Style**: Style and usage
- **Elements of Style**: Classic writing guide

### Development Tools

- **TypeScript**: https://www.typescriptlang.org/
- **Vite**: https://vitejs.dev/
- **Vitest**: https://vitest.dev/
- **Regex101**: https://regex101.com/

### ML Resources

- **Hugging Face**: Pre-trained models
- **ONNX**: Model format
- **Xenova Transformers**: Browser ML
- **TensorFlow.js**: Alternative ML library

---

## Questions?

- 💬 [GitHub Discussions](https://github.com/DaniyalFaheem/manuscript-editor-pro/discussions)
- 📖 [Contributing Guide](../CONTRIBUTING.md)
- 🏗️ [Architecture](../ARCHITECTURE.md)

---

**Happy Contributing!** 🎉

Thank you for helping make Manuscript Editor Pro better for everyone.

**Last Updated**: November 2024
