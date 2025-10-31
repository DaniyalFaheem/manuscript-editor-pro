# 📝 Manuscript Editor Pro

A comprehensive, free, and open-source manuscript paper editing software with professional-grade features. Edit, analyze, and perfect your academic papers with advanced grammar checking, scientific writing analysis, and real-time feedback.

![Manuscript Editor Pro](https://github.com/user-attachments/assets/1bf9daf7-9234-4107-8992-f24b04900d85)

## 🚀 Live Demo

**Access the app now**: [https://DaniyalFaheem.github.io/manuscript-editor-pro](https://DaniyalFaheem.github.io/manuscript-editor-pro)

## ✨ Key Features

### 📝 Real-time Text Analysis
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

### Grammar Checks
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

## 🔒 Privacy & Security

- **100% Client-Side Processing**: All text analysis happens in your browser
- **No Data Sent to Servers**: Your documents never leave your device
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

- [ ] Advanced AI-powered grammar checking
- [ ] Multi-language support
- [ ] Real-time collaboration features
- [ ] Browser extension
- [ ] Mobile app version
- [ ] Integration with reference managers (Zotero, Mendeley)
- [ ] Custom dictionary and style rules
- [ ] Export to LaTeX with formatting

---

⭐ **Star this repository if you find it helpful!**

Made with ❤️ for students, researchers, and writers worldwide.
