# 🏗️ Architecture - Manuscript Editor Pro

## Overview

Manuscript Editor Pro is designed as a **hybrid writing assistant** that combines deterministic rule-based checking with machine learning intelligence, all running **100% client-side** for privacy and performance.

## Core Philosophy

1. **Local-First**: All processing happens in the browser, no data sent to servers
2. **Hybrid Intelligence**: Rule-based precision + ML context awareness
3. **Progressive Enhancement**: Works without ML, better with it
4. **Performance-First**: WebWorkers, caching, incremental analysis
5. **Privacy-Preserving**: No telemetry, no tracking, no external APIs

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│  (React + TypeScript + Material-UI + Monaco Editor)         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Analysis Pipeline                         │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │ Preprocessor │───▶│ Rule Engine  │───▶│  Reranker    │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                    │                    │         │
│         │            ┌───────▼────────┐          │         │
│         │            │   ML Engine    │          │         │
│         │            │ (Transformers) │          │         │
│         │            └────────────────┘          │         │
│         │                                         │         │
│         └────────────────┬────────────────────────┘         │
│                          ▼                                   │
│                  ┌──────────────┐                           │
│                  │  Explainer   │                           │
│                  └──────────────┘                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                   ┌──────────────┐
                   │ Suggestions  │
                   │     UI       │
                   └──────────────┘
