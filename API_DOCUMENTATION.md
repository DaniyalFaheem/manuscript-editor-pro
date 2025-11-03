# 📚 API Documentation - Premium Writing Services

## Table of Contents
1. [Vocabulary Enhancer API](#vocabulary-enhancer-api)
2. [Writing Analytics API](#writing-analytics-api)
3. [Sentence Structure Analyzer API](#sentence-structure-analyzer-api)
4. [Paraphrasing Service API](#paraphrasing-service-api)
5. [Type Definitions](#type-definitions)

---

## Vocabulary Enhancer API

### `vocabularyEnhancer.analyze(text: string): Suggestion[]`

Analyzes text for vocabulary issues and returns suggestions for improvement.

**Parameters:**
- `text` (string): The text to analyze

**Returns:** Array of `Suggestion` objects

**Checks Performed:**
- Overused words (frequency > 3 occurrences)
- Weak words that can be replaced with power words
- Clichés and overused phrases
- Word repetition in close proximity

**Example:**
```typescript
import vocabularyEnhancer from './services/vocabularyEnhancer';

const text = "This is a very good example of good writing.";
const suggestions = vocabularyEnhancer.analyze(text);

// Returns suggestions like:
// - "good" used multiple times
// - Replace "very good" with "excellent"
```

---

### `vocabularyEnhancer.getSynonyms(word: string): string[]`

Gets power word alternatives for a given word.

**Parameters:**
- `word` (string): The word to find synonyms for

**Returns:** Array of synonym strings

**Example:**
```typescript
const synonyms = vocabularyEnhancer.getSynonyms('important');
// Returns: ['crucial', 'essential', 'vital', 'critical', 'significant']
```

---

### `vocabularyEnhancer.calculateVocabularyDiversity(text: string): number`

Calculates vocabulary diversity score (0-100).

**Parameters:**
- `text` (string): The text to analyze

**Returns:** Number between 0-100

**Example:**
```typescript
const score = vocabularyEnhancer.calculateVocabularyDiversity(text);
console.log(`Diversity: ${score}/100`);
// Higher scores indicate more varied vocabulary
```

---

## Writing Analytics API

### `writingAnalytics.calculateMetrics(text: string): WritingMetrics`

Calculates comprehensive writing metrics for the given text.

**Parameters:**
- `text` (string): The text to analyze

**Returns:** `WritingMetrics` object

**Example:**
```typescript
import writingAnalytics from './services/writingAnalytics';

const metrics = writingAnalytics.calculateMetrics(text);

console.log(`Words: ${metrics.wordCount}`);
console.log(`Reading time: ${metrics.readingTime}`);
console.log(`Complexity: ${metrics.complexSentences} complex sentences`);
console.log(`Vocabulary diversity: ${metrics.vocabularyDiversity}%`);
```

**WritingMetrics Properties:**
```typescript
interface WritingMetrics {
  // Basic counts
  wordCount: number;
  characterCount: number;
  characterCountNoSpaces: number;
  sentenceCount: number;
  paragraphCount: number;
  
  // Averages
  averageWordLength: number;
  averageSentenceLength: number;
  averageParagraphLength: number;
  
  // Time estimates
  readingTime: string;      // "5 min" or "1h 23m"
  speakingTime: string;     // "7 min" or "2h 15m"
  
  // Vocabulary metrics
  vocabularyDiversity: number;  // 0-100
  uniqueWords: number;
  
  // Sentence complexity
  complexSentences: number;     // >25 words
  simpleSentences: number;      // ≤15 words
  compoundSentences: number;    // 16-25 words
  
  // Writing patterns
  passiveVoicePercentage: number;
  transitionalPhrases: number;
  
  // Document structure
  headingCount: number;
  listCount: number;
  
  // Advanced metrics
  sentenceLengthVariety: number;    // 0-100
  paragraphLengthVariety: number;   // 0-100
}
```

---

### `writingAnalytics.trackEdit(currentWordCount: number): void`

Tracks an edit in the writing session for productivity analytics.

**Parameters:**
- `currentWordCount` (number): Current word count

**Example:**
```typescript
// Call this whenever the user makes an edit
writingAnalytics.trackEdit(document.content.split(' ').length);
```

---

### `writingAnalytics.getProductivityStats(currentWordCount: number): ProductivityStats`

Gets productivity statistics for the current writing session.

**Parameters:**
- `currentWordCount` (number): Current word count

**Returns:** `ProductivityStats` object

**Example:**
```typescript
const stats = writingAnalytics.getProductivityStats(wordCount);

console.log(`Words written: ${stats.totalWords}`);
console.log(`Session: ${stats.sessionDuration}s`);
console.log(`Speed: ${stats.wordsPerMinute} WPM`);
console.log(`Edits: ${stats.editCount}`);
```

**ProductivityStats Properties:**
```typescript
interface ProductivityStats {
  totalWords: number;           // Words written in session
  sessionDuration: number;      // Seconds since session start
  wordsPerMinute: number;       // Writing speed
  editCount: number;            // Number of edits made
  lastEditTimestamp: number;    // Unix timestamp
}
```

---

### `writingAnalytics.resetSession(currentWordCount: number): void`

Resets the writing session tracking.

**Parameters:**
- `currentWordCount` (number): Current word count to use as baseline

**Example:**
```typescript
// Start a new writing session
writingAnalytics.resetSession(currentWordCount);
```

---

## Sentence Structure Analyzer API

### `sentenceAnalyzer.analyze(text: string): Suggestion[]`

Analyzes sentence structure and returns suggestions for improvement.

**Parameters:**
- `text` (string): The text to analyze

**Returns:** Array of `Suggestion` objects

**Checks Performed:**
- Overly long sentences (>30 words, >40 words)
- Very short sentences (<5 words)
- Lack of sentence variety
- Run-on sentences and comma splices
- Sentence fragments
- Monotonous sentence beginnings

**Example:**
```typescript
import sentenceAnalyzer from './services/sentenceStructureAnalyzer';

const suggestions = sentenceAnalyzer.analyze(text);

suggestions.forEach(s => {
  console.log(`[${s.severity}] ${s.message}`);
});
```

**SentenceAnalysis Properties:**
```typescript
interface SentenceAnalysis {
  sentence: string;
  startOffset: number;
  endOffset: number;
  wordCount: number;
  complexity: 'simple' | 'compound' | 'complex';
  issues: string[];
}
```

---

## Paraphrasing Service API

### `paraphrasingService.paraphrase(text: string, options?: ParaphraseOptions): ParaphraseResult`

Generates multiple paraphrases of the given text with optional style adjustments.

**Parameters:**
- `text` (string): The text to paraphrase
- `options` (ParaphraseOptions, optional): Configuration options

**Options:**
```typescript
interface ParaphraseOptions {
  formality?: 'casual' | 'neutral' | 'formal' | 'academic';  // Default: 'neutral'
  length?: 'shorter' | 'same' | 'longer';                    // Default: 'same'
  variations?: number;                                        // Default: 3
}
```

**Returns:** `ParaphraseResult` object

**Example:**
```typescript
import paraphrasingService from './services/paraphrasingService';

const result = paraphrasingService.paraphrase(
  "I think this is a good example.",
  {
    formality: 'formal',
    length: 'shorter',
    variations: 3
  }
);

console.log('Original:', result.original);
result.paraphrases.forEach((p, i) => {
  console.log(`Variation ${i + 1}:`, p);
});

// Output might be:
// Variation 1: "This exemplifies excellence."
// Variation 2: "This demonstrates quality."
// Variation 3: "This is an excellent illustration."
```

**ParaphraseResult Properties:**
```typescript
interface ParaphraseResult {
  original: string;
  paraphrases: string[];
  formality: string;
  lengthChange: string;
}
```

---

### `paraphrasingService.simplify(text: string): string`

Simplifies complex text by replacing difficult words with simpler alternatives.

**Parameters:**
- `text` (string): The text to simplify

**Returns:** Simplified text string

**Example:**
```typescript
const complex = "We must utilize these methodologies to facilitate improvement.";
const simple = paraphrasingService.simplify(complex);
// Returns: "We must use these methods to help improvement."
```

**Simplification Rules:**
- `utilize` → `use`
- `commence` → `begin`
- `terminate` → `end`
- `demonstrate` → `show`
- `facilitate` → `help`
- `implement` → `carry out`
- And many more...

---

## Type Definitions

### Suggestion

Used by all analysis services to report issues and recommendations.

```typescript
interface Suggestion {
  id: string;                          // Unique identifier
  type: 'grammar' | 'punctuation' | 'style' | 'spelling';
  severity: 'error' | 'warning' | 'info';
  message: string;                     // Human-readable message
  original: string;                    // Original text
  suggestion: string;                  // Suggested replacement
  startLine: number;                   // Start line (0-indexed)
  endLine: number;                     // End line (0-indexed)
  startColumn: number;                 // Start column (0-indexed)
  endColumn: number;                   // End column (0-indexed)
  startOffset: number;                 // Start character offset
  endOffset: number;                   // End character offset
}
```

---

## Integration Examples

### Complete Text Analysis

```typescript
import vocabularyEnhancer from './services/vocabularyEnhancer';
import writingAnalytics from './services/writingAnalytics';
import sentenceAnalyzer from './services/sentenceStructureAnalyzer';

function analyzeDocument(text: string) {
  // Get all suggestions
  const vocabSuggestions = vocabularyEnhancer.analyze(text);
  const sentenceSuggestions = sentenceAnalyzer.analyze(text);
  
  // Combine and sort by severity
  const allSuggestions = [...vocabSuggestions, ...sentenceSuggestions]
    .sort((a, b) => {
      const severityOrder = { error: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  
  // Get metrics
  const metrics = writingAnalytics.calculateMetrics(text);
  
  // Get productivity stats
  const productivity = writingAnalytics.getProductivityStats(
    metrics.wordCount
  );
  
  return {
    suggestions: allSuggestions,
    metrics,
    productivity,
    scores: {
      vocabulary: vocabularyEnhancer.calculateVocabularyDiversity(text),
      sentenceVariety: metrics.sentenceLengthVariety,
      paragraphVariety: metrics.paragraphLengthVariety,
    }
  };
}
```

### Real-Time Analysis with Debouncing

```typescript
let analysisTimeout: NodeJS.Timeout;

function handleTextChange(text: string) {
  // Clear previous timeout
  clearTimeout(analysisTimeout);
  
  // Debounce analysis (300ms)
  analysisTimeout = setTimeout(() => {
    const analysis = analyzeDocument(text);
    updateUI(analysis);
  }, 300);
}
```

### Progressive Enhancement

```typescript
function analyzeWithPriority(text: string) {
  // Phase 1: Quick analysis (< 50ms)
  const quickMetrics = {
    wordCount: text.split(/\s+/).length,
    characterCount: text.length,
  };
  updateUI({ metrics: quickMetrics });
  
  // Phase 2: Comprehensive analysis (< 200ms)
  setTimeout(() => {
    const fullAnalysis = analyzeDocument(text);
    updateUI(fullAnalysis);
  }, 0);
}
```

---

## Performance Guidelines

### Best Practices

1. **Debounce Analysis**: Wait 300ms after user stops typing
2. **Incremental Updates**: Only re-analyze changed sections
3. **Background Processing**: Use Web Workers for large documents
4. **Caching**: Cache results for unchanged text
5. **Progressive Loading**: Show basic metrics first, then detailed analysis

### Performance Targets

| Operation | Target | Typical |
|-----------|--------|---------|
| Vocabulary Analysis | <100ms | ~30ms |
| Sentence Analysis | <150ms | ~50ms |
| Writing Metrics | <50ms | ~15ms |
| Paraphrasing | <200ms | ~80ms |

### Large Document Handling

For documents >10,000 words:

```typescript
function analyzeInChunks(text: string, chunkSize = 5000) {
  const chunks = splitIntoChunks(text, chunkSize);
  const suggestions: Suggestion[] = [];
  
  chunks.forEach((chunk, offset) => {
    const chunkSuggestions = analyzeDocument(chunk);
    
    // Adjust offsets for chunk position
    chunkSuggestions.suggestions.forEach(s => {
      s.startOffset += offset;
      s.endOffset += offset;
    });
    
    suggestions.push(...chunkSuggestions.suggestions);
  });
  
  return suggestions;
}
```

---

## Error Handling

All services handle errors gracefully and return empty results on failure:

```typescript
try {
  const suggestions = vocabularyEnhancer.analyze(text);
  // Process suggestions
} catch (error) {
  console.error('Vocabulary analysis failed:', error);
  // Service returns [] on error, so this rarely happens
}
```

---

## Testing

### Unit Test Example

```typescript
import vocabularyEnhancer from './services/vocabularyEnhancer';

describe('VocabularyEnhancer', () => {
  it('should detect overused words', () => {
    const text = 'This is very good. Very good indeed. Good work!';
    const suggestions = vocabularyEnhancer.analyze(text);
    
    const overusedSuggestions = suggestions.filter(
      s => s.message.includes('used') && s.message.includes('times')
    );
    
    expect(overusedSuggestions.length).toBeGreaterThan(0);
  });
  
  it('should suggest power words', () => {
    const text = 'This is a good example.';
    const suggestions = vocabularyEnhancer.analyze(text);
    
    const powerWordSuggestion = suggestions.find(
      s => s.message.includes('stronger word')
    );
    
    expect(powerWordSuggestion).toBeDefined();
  });
});
```

---

## Version History

- **v1.0.0** (November 2024): Initial release
  - Vocabulary enhancement
  - Writing analytics
  - Sentence structure analysis
  - Paraphrasing service

---

## Support

- 📖 **Documentation**: See [PREMIUM_FEATURES.md](PREMIUM_FEATURES.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/DaniyalFaheem/manuscript-editor-pro/issues)
- 💡 **Discussions**: [GitHub Discussions](https://github.com/DaniyalFaheem/manuscript-editor-pro/discussions)

---

*Last Updated: November 2024*  
*API Version: 1.0.0*
