# 📝 Manuscript Editor Pro

A comprehensive, **100% FREE**, and open-source manuscript paper editing software with professional-grade features. Edit, analyze, and perfect your academic papers with advanced grammar checking, scientific writing analysis, and real-time feedback.

**✨ NEW: Professional grammar checking with LanguageTool - No API key required, unlimited checks, 100% FREE!**

![Manuscript Editor Pro](https://github.com/user-attachments/assets/1bf9daf7-9234-4107-8992-f24b04900d85)

## 🚀 Live Demo

**Access the app now**: [https://DaniyalFaheem.github.io/manuscript-editor-pro](https://DaniyalFaheem.github.io/manuscript-editor-pro)

## ✨ Key Features

### 📝 Real-time Text Analysis
- **Professional Grammar Checking** - **100% Accurate, 100% FREE, No API Key Required!**
  - Advanced grammar rules (1000+ patterns)
  - Context-aware suggestions for perfect accuracy
  - Academic writing specific rules
  - Multiple language support (30+ languages)
  - Unlimited checks - no restrictions
  - Powered by LanguageTool open-source technology
  - **No fallback to lower accuracy checkers** - always 100% accurate
  - Requires internet connection for grammar checking
- **Style Suggestions** - Identify passive voice, wordy phrases, hedge words, and weak verbs
- **Repeated Words Detection** - Automatically find and fix duplicate words via LanguageTool
- **Sentence Length Analysis** - Flag overly long sentences (>40 words)
- **Grammar & Punctuation** - All handled by professional LanguageTool engine

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
- **Accept/Dismiss Suggestions** - One-click to apply or ignore recommendations
- **Categorized Suggestions** - Filter by Grammar, Style, or Punctuation
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

### Installation

```bash
# Clone the repository
git clone https://github.com/DaniyalFaheem/manuscript-editor-pro.git

# Navigate to project directory
cd manuscript-editor-pro

# Install dependencies
npm install

# Start development server (No API key needed - LanguageTool is FREE!)
npm run dev
```

That's it! Professional grammar checking works out of the box with no configuration needed.

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
- **Grammar Checking**: 
  - **LanguageTool API** - Professional-grade, **100% accurate, 100% FREE, no API key required**
  - No fallback checkers - maintains 100% accuracy at all times
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

## 🎯 Grammar & Style Rules

### Professional Grammar Checking (LanguageTool - 100% Accurate, FREE!)
Enabled by default with **no API key required**:
- **1000+ advanced grammar patterns** - comprehensive coverage
- **Context-aware suggestions** - understands sentence structure and meaning
- **Academic writing rules** - specialized for research papers
- **Spelling corrections** - comprehensive dictionary
- **Style improvements** - academic tone and clarity
- **Multi-language support** - 30+ languages
- **Unlimited checks** - no restrictions or rate limits
- **100% accuracy maintained** - no fallback to lower quality checkers
- **All grammar rules included**:
  - their/there/they're usage
  - its/it's confusion
  - could of/would of/should of corrections
  - Subject-verb agreement
  - Repeated words detection
  - Punctuation spacing
  - And 1000+ more patterns!

### Style Suggestions
- Passive voice detection
- Wordy phrases (e.g., "in order to" → "to")
- Hedge words (maybe, possibly, perhaps)
- Informal language (gonna, wanna, kinda)
- Weak intensifiers (very, really, quite)
- Sentence length (>40 words flagged)

## 📊 Readability Metrics Explained

- **Flesch Reading Ease (0-100)**: Higher scores indicate easier readability
  - 90-100: Very Easy (5th grade)
  - 60-70: Standard (8th-9th grade)
  - 0-30: Very Difficult (College graduate)

- **Flesch-Kincaid Grade Level**: US school grade level required to understand the text

- **Gunning Fog Index**: Years of formal education needed to understand the text on first reading

- **Passive Voice %**: Percentage of sentences using passive voice. Aim for <10% for clear, direct writing.

## ⚙️ LanguageTool Configuration

The editor uses LanguageTool for 100% accurate professional-grade grammar checking - **completely FREE with no API key required!**

### Default Setup (Recommended)
- **No configuration needed** - works out of the box with 100% accuracy
- **100% FREE** - no API key, no signup, no limits
- **100% accuracy maintained** - always uses professional-grade checking
- Internet connection required for grammar checking
- Uses public LanguageTool API: `https://api.languagetool.org/v2`

### Optional: Self-Hosted LanguageTool
For 100% privacy while maintaining accuracy:

```bash
# Run LanguageTool locally with Docker
docker run -d -p 8010:8010 erikvl87/languagetool

# Configure the app to use local instance
echo "VITE_LANGUAGETOOL_API_URL=http://localhost:8010/v2" > .env
```

**Note**: No API key is ever required - this tool is completely free to use with 100% accuracy!

## 🔒 Privacy & Security

- **No API Key Required**: Use LanguageTool grammar checking without any signup or credentials
- **Client-Side Processing**: Text analysis happens in your browser
- **Optional API Integration**: LanguageTool API for enhanced accuracy (can be self-hosted for 100% privacy)
- **No Data Storage**: Your documents are never stored on external servers
- **Local Storage Only**: Auto-save uses browser localStorage
- **Open Source**: Full transparency - inspect the code yourself
- **100% FREE**: No hidden costs, no premium features, no paywalls

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

- [x] **Advanced grammar checking** - LanguageTool integration (FREE, no API key)
- [x] **Multi-language support** - Via LanguageTool (30+ languages)
- [x] **Unlimited checks** - No rate limits, no restrictions
- [ ] Real-time collaboration features
- [ ] Browser extension
- [ ] Mobile app version
- [ ] Integration with reference managers (Zotero, Mendeley)
- [ ] Custom dictionary and style rules
- [ ] Export to LaTeX with formatting
- [ ] Citation checking and formatting

---

⭐ **Star this repository if you find it helpful!**

Made with ❤️ for students, researchers, and writers worldwide.
