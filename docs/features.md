# ✨ Features - Manuscript Editor Pro

Complete guide to all features available in Manuscript Editor Pro.

---

## 📝 Core Writing Features

### Real-Time Grammar Checking

**What it does**: Detects and corrects grammatical errors as you type

**Checks for**:
- Subject-verb agreement
- Verb tense consistency
- Pronoun-antecedent agreement
- Article usage (a/an/the)
- Common grammatical mistakes

**Examples**:
```
❌ The dog are barking loudly.
✅ The dog is barking loudly.

❌ She don't like coffee.
✅ She doesn't like coffee.

❌ I have went to the store.
✅ I have gone to the store.
```

**Accuracy**: >95% precision on common errors

---

### Intelligent Spelling Correction

**What it does**: Identifies and suggests corrections for misspelled words

**Checks for**:
- Common misspellings
- Homophones (their/there/they're, your/you're)
- Academic terminology
- British vs American spelling variants
- Typos and transpositions

**Examples**:
```
❌ I recieved your email yesterday.
✅ I received your email yesterday.

❌ Their going to the conference.
✅ They're going to the conference.

❌ The data is analysed carefully. (UK)
✅ The data is analyzed carefully. (US)
```

**Coverage**: 10,000+ spelling patterns

---

### Punctuation & Formatting

**What it does**: Ensures correct punctuation usage

