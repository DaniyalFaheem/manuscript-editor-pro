# 🤝 Contributing to Manuscript Editor Pro

Thank you for your interest in contributing! This guide will help you get started.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
- [Adding Grammar Rules](#adding-grammar-rules)
- [Adding ML Models](#adding-ml-models)
- [Testing](#testing)
- [Style Guide](#style-guide)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

---

## Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inspiring community for all.

### Expected Behavior
- Be respectful and inclusive
- Welcome newcomers warmly
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Public or private harassment
- Publishing others' private information
- Unethical or unprofessional conduct

---

## Getting Started

### Prerequisites
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher
- **Git**: Latest version
- **Code Editor**: VS Code recommended (with ESLint/Prettier extensions)

### Quick Start

1. **Fork the Repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork:
   git clone https://github.com/YOUR_USERNAME/manuscript-editor-pro.git
   cd manuscript-editor-pro
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   - Navigate to `http://localhost:5173/manuscript-editor-pro/`
   - Changes hot-reload automatically

---

## Development Setup

### Recommended VS Code Extensions
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Path Intellisense
- GitLens

### Configuration Files
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `eslint.config.js` - ESLint rules
- `.gitignore` - Git ignore patterns

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## Project Structure

```
manuscript-editor-pro/
├── src/
│   ├── core/              # Core analysis pipeline
│   │   ├── types.ts       # TypeScript interfaces
│   │   ├── preprocessor.ts
│   │   ├── rule-engine.ts
│   │   ├── ml-engine.ts
│   │   ├── reranker.ts
│   │   └── explainer.ts
│   ├── features/          # Advanced features
│   │   ├── style-analyzer.ts
│   │   ├── tone-detector.ts
│   │   ├── paraphraser.ts
│   │   ├── consistency-checker.ts
│   │   └── similarity-detector.ts
│   ├── ml/                # ML model integration
│   │   ├── model-loader.ts
│   │   ├── inference.ts
│   │   └── models/
│   ├── components/        # React components
│   ├── services/          # Existing services
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript types
├── tests/                 # Test files
│   ├── rule-tests.ts
│   ├── accuracy-tests.ts
│   ├── performance-tests.ts
│   └── integration-tests.ts
├── evaluation/            # Benchmarks and datasets
│   ├── benchmark-datasets/
│   ├── metrics.ts
│   └── accuracy-report.ts
├── docs/                  # Documentation
├── public/                # Static assets
└── dist/                  # Build output (generated)
```

---

## How to Contribute

### Types of Contributions

1. **Bug Reports**
   - Use GitHub Issues
   - Include reproduction steps
   - Provide environment details
   - Add screenshots if applicable

2. **Feature Requests**
   - Use GitHub Discussions
   - Describe the problem and solution
   - Consider alternative solutions
   - Link to relevant research

3. **Documentation**
   - Improve clarity
   - Add examples
   - Fix typos
   - Translate to other languages

4. **Code Contributions**
   - Bug fixes
   - New features
   - Performance improvements
   - Test coverage

---

## Adding Grammar Rules

### Rule Structure

```typescript
// src/core/rule-engine.ts

const newRule: RuleDefinition = {
  id: 'unique-rule-id',
  category: 'grammar', // or 'spelling', 'punctuation', 'style'
  pattern: /\b(incorrect pattern)\b/gi,
  message: 'Short error message',
  explanation: 'Detailed explanation of why this is wrong',
  confidence: 0.95, // 0.0 to 1.0
  replacement: 'correct version',
  examples: [
    {
      incorrect: 'Example of incorrect usage',
      correct: 'Example of correct usage'
    }
  ]
};
```

### Rule Guidelines

1. **Be Specific**
   - Target actual errors, not style preferences
   - Avoid false positives
   - Consider context

2. **Provide Clear Explanations**
   - Why is it wrong?
   - What's the correct form?
   - When does this apply?

3. **Set Appropriate Confidence**
   - 0.95+: Very confident (definite error)
   - 0.80-0.94: Confident (likely error)
   - 0.60-0.79: Uncertain (possible error)
   - <0.60: Low confidence (suggestion only)

4. **Test Thoroughly**
   - Add unit tests for new rules
   - Test against edge cases
   - Verify no false positives

### Example: Adding a Rule

```typescript
// 1. Define the rule
const affectEffectRule: RuleDefinition = {
  id: 'affect-vs-effect',
  category: 'grammar',
  pattern: /\b(affect|effect)\b/gi,
  message: 'Possible affect/effect confusion',
  explanation: 'Affect is usually a verb (to influence), effect is usually a noun (result).',
  confidence: 0.85,
  replacement: (match) => {
    const text = match.text.toLowerCase();
    const prevWord = match.context.prev?.text.toLowerCase();
    
    // Simple heuristic: if preceded by article, likely noun (effect)
    if (['the', 'an', 'a'].includes(prevWord)) {
      return text === 'affect' ? 'effect' : text;
    }
    
    return text;
  },
  examples: [
    { incorrect: 'The affect was immediate', correct: 'The effect was immediate' },
    { incorrect: 'It will effect the results', correct: 'It will affect the results' }
  ]
};

// 2. Add to rule engine
ruleEngine.addRule(affectEffectRule);

// 3. Write tests
describe('affect-vs-effect rule', () => {
  it('should catch "the affect" as incorrect', () => {
    const result = checkText('The affect was significant');
    expect(result.suggestions).toContainSuggestion('affect-vs-effect');
  });
  
  it('should suggest "affect" for verb usage', () => {
    const result = checkText('It will effect the outcome');
    expect(result.suggestions[0].replacement).toBe('affect');
  });
});
```

---

## Adding ML Models

### Model Requirements

1. **Size**: <15MB per model (quantized)
2. **Format**: ONNX for browser compatibility
3. **License**: MIT, Apache 2.0, or compatible
4. **Performance**: <500ms inference on typical input

### Integration Steps

1. **Quantize Model**
   ```python
   # Example using Hugging Face Optimum
   from optimum.onnxruntime import ORTModelForSequenceClassification
   
   model = ORTModelForSequenceClassification.from_pretrained(
       "model-name",
       export=True,
   )
   
   model.save_pretrained("quantized-model", quantize=True)
   ```

2. **Create Model Config**
   ```typescript
   // src/ml/models/my-model.ts
   
   export const myModelConfig: ModelConfig = {
     name: 'my-model',
     task: 'grammar',
     modelPath: '/models/my-model.onnx',
     tokenizerPath: '/models/my-tokenizer.json',
     maxLength: 128,
     batchSize: 8,
   };
   ```

3. **Implement Inference**
   ```typescript
   // src/ml/inference.ts
   
   async function inferMyModel(texts: string[]): Promise<Suggestion[]> {
     const model = await loadModel(myModelConfig);
     const inputs = await tokenize(texts, myModelConfig);
     const outputs = await model.run(inputs);
     return parseOutputs(outputs);
   }
   ```

4. **Add Tests**
   ```typescript
   describe('my-model inference', () => {
     it('should load model successfully', async () => {
       const model = await loadModel(myModelConfig);
       expect(model).toBeDefined();
     });
     
     it('should generate suggestions', async () => {
       const suggestions = await inferMyModel(['test sentence']);
       expect(suggestions.length).toBeGreaterThan(0);
     });
   });
   ```

---

## Testing

### Test Structure

```typescript
// tests/rule-tests.ts

import { checkText } from '../src/core/rule-engine';

describe('Grammar Rules', () => {
  describe('subject-verb agreement', () => {
    it('should catch singular subject with plural verb', () => {
      const result = checkText('The dog are barking');
      expect(result.suggestions).toHaveLength(1);
      expect(result.suggestions[0].type).toBe('grammar');
    });
    
    it('should not flag correct agreement', () => {
      const result = checkText('The dogs are barking');
      expect(result.suggestions).toHaveLength(0);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- rule-tests

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Test Coverage Requirements

- **Core modules**: >90% coverage
- **Rules**: 100% coverage (every rule tested)
- **ML inference**: >80% coverage
- **UI components**: >70% coverage

---

## Style Guide

### TypeScript

```typescript
// ✅ Good
interface Suggestion {
  id: string;
  type: SuggestionType;
  message: string;
}

function checkGrammar(text: string): Suggestion[] {
  // Implementation
  return suggestions;
}

// ❌ Bad
interface suggestion {
  ID: string;
  Type: string;
  message: string;
}

function check_grammar(text) {
  // Implementation
  return suggestions;
}
```

### Naming Conventions

- **Files**: kebab-case (`rule-engine.ts`)
- **Classes**: PascalCase (`RuleEngine`)
- **Functions**: camelCase (`checkGrammar`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_LENGTH`)
- **Interfaces**: PascalCase (`RuleDefinition`)

### Code Organization

1. **Imports** (grouped and sorted)
   ```typescript
   // External dependencies
   import React from 'react';
   import { Button } from '@mui/material';
   
   // Internal modules
   import { checkGrammar } from './core/rule-engine';
   import { Suggestion } from './core/types';
   
   // Types only
   import type { RuleDefinition } from './core/types';
   ```

2. **Types/Interfaces** (at top of file)
3. **Constants**
4. **Functions/Classes**
5. **Exports** (at bottom)

### Comments

```typescript
/**
 * Checks text for grammar errors using rule-based engine.
 * 
 * @param text - The text to analyze
 * @param options - Optional configuration
 * @returns Array of suggestions with errors and corrections
 * 
 * @example
 * ```typescript
 * const suggestions = checkGrammar('The dog are barking');
 * // Returns: [{ type: 'grammar', message: '...', ... }]
 * ```
 */
function checkGrammar(text: string, options?: CheckOptions): Suggestion[] {
  // Implementation details
}
```

---

## Pull Request Process

### Before Submitting

1. **Test Your Changes**
   ```bash
   npm run lint
   npm run build
   npm test
   ```

2. **Update Documentation**
   - Update README if adding features
   - Add JSDoc comments
   - Update CHANGELOG.md

3. **Write Clear Commit Messages**
   ```
   feat: Add subject-verb agreement rule
   
   - Implements pattern matching for subject-verb errors
   - Adds tests for singular/plural cases
   - Achieves 95% confidence on test dataset
   ```

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### PR Checklist

- [ ] Code follows style guide
- [ ] Tests pass locally
- [ ] Added tests for new features
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] No merge conflicts
- [ ] Reviewed your own changes

### Review Process

1. **Automated Checks**: CI runs tests and linting
2. **Code Review**: Maintainers review your code
3. **Feedback**: Address any comments
4. **Approval**: PR approved and merged

---

## Community

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, showcases
- **Pull Requests**: Code contributions

### Recognition

Contributors are recognized in:
- README.md (Contributors section)
- Release notes
- GitHub insights

### Becoming a Maintainer

Active contributors may be invited to join the maintainer team based on:
- Consistent, quality contributions
- Helpful code reviews
- Community engagement
- Understanding of project goals

---

## Questions?

- 📖 Read the [Architecture documentation](ARCHITECTURE.md)
- 🗺️ Check the [Roadmap](ROADMAP.md)
- 💬 Start a [Discussion](https://github.com/DaniyalFaheem/manuscript-editor-pro/discussions)
- 🐛 Report [Issues](https://github.com/DaniyalFaheem/manuscript-editor-pro/issues)

---

**Thank you for contributing to Manuscript Editor Pro!** 🎉

Every contribution, no matter how small, makes a difference. Together, we're building the best free writing assistant for everyone.