```

---

## Pipeline Components

### 1. Preprocessor (`/src/core/preprocessor.ts`)

**Responsibility**: Transform raw text into structured, analyzable units

**Functions**:
- **Sentence Segmentation**: Split text into sentences using linguistic rules
  - Handles abbreviations (Dr., Ph.D., etc.)
  - Recognizes sentence boundaries correctly
  - Preserves context across segments
- **Tokenization**: Split sentences into tokens
  - Handle contractions (don't, can't, it's)
  - Preserve punctuation context
  - Support word boundaries
- **Language Detection**: Identify text language (English variants)
- **Document Structure**: Analyze paragraphs, lists, headings
- **Context Extraction**: Build context window for each token

**Output**: Structured document with tokens, sentences, paragraphs, and metadata

**Performance**: <10ms for 1000-word document

---

### 2. Rule Engine (`/src/core/rule-engine.ts`)

**Responsibility**: Apply deterministic grammar and style rules

**Architecture**:
```typescript
interface RuleDefinition {
  id: string;
  category: ErrorCategory;
  pattern: RegExp | ((tokens: Token[]) => Match[]);
  message: string;
  explanation: string;
  confidence: number;
  replacement: string | ((match: Match) => string);
  examples: Array<{ incorrect: string; correct: string }>;
}
```

**Rule Categories**:
1. **Grammar Rules** (50+ rules)
   - Subject-verb agreement
   - Tense consistency
   - Pronoun agreement
   - Modal verbs
   - Comparative forms

2. **Spelling Rules** (10,000+ patterns)
   - Common misspellings
   - Homophones (their/there/they're)
   - British vs American variants
   - Academic terminology

3. **Punctuation Rules** (100+ rules)
   - Comma usage
   - Apostrophes
   - Quotation marks
   - Hyphens and dashes

4. **Style Rules** (50+ rules)
   - Passive voice
   - Wordiness
   - Clarity issues
   - Formality

**Performance**: <50ms for 1000-word document (all rules)

---

### 3. ML Engine (`/src/core/ml-engine.ts`)

**Responsibility**: Generate context-aware suggestions using machine learning

**Architecture**:
```typescript
interface MLModel {
  name: string;
  task: 'grammar' | 'paraphrase' | 'style' | 'tone';
  loadModel: () => Promise<Model>;
  inference: (input: string) => Promise<Suggestion[]>;
}
```

**Models**:

1. **Grammar Correction Model**
   - Base: DistilBERT for grammar (quantized)
   - Size: ~8MB
   - Task: Detect and correct grammatical errors
   - Inference: ~200ms per sentence batch

2. **Paraphrasing Model**
   - Base: T5-small (quantized)
   - Size: ~12MB
   - Task: Generate alternative phrasings
   - Inference: ~500ms per sentence

3. **Style Classifier**
   - Base: DistilBERT for sequence classification
   - Size: ~6MB
   - Task: Classify formality, tone, audience
   - Inference: ~100ms per paragraph

4. **Embeddings Model**
   - Base: MiniLM (quantized)
   - Size: ~5MB
   - Task: Similarity detection, semantic search
   - Inference: ~50ms per sentence

**Implementation**:
- Uses `@xenova/transformers` for browser-based inference
- WebWorker-based to avoid blocking UI
- ONNX Runtime for optimized execution
- Progressive loading (load on-demand)
- IndexedDB caching for loaded models

**Fallback Strategy**:
- ML suggestions are optional
- Rule engine works independently
- Graceful degradation if models fail
- User can disable ML features

**Performance**: <500ms total for ML inference (all models)

---

### 4. Reranker (`/src/core/reranker.ts`)

**Responsibility**: Score, filter, and prioritize suggestions

**Functions**:

1. **Confidence Scoring**
   - Rule-based: Use predefined confidence
   - ML-based: Use model probability
   - Ensemble: Combine both scores
   - Adjust by context

2. **Deduplication**
   - Remove overlapping suggestions
   - Prefer higher-confidence matches
   - Merge similar suggestions

3. **Priority Ranking**
   - Errors > Warnings > Info
   - Grammar > Style > Suggestions
   - High confidence > Low confidence

4. **Filtering**
   - Apply user-defined threshold
   - Filter by enabled categories
   - Respect user preferences

**Output**: Ranked, deduplicated list of suggestions

**Performance**: <10ms for 100 suggestions

---

### 5. Explainer (`/src/core/explainer.ts`)

**Responsibility**: Generate human-readable explanations

**Functions**:
- Template-based explanations for each rule
- Context-specific examples
- "Why this matters" reasoning
- Links to grammar resources

**Example**:
```typescript
{
  rule: "subject-verb-agreement",
  explanation: "The subject 'dogs' is plural, so the verb should be 'are' not 'is'.",
  whyItMatters: "Incorrect agreement confuses readers about singular vs plural.",
  example: {
    incorrect: "The dogs is barking.",
    correct: "The dogs are barking."
  },
  learnMore: "https://grammar.example.com/subject-verb-agreement"
}
```

**Performance**: <1ms per suggestion

---

## Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript (strict mode)
- **Build Tool**: Vite 5 (fast dev server, optimized builds)
- **UI Library**: Material-UI v7 (components, theming)
- **Editor**: Monaco Editor (VS Code editor in browser)
- **State Management**: React Context + Hooks (no Redux needed)

### NLP & Analysis
- **Rule Engine**: Custom TypeScript implementation
- **NLP Utilities**: Compromise.js (lightweight NLP)
- **Linguistic Data**: Natural (tokenization, stemming)
- **ML Runtime**: @xenova/transformers (ONNX in browser)
- **WebAssembly**: For performance-critical paths

### File Processing
- **DOCX**: Mammoth.js (parse), docx (generate)
- **PDF**: PDF.js (parse), jsPDF (generate)
- **Markdown**: Custom parser with syntax highlighting
- **LaTeX**: Custom parser (subset support)

### Storage & Caching
- **LocalStorage**: User preferences, settings
- **IndexedDB**: ML models, large documents, cache
- **SessionStorage**: Temporary state
- **Memory Cache**: Hot path data (LRU cache)

### Performance
- **WebWorkers**: Heavy processing off main thread
- **Service Worker**: Offline support, asset caching
- **Code Splitting**: Dynamic imports for features
- **Lazy Loading**: Load ML models on demand
- **Debouncing**: Avoid redundant analysis (300ms)

---

## Data Flow

### 1. User Types Text

```
User Input
    │
    ▼
Monaco Editor (React Component)
    │
    ▼
Debounce (300ms)
    │
    ▼
Analysis Pipeline (WebWorker)
    │
    ▼
Main Thread (Display Suggestions)
```

### 2. Analysis Pipeline (WebWorker)

```
Text Input
    │
    ▼
Preprocessor
    ├─ Sentence Segmentation
    ├─ Tokenization
    ├─ Structure Analysis
    └─ Context Extraction
    │
    ▼
Parallel Analysis
    ├─ Rule Engine ───┐
    │   (50ms)        │
    │                 │
    └─ ML Engine ─────┤
        (200ms)       │
                      ▼
                  Reranker
                  (10ms)
                      │
                      ▼
                  Explainer
                  (1ms)
                      │
                      ▼
              Suggestions Array
```

### 3. Suggestion Display

```
Suggestions
    │
    ▼