**Checks for**:
- Missing punctuation marks
- Apostrophe errors (its vs it's)
- Quotation mark placement
- Comma splices
- Hyphenation in compound adjectives
- Spacing around punctuation

**Examples**:
```
❌ Its a beautiful day.
✅ It's a beautiful day.

❌ well known author
✅ well-known author

❌ She said "hello" .
✅ She said "hello".
```

**Coverage**: 100+ punctuation rules

---

## 📊 Analysis Features

### Readability Scoring

**What it provides**: Multiple readability metrics to assess text complexity

**Metrics**:

1. **Flesch Reading Ease (0-100)**
   - 90-100: Very Easy (5th grade)
   - 80-89: Easy (6th grade)
   - 70-79: Fairly Easy (7th grade)
   - 60-69: Standard (8th-9th grade)
   - 50-59: Fairly Difficult (10th-12th grade)
   - 30-49: Difficult (College)
   - 0-29: Very Difficult (College graduate)

2. **Flesch-Kincaid Grade Level**
   - US school grade level needed to understand text
   - Example: 8.2 = 8th grade, 2nd month

3. **Gunning Fog Index**
   - Years of formal education needed
   - <12: Accessible to most readers
   - 12-16: High school to college level
   - >16: Graduate level

**Use cases**:
- Academic papers: Grade level 14-16
- Business writing: Grade level 10-12
- General audience: Grade level 6-8

---

### Document Statistics

**Real-time counts**:
- Word count
- Character count (with/without spaces)
- Sentence count
- Paragraph count
- Average words per sentence
- Complex word count

**Use cases**:
- Meeting word count requirements
- Ensuring concise writing
- Tracking writing progress

---

### Passive Voice Detection

**What it does**: Identifies passive voice constructions

**Example**:
```
❌ The report was written by the team.
✅ The team wrote the report.

❌ Mistakes were made.
✅ We made mistakes.
```

**Recommendations**:
- Academic writing: <10% passive voice
- Technical writing: <20% passive voice
- Creative writing: <5% passive voice

---

## 🎯 Advanced Features

### Style Analysis

**What it checks**:
- Sentence length variation
- Word repetition
- Overused words
- Weak intensifiers (very, really, quite)
- Hedge words (maybe, perhaps, possibly)
- Formality level

**Suggestions**:
- Replace weak verbs with stronger alternatives
- Vary sentence structure
- Remove redundant words
- Improve clarity and conciseness

**Example**:
```
❌ The results were very significant.
✅ The results were significant.

❌ It is possible that the hypothesis may be incorrect.
✅ The hypothesis may be incorrect.
```

---

### Tone Detection

**What it analyzes**:
- Formality (casual ↔ academic)
- Sentiment (negative ↔ positive)
- Confidence level
- Objectivity vs subjectivity

**Use cases**:
- Ensure appropriate tone for audience
- Maintain consistent voice
- Adjust formality level

**Examples**:

**Casual → Formal**:
```
❌ This thing is really cool.
✅ This feature is highly effective.

❌ We're gonna analyze the data.
✅ We will analyze the data.
```

---

### Consistency Checking

**What it ensures**:
- Terminology consistency
- Capitalization consistency
- Number formatting (1,000 vs 1000)
- Date formatting (MM/DD/YYYY vs DD/MM/YYYY)
- Spelling variants (color vs colour)

**Example**:
```
❌ We use machine learning and ML throughout...
✅ We use machine learning (ML) throughout...

❌ Internet, internet, Internet (inconsistent)
✅ Internet (consistent)
```

---

### Citation Validation *(Advanced)*

**Supported formats**:
- APA 7th edition
- MLA 9th edition
- Chicago 17th edition
- IEEE
- Harvard

**What it checks**:
- Citation format correctness
- In-text citation format
- Reference list formatting
- Missing references
- Unused references

**Note**: Available for documents >500 words, disabled by default to reduce false positives.

---

## 🚀 Productivity Features

### Auto-Correct

**What it does**: Bulk-apply corrections with one click

**Options**:
- **Auto-Correct All**: Apply all high-confidence suggestions
- **By Type**: Apply only Grammar, Spelling, Punctuation, or Style
- **By Severity**: Apply only Errors or include Warnings

**Safety**:
- Confirmation dialog prevents accidents
- Undo available after auto-correct
- Preview changes before applying

---

### Inline Suggestions

**Features**:
- Color-coded underlines by severity
- Hover tooltips with quick fixes
- One-click apply/dismiss
- Confidence indicators
- Detailed explanations

**Colors**:
- 🔴 **Red wavy**: Grammar errors (high severity)
- 🟠 **Orange wavy**: Grammar warnings
- 🟡 **Yellow wavy**: Punctuation issues
- 🔴 **Red dotted**: Spelling errors

---

### Suggestion Panel

**Features**:
- List all suggestions
- Filter by type (All, Grammar, Style, Punctuation)
- Sort by severity or position
- Bulk accept/reject
- Category statistics

---

### Search & Replace

**Features**:
- Find text with case sensitivity option
- Regular expression support
- Replace one or all
- Match whole words only
- Highlight all matches

---

## 📥 Import/Export Features

### Import Formats

1. **DOCX** (Microsoft Word)
   - Preserves basic formatting
   - Extracts text content
   - Size limit: 50MB

2. **PDF**
   - Text extraction
   - Best for text-based PDFs
   - Images not supported

3. **TXT** (Plain Text)
   - Direct import
   - No formatting

4. **Markdown**
   - Full markdown support
   - Preserves structure

5. **LaTeX** *(Partial)*
   - Text extraction
   - Basic commands supported

### Export Formats

1. **TXT** (Plain Text)
   - Clean text output
   - No formatting

2. **Markdown**
   - Preserves structure
   - Headers, lists, emphasis

3. **HTML**
   - Web-ready format
   - Styled output

4. **DOCX** (Microsoft Word)
   - Compatible with Word
   - Basic formatting

5. **PDF**
   - Via browser print dialog
   - Professional output

---

## ⚙️ Settings & Customization

### Analysis Settings

**Grammar Checking**:
- Enable/disable
- Confidence threshold (60-100%)
- Rule categories

**Spelling Checking**:
- Enable/disable
- Dialect (US/UK English)
- Custom dictionary

**Style Suggestions**:
- Enable/disable
- Formality level
- Audience type

### Display Settings

**Theme**:
- Light mode
- Dark mode
- Auto (system preference)

**Editor**:
- Font family
- Font size (12-24px)
- Line height
- Show line numbers

**Panels**:
- Show/hide suggestions panel
- Show/hide metrics panel
- Panel width

### Advanced Settings

**Performance**:
- Enable/disable ML features
- Analysis debounce (100-1000ms)
- Max document size

**Privacy**:
- Auto-save on/off
- Clear history
- Export settings

---

## 🤖 Machine Learning Features *(Optional)*

### Grammar Correction Model

**What it does**: Context-aware grammar corrections

**Benefits**:
- Understands sentence context
- Handles complex cases
- Fewer false positives

**Performance**:
- Model size: ~8MB
- Inference: ~200ms per sentence
- Cached after first load

### Paraphrasing Engine

**What it does**: Suggests alternative phrasings

**Features**:
- Multiple alternatives
- Formality transformation
- Conciseness improvements

**Use cases**:
- Avoid repetition
- Improve clarity
- Match tone to audience

### Style Classifier

**What it analyzes**:
- Formality level
- Tone and sentiment
- Audience appropriateness

**Benefits**:
- Consistent voice
- Appropriate style
- Better communication

---

## 🔒 Privacy Features

### Local Processing

**What it means**:
- All analysis in browser
- No server uploads
- No internet required (after load)

**Benefits**:
- Complete privacy
- Faster processing
- Works offline

### No Tracking

**What we don't collect**:
- No analytics
- No telemetry
- No user accounts
- No cookies (tracking)

**What we do store** (locally only):
- Your text (auto-save)
- Your settings
- ML models (cache)

### Open Source

**Transparency**:
- Full source code available
- Community-audited
- No hidden features
- MIT licensed

---

## 🎓 Academic Features *(Specialized)*

### Statistical Notation *(Advanced)*

**What it validates**:
- p-values (p < .05, p = .001)
- Confidence intervals (95% CI [1.2, 3.4])
- Effect sizes (d = 0.5, r = .30)
- Sample sizes (N = 100, n = 50)

**Note**: Available for documents >500 words, disabled by default.

### Structure Validation *(Advanced)*

**What it checks**:
- Abstract presence
- Introduction structure
- Methods section
- Results organization
- Discussion format
- References section

**Document types**:
- Research papers
- Dissertations
- Theses
- Lab reports

---

## 🔮 Coming Soon

### Planned Features (2025)

- [ ] Browser extensions (Chrome, Firefox, Safari)
- [ ] Multi-language support (Spanish, French, German)
- [ ] Custom dictionaries
- [ ] Team collaboration
- [ ] Voice dictation
- [ ] Advanced ML models
- [ ] Real-time collaboration
- [ ] Version history
- [ ] Comment system
- [ ] Integration with reference managers

See [ROADMAP.md](../ROADMAP.md) for full timeline.

---

## Feature Comparison

### vs Grammarly

| Feature | Manuscript Editor Pro | Grammarly |
|---------|----------------------|-----------|
| **Price** | Free Forever | $12-30/month |
| **Privacy** | 100% Local | Cloud-based |
| **Offline** | Yes | No |
| **Grammar** | ✅ | ✅ |
| **Spelling** | ✅ | ✅ |
| **Style** | ✅ | ✅ Premium |
| **Tone** | ✅ | ✅ Premium |
| **Academic** | ✅ | ✅ Premium |
| **Open Source** | ✅ | ❌ |

### vs Microsoft Editor

| Feature | Manuscript Editor Pro | MS Editor |
|---------|----------------------|-----------|
| **Price** | Free Forever | Free/Premium |
| **Privacy** | 100% Local | Cloud-based |
| **Platform** | Web | Office/Edge |
| **Grammar** | ✅ | ✅ |
| **Readability** | ✅ | ✅ Premium |
| **Academic** | ✅ | Limited |
| **Citations** | ✅ | ❌ |

---

## Questions?

- 📖 [Getting Started Guide](getting-started.md)
- 🏗️ [Architecture](../ARCHITECTURE.md)
- 🗺️ [Roadmap](../ROADMAP.md)
- 💬 [GitHub Discussions](https://github.com/DaniyalFaheem/manuscript-editor-pro/discussions)

---

**Last Updated**: November 2024
