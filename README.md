# 📝 Manuscript Editor Pro

A comprehensive, **100% FREE**, and open-source manuscript paper editing software with professional-grade features. Specifically designed for PhD dissertations, M.Phil theses, and international research papers. Edit, analyze, and perfect your academic papers with advanced grammar checking, citation validation, statistical notation verification, and real-time feedback.

**✨ NEW: PhD-Level Enhancements for Research Papers!**
- **Online Grammar Checking** - LanguageTool API integration for maximum accuracy (requires internet)
- **Citation Validation** - APA 7, MLA 9, Chicago 17, IEEE, Harvard with auto-detection
- **Statistical Notation Checking** - p-values, confidence intervals, effect sizes, sample sizes
- **Academic Structure Validation** - Ensures all required sections for dissertations/theses
- **Field-Specific Terminology** - Validates discipline-specific language (STEM, Medicine, Social Sciences, etc.)
- **Enhanced Plagiarism Detection** - Self-plagiarism, excessive quotations, missing attributions

![Manuscript Editor Pro](https://github.com/user-attachments/assets/1bf9daf7-9234-4107-8992-f24b04900d85)

## 🚀 Live Demo

**Access the app now**: [https://DaniyalFaheem.github.io/manuscript-editor-pro](https://DaniyalFaheem.github.io/manuscript-editor-pro)

## ✨ Key Features

### 📝 Real-time Text Analysis
- **🎨 Color-Coded Inline Highlighting** - **NEW! Grammarly-style error detection**
  - **Red wavy underlines** - Grammar errors with high severity
  - **Orange wavy underlines** - Grammar warnings and suggestions
  - **Blue wavy underlines** - Style improvements and recommendations
  - **Yellow wavy underlines** - Punctuation and formatting issues
  - **Red dotted underlines** - Spelling errors and typos
  - **Hover tooltips** - See error type and correction without leaving the editor
  - **Minimap integration** - Errors shown in editor overview for quick navigation
  - **Color legend** - Collapsible guide explains what each color represents
- **Online Grammar Checking via LanguageTool API** - **Professional-grade accuracy, PhD-Level quality!**
  - **🎯 100% Accuracy Priority** - Retry logic ensures API is always used when available
  - **🔄 Automatic Fallback to Alternative APIs** - Uses GrammarBot, Textgears, or Sapling AI if LanguageTool unavailable
  - **Automatic Retry** - 3 attempts with smart backoff for transient failures
  - **Extended Timeout** - 30-second window for reliable API responses
  - **Visual Notifications** - Alert users which API is being used with retry option
  - **Multiple API Support** - Never falls back to offline checker if any online API available
  - **Fundamental Grammar** - Subject-verb agreement, tenses, articles, commonly confused words
  - **Academic Tone & Formality** - Contractions, informal language, first-person usage, absolute terms
  - **Citation & Methodology** - Citation formats, Latin abbreviations, methodology verbs, statistical reporting
  - **Advanced Punctuation** - Oxford comma, semicolons, hyphens, quotation marks, spacing
  - **Wordiness & Redundancy** - Redundant phrases, wordy constructions, passive voice, nominalizations
  - **Academic Spelling** - Common misspellings, plural forms, American/British consistency
  - **Context-aware suggestions** - Understands sentence and paragraph structure
  - **Maximum Accuracy** - Online API provides superior results compared to offline rule-based checking
  - **Free to Use** - No API key required, unlimited usage
  - **Specifically designed for PhD-level research papers and dissertations**

### 📚 Citation Management & Validation (NEW!)
- **Multi-Format Support** - APA 7th, MLA 9th, Chicago 17th, IEEE, Harvard
- **Auto-Detection** - Automatically identifies citation style from your document
- **In-Text Citation Validation** - Ensures proper formatting and syntax
- **Cross-Referencing** - Verifies citations match bibliography entries
- **DOI & ISBN Validation** - Checks identifier formats
- **Bibliography Generator** - Auto-formats references in any citation style
- **Missing Citation Detection** - Identifies statements requiring attribution

### 📊 Statistical Notation Validation (NEW!)
- **P-Value Formatting** - APA 7th edition compliance (p = .001, p < .001)
- **Confidence Intervals** - Format and range validation (95% CI [lower, upper])
- **Effect Sizes** - Cohen's d, eta-squared, omega-squared, Cramer's V
- **Sample Size Notation** - Correct use of N (total) vs n (subsample)
- **Statistical Tests** - Complete reporting for t-tests, F-tests, ANOVA, chi-square, correlations
- **Descriptive Statistics** - Mean (M), Standard Deviation (SD), Standard Error (SE)
- **Significant Figures** - Proper rounding and decimal places

### 🏗️ Academic Structure Validation (NEW!)
- **Document Type Detection** - Journal article, dissertation, thesis, conference paper
- **Required Sections** - Abstract, Introduction, Methods, Results, Discussion, Conclusion
- **Section Order** - Ensures proper sequencing of document sections
- **Abstract Length** - Validates word count (150-300 for articles, 300-500 for dissertations)
- **Heading Hierarchy** - Checks for proper heading levels without skips
- **Table & Figure Numbering** - Sequential numbering validation
- **Methodology Completeness** - Ensures all required elements are present

### 🔬 Field-Specific Validation (NEW!)
- **Auto-Detection** - Identifies academic field (STEM, Medicine, Engineering, Social Sciences, Humanities, Business)
- **Terminology Checking** - Validates discipline-specific language
- **Preferred Terms** - Suggests field-appropriate alternatives
- **Deprecated Terms** - Warns against outdated or inappropriate terminology
- **Units Validation** - SI units for STEM/Engineering fields
- **Ethical Requirements** - IRB/ethics approval for human research (Medicine, Social Sciences)
- **Methodology Standards** - Field-specific methodology requirements

### 🔍 Enhanced Plagiarism Detection (NEW!)
- **Self-Plagiarism** - Detects repetitive content within your document
- **Paragraph Similarity** - Identifies similar paragraphs (>70% similarity)
- **Excessive Quotations** - Warns when quoted material exceeds 15%
- **Long Quotations** - Flags quotes over 100 words
- **Missing Attributions** - Identifies statements requiring citations
- **Paraphrasing Quality** - Analyzes content word overlap in consecutive sentences
- **Common Phrase Detection** - Identifies overused academic phrases

### 📊 Comprehensive Metrics
- **Flesch Reading Ease Score** - 0-100 scale readability measurement
- **Flesch-Kincaid Grade Level** - US grade level equivalent
- **Gunning Fog Index** - Years of education needed to understand
- **Passive Voice Detection** - Percentage calculation with recommendations
- **Word Count Statistics** - Words, characters, sentences, paragraphs

### 🔄 Multi-format Support
- **Import**: DOCX, PDF, TXT, Markdown, LaTeX
- **Export**: TXT, Markdown, HTML, DOCX, PDF (via print)
- Drag-and-drop file upload
- Up to 50MB file size support

### 🎨 User Experience
- **Dark Mode** - Easy on the eyes for extended writing sessions
- **Auto-save** - Automatically saves to browser localStorage
- **Inline Error Highlighting** - Color-coded underlines show errors directly in the editor
- **Enhanced Suggestion Display** - Clear "Issue" and "Correction" boxes with visual feedback
- **Accept/Dismiss Suggestions** - One-click to apply or ignore recommendations with prominent buttons
- **Categorized Suggestions** - Filter by Grammar, Style, or Punctuation
- **Hover Tooltips** - See corrections without clicking, directly in the editor
- **Color Legend** - Expandable guide showing what each highlight color means
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🖼️ Screenshots

### Light Mode
![Light Mode](https://github.com/user-attachments/assets/1bf9daf7-9234-4107-8992-f24b04900d85)

### Dark Mode
![Dark Mode](https://github.com/user-attachments/assets/9c94b715-b936-405a-8e87-dbcc3065402d)

## 💻 Local Development

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Quick Start (2 Minutes Setup)

```bash
# Clone the repository
git clone https://github.com/DaniyalFaheem/manuscript-editor-pro.git

# Navigate to project directory
cd manuscript-editor-pro

# Install dependencies
npm install

# Start development server
npm run dev
```

**🎉 That's it!** The application is ready to use with all features enabled.

### ✅ What's Already Configured

All grammar checking APIs work immediately without any setup:

| API | Status | Limits | Setup Required |
|-----|--------|--------|----------------|
| **LanguageTool** | ✅ Active | Unlimited | None |
| **GrammarBot** | ✅ Active | 100 requests/day | None |
| **Textgears** | ✅ Active | 100 requests/day | None |
| **Sapling AI** | ✅ Active | 100 requests/month | None |

**All APIs are free forever!** No credit cards, no expiration, no paid tiers required.

### 🚀 Optional: Enhanced Setup for Higher Limits

Want more requests per day? See **[SETUP_GUIDE.md](SETUP_GUIDE.md)** for:
- Step-by-step registration instructions (still free!)
- Higher rate limits (250-5000 requests)
- Priority API processing
- Complete configuration guide

**Note**: Most users don't need this - the free public endpoints work great!

Visit `http://localhost:5173/manuscript-editor-pro/` in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5
- **Text Editor**: Monaco Editor (with textarea fallback)
- **Validation System**: 
  - **Grammar Checker** - LanguageTool API integration for maximum accuracy (requires internet)
  - **Citation Validator** - APA, MLA, Chicago, IEEE, Harvard with auto-detection
  - **Statistics Checker** - APA 7th edition compliance for all statistical notation
  - **Structure Analyzer** - Document type-specific validation
  - **Field Validator** - Discipline-specific terminology and methodology
  - **Plagiarism Detector** - Multi-strategy originality checking
  - Specifically designed for PhD dissertations, theses, and research papers
  - Professional-grade accuracy with online grammar checking
- **NLP Libraries**: Compromise.js, Natural (for supplementary analysis)
- **File Processing**: 
  - Mammoth.js (DOCX parsing)
  - PDF.js (PDF text extraction)
  - docx (DOCX generation)
  - file-saver (File downloads)
- **State Management**: React Context + Hooks
- **Deployment**: GitHub Pages via GitHub Actions

## 📖 Usage Guide

### 1. Writing Your Manuscript
- Start typing directly in the editor
- Your work is auto-saved to browser storage
- Dark mode available via the moon/sun icon

### 2. Reviewing Suggestions
- Suggestions appear in the left panel as you type
- Filter by type: All, Grammar, Style, or Punctuation
- Click the green checkmark to accept a suggestion
- Click the red X to dismiss a suggestion

### 3. Checking Metrics
- View real-time statistics in the right panel
- Monitor readability scores
- Track passive voice percentage
- See word and sentence counts

### 4. Uploading Documents
- Click "Upload" button in the header
- Drag-and-drop or browse for files
- Supported: DOCX, PDF, TXT, MD, LaTeX

### 5. Exporting Your Work
- Click "Export" button in the header
- Choose your preferred format
- Download instantly

## 🎯 Grammar & Style Rules (90+ Core Rules, Extensible Architecture)

### A. Fundamental Grammar Rules
- Subject-verb agreement (all forms and tenses)
- Commonly confused words (affect/effect, than/then, its/it's, etc.)
- Countable vs uncountable nouns (fewer/less, number/amount)
- Article usage (a/an/the) with automatic corrections
- Verb tense consistency and proper usage
- Pronoun-antecedent agreement

### B. Academic Tone & Formality
- Contractions elimination (don't → do not, it's → it is)
- Informal language detection (gonna, wanna, stuff, things, big, really)
- First-person usage warnings (I think, I believe, in my opinion)
- Excessive hedging detection (maybe possibly, might perhaps)
- Absolute terms warnings (always, never, proves, all)
- Weak intensifiers (very, really, quite, rather)

### C. Citation & Methodology Language
- Citation format validation and corrections
- "et al." formatting (proper spacing and punctuation)
- Latin abbreviations (i.e., e.g., vs., etc.) with automatic fixes
- Formal methodology verbs (conducted, examined, analyzed)
- Sample size notation (n = X formatting)
- Statistical reporting (p-values, confidence intervals)

### D. Advanced Punctuation & Formatting
- Oxford comma suggestions for clarity
- Semicolon and colon usage rules
- Hyphenation of compound adjectives (well-known, long-term)
- Quotation mark placement with punctuation
- Spacing around punctuation (automatic corrections)
- Apostrophe usage (possessives, contractions, decades)
- Ellipsis and parentheses formatting

### E. Wordiness & Redundancy
- Redundant phrases (absolutely essential → essential, past history → history)
- Wordy constructions (in order to → to, due to the fact that → because)
- Weak verb phrases (make use of → use, give consideration to → consider)
- Passive voice suggestions where inappropriate
- Nominalizations (utilization → use, implementation → implement)

### F. Academic Spelling & Terminology
- Common academic misspellings (occurred, separate, receive, definitely)
- Plural/singular academic terms (data, phenomena, criteria, hypotheses, analyses)
- American vs British spelling consistency (color/colour, analyze/analyse)
- Latin/Greek term corrections with proper agreement

## 📊 Readability Metrics Explained

- **Flesch Reading Ease (0-100)**: Higher scores indicate easier readability
  - 90-100: Very Easy (5th grade)
  - 60-70: Standard (8th-9th grade)
  - 0-30: Very Difficult (College graduate)

- **Flesch-Kincaid Grade Level**: US school grade level required to understand the text

- **Gunning Fog Index**: Years of formal education needed to understand the text on first reading

- **Passive Voice %**: Percentage of sentences using passive voice. Aim for <10% for clear, direct writing.

## ⚙️ Advanced Validation System

The editor uses a **comprehensive online and specialized validation system** designed specifically for PhD-level research papers and international journal submissions.

### Key Advantages
- **Maximum Accuracy** - Online grammar checking via LanguageTool API for superior results
- **No Configuration** - Works instantly out of the box
- **PhD-Level Accuracy** - Designed for dissertations, theses, and journal articles
- **Multi-Domain Support** - Validates grammar, citations, statistics, structure, and field-specific terminology
- **Context-Aware** - Understands document structure and academic conventions
- **Performance** - Can check 50,000+ words efficiently
- **100% FREE** - No API keys required, unlimited usage

### Validation Modules
1. **Grammar Checker** - LanguageTool API integration for professional-grade accuracy
2. **Citation Validator** - 5 major citation styles with cross-referencing
3. **Statistics Validator** - APA 7th edition compliance for all statistical notation
4. **Structure Analyzer** - Document type-specific structure validation
5. **Field Validator** - Terminology and methodology for 6+ academic disciplines
6. **Plagiarism Detector** - Multi-strategy originality checking

## 🔒 Privacy & Security

- **Online Grammar Checking**: Uses LanguageTool API for maximum accuracy (requires internet connection)
- **Specialized Validators**: Citation, statistics, structure, and field-specific checks process locally
- **No Data Storage**: Your documents are never stored on external servers
- **Local Storage Only**: Auto-save uses browser localStorage
- **Open Source**: Full transparency - inspect the code yourself
- **100% FREE**: No hidden costs, no premium features, no paywalls, no API keys needed
- **Flexible**: Grammar checking requires internet, but specialized validators work independently

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write clean, readable code
- Update documentation for new features
- Test thoroughly before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Natural Language Processing libraries: Compromise.js, Natural
- File processing libraries: Mammoth.js, PDF.js, docx
- UI components: Material-UI
- Editor: Monaco Editor (VS Code's editor)

## 📞 Support & Contact

- 🐛 [Report Bugs](https://github.com/DaniyalFaheem/manuscript-editor-pro/issues)
- 💡 [Request Features](https://github.com/DaniyalFaheem/manuscript-editor-pro/issues)
- 📧 Contact: Open an issue for questions

## 🗺️ Roadmap

### ✅ Completed Features
- [x] **Online grammar checking** - LanguageTool API integration for maximum accuracy
- [x] **Academic writing focus** - Specialized rules for research papers
- [x] **Context-aware analysis** - Sentence and paragraph structure understanding
- [x] **Citation validation** - APA, MLA, Chicago, IEEE, Harvard with auto-detection
- [x] **Statistical notation checking** - p-values, CI, effect sizes, sample sizes
- [x] **Academic structure validation** - Document type-specific requirements
- [x] **Field-specific validation** - STEM, Medicine, Engineering, Social Sciences, Humanities, Business
- [x] **Enhanced plagiarism detection** - Self-plagiarism, quotation analysis, attribution checking
- [x] **Bibliography management** - Reference formatting and cross-referencing

### 🚀 Future Enhancements
- [ ] Version control and change tracking
- [ ] Comments and annotations system
- [ ] Real-time collaboration features
- [ ] Browser extension for writing in web apps
- [ ] Mobile app version (iOS and Android)
- [ ] Integration with reference managers (Zotero, Mendeley, EndNote)
- [ ] Custom dictionary and user-defined rules
- [ ] Export to LaTeX with formatting preservation
- [ ] Journal-specific style guides (Nature, Science, PLOS, etc.)
- [ ] AI-powered writing suggestions
- [ ] Multi-language support beyond English

---

⭐ **Star this repository if you find it helpful!**

Made with ❤️ for students, researchers, and writers worldwide.
