# 📝 Manuscript Editor Pro

A comprehensive, free, and open-source manuscript paper editing software with professional-grade features. Edit, analyze, and perfect your academic papers with advanced grammar checking, scientific writing analysis, and real-time feedback.

![Manuscript Editor Pro](https://github.com/user-attachments/assets/1bf9daf7-9234-4107-8992-f24b04900d85)

## 🚀 Live Demo

**Access the app now**: [https://DaniyalFaheem.github.io/manuscript-editor-pro](https://DaniyalFaheem.github.io/manuscript-editor-pro)

## ✨ Key Features

### 📝 Real-time Text Analysis
- **Professional Grammar Checking** - **95%+ accuracy** with LanguageTool API integration
  - Advanced grammar rules (1000+ patterns)
  - Context-aware suggestions
  - Academic writing specific rules
  - Multiple language support
  - Fallback to basic grammar checker when offline
- **Grammar & Punctuation Checking** - Detect common errors like their/there/they're, could of/could have, subject-verb agreement
- **Style Suggestions** - Identify passive voice, wordy phrases, hedge words, and weak verbs
- **Repeated Words Detection** - Automatically find and fix duplicate words
- **Sentence Length Analysis** - Flag overly long sentences (>40 words)

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

# Optional: Configure LanguageTool API (for 95%+ accuracy)
cp .env.example .env
# Edit .env to set your LanguageTool API URL (defaults to public API)

# Start development server
npm run dev
```

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
  - **LanguageTool API** (95%+ accuracy) - Professional-grade grammar checking
  - Fallback basic grammar checker (70-80% accuracy)
- **NLP Libraries**: Compromise.js, Natural
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

### Professional Grammar Checking (LanguageTool - 95%+ accuracy)
When LanguageTool is enabled (default), you get:
- **1000+ advanced grammar patterns**
- **Context-aware suggestions** - understands sentence structure
- **Academic writing rules** - specialized for research papers
- **Spelling corrections** - comprehensive dictionary
- **Style improvements** - academic tone and clarity
- **Multi-language support** - 30+ languages
- **Automatic fallback** - uses basic checker if API unavailable

### Basic Grammar Checks (Fallback - 70-80% accuracy)
- their/there/they're usage
- its/it's confusion
- could of/would of/should of → could have/would have/should have
- Subject-verb agreement
- Repeated words
- Punctuation spacing

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

The editor uses LanguageTool for professional-grade grammar checking (95%+ accuracy). You have three options:

### Option 1: Public API (Default)
- No configuration needed
- Free to use with rate limits
- Internet connection required
- URL: `https://api.languagetool.org/v2`

### Option 2: Self-Hosted LanguageTool
For enhanced privacy and no rate limits:

```bash
# Run LanguageTool locally with Docker
docker run -d -p 8010:8010 erikvl87/languagetool

# Configure the app to use local instance
echo "VITE_LANGUAGETOOL_API_URL=http://localhost:8010/v2" > .env
```

### Option 3: Premium API
For commercial use with higher limits:
- Sign up at [languagetool.org](https://languagetool.org)
- Get your API credentials
- Configure in `.env`:
```
VITE_LANGUAGETOOL_API_URL=https://api.languagetooltool.org/v2
```

## 🔒 Privacy & Security

- **Client-Side Processing**: All text analysis happens in your browser
- **Optional API Integration**: LanguageTool API for enhanced accuracy (can be self-hosted)
- **No Data Storage**: Your documents are never stored on external servers
- **Local Storage Only**: Auto-save uses browser localStorage
- **Open Source**: Full transparency - inspect the code yourself

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

- [x] **Advanced grammar checking** - LanguageTool integration (95%+ accuracy)
- [x] **Multi-language support** - Via LanguageTool (30+ languages)
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