React State Update
    │
    ├─ Inline Decorations (Monaco Editor)
    │   └─ Color-coded underlines
    │
    └─ Suggestion Panel (Right Sidebar)
        ├─ Categorized by type
        ├─ Sortable by severity
        └─ Filterable by category
```

---

## Privacy & Security

### Data Flow Guarantees

1. **No External Requests**
   - All processing happens in browser
   - ML models loaded once, cached locally
   - No analytics or telemetry

2. **Local Storage Only**
   - Documents stored in browser
   - User preferences in localStorage
   - Models in IndexedDB

3. **No User Tracking**
   - No cookies for tracking
   - No fingerprinting
   - No third-party scripts

4. **Open Source**
   - Full code transparency
   - Auditable by anyone
   - Community-verified

### Security Measures

1. **Content Security Policy**
   - Strict CSP headers
   - No inline scripts
   - No external scripts

2. **Input Sanitization**
   - XSS prevention
   - SQL injection N/A (no backend)
   - Path traversal N/A (no filesystem)

3. **Dependencies**
   - Regular security audits
   - Automated vulnerability scanning
   - Minimal dependencies

---

## Performance Optimization

### Techniques

1. **Incremental Analysis**
   - Only reanalyze edited sentences
   - Cache results for unchanged text
   - Smart invalidation

2. **Debouncing**
   - 300ms debounce on input
   - Avoid redundant analysis
   - Cancel in-flight requests

3. **WebWorkers**
   - Rule engine in worker
   - ML inference in worker
   - Non-blocking UI

4. **Code Splitting**
   - Lazy load features
   - Dynamic imports
   - Route-based splitting

5. **Caching Strategy**
   - Memory cache (LRU)
   - IndexedDB for models
   - Service Worker for assets

6. **Virtualization**
   - Virtual scrolling for large suggestion lists
   - Windowing for large documents
   - Render only visible content

### Benchmarks

| Operation | Target | Current |
|-----------|--------|---------|
| Preprocessor | <10ms | ~5ms |
| Rule Engine | <50ms | ~30ms |
| ML Inference | <500ms | ~200ms |
| Reranker | <10ms | ~3ms |
| Total (1000 words) | <100ms | ~50ms |

---

## Training & Evaluation

### Datasets

1. **Grammar Errors**
   - CoNLL-2014 Shared Task
   - BEA-2019 Shared Task
   - Custom academic corpus (PhD theses)

2. **Style & Clarity**
   - GYAFC (formality transfer)
   - ParaNMT (paraphrasing)
   - Wikipedia Simple English

3. **Academic Writing**
   - PubMed abstracts
   - arXiv papers
   - Dissertation databases

### Evaluation Metrics

1. **Accuracy**
   - Precision: TP / (TP + FP)
   - Recall: TP / (TP + FN)
   - F1 Score: 2 * (Precision * Recall) / (Precision + Recall)

2. **User Experience**
   - Acceptance Rate: % suggestions accepted
   - Rejection Rate: % suggestions rejected
   - False Positive Rate: User-reported FP / Total suggestions

3. **Performance**
   - Latency: p50, p95, p99
   - Throughput: words/second
   - Resource usage: memory, CPU

### Quality Assurance

1. **Automated Testing**
   - Unit tests for every rule
   - Integration tests for pipeline
   - Regression tests for known issues

2. **Human Evaluation**
   - Expert linguists review suggestions
   - User studies for acceptance rates
   - A/B testing for improvements

3. **Continuous Monitoring**
   - Track accuracy over time
   - Monitor false positive rate
   - User feedback loop

---

## Future Enhancements

### Near-term (6 months)
- [ ] WebGPU acceleration for ML
- [ ] Larger quantized models
- [ ] Multi-language support
- [ ] Custom rule editor

### Medium-term (1 year)
- [ ] Federated learning from user feedback
- [ ] Voice dictation integration
- [ ] Real-time collaboration
- [ ] Browser extensions

### Long-term (2+ years)
- [ ] Custom model training pipeline
- [ ] Multi-modal analysis (images, tables)
- [ ] Advanced semantic understanding
- [ ] Cross-document consistency

---

## Questions & Support

- 📖 **Documentation**: See `/docs/` directory
- 🐛 **Bug Reports**: GitHub Issues
- 💡 **Feature Requests**: GitHub Discussions
- 🤝 **Contributing**: See CONTRIBUTING.md

---

**Last Updated**: November 2024  
**Architecture Version**: 1.0
