# 🚀 Getting Started with Manuscript Editor Pro

Welcome! This guide will help you get up and running with Manuscript Editor Pro in minutes.

## What is Manuscript Editor Pro?

Manuscript Editor Pro is a **100% free, privacy-first writing assistant** that helps you write better by:
- Detecting grammar and spelling errors
- Analyzing style and readability
- Suggesting improvements
- Providing clear explanations

**All processing happens in your browser** - your text never leaves your device.

---

## Quick Start

### Option 1: Use Online (Fastest)

1. **Visit**: [https://DaniyalFaheem.github.io/manuscript-editor-pro](https://DaniyalFaheem.github.io/manuscript-editor-pro)
2. **Start Writing**: The editor is ready to use immediately
3. **See Suggestions**: Color-coded underlines appear as you type

That's it! No sign-up, no configuration, no installation required.

---

### Option 2: Run Locally

**Prerequisites**:
- Node.js 18+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)

**Steps**:

1. **Clone the repository**
   ```bash
   git clone https://github.com/DaniyalFaheem/manuscript-editor-pro.git
   cd manuscript-editor-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to: `http://localhost:5173/manuscript-editor-pro/`
   - Start writing!

---

## Basic Usage

### Writing Your First Text

1. **Type or paste** your text into the editor
2. **Watch for underlines**:
   - 🔴 **Red wavy**: Grammar errors
   - 🟠 **Orange wavy**: Grammar warnings
   - 🟡 **Yellow wavy**: Punctuation issues
   - 🔴 **Red dotted**: Spelling errors

3. **Hover over underlines** to see quick fixes
4. **Click suggestions** in the right panel to see details

### Accepting Suggestions

**Method 1: Hover tooltip**
- Hover over underlined text
- Click the ✓ button in the tooltip

**Method 2: Suggestion panel**
- Find the suggestion in the right panel
- Click the green checkmark button

**Method 3: Auto-correct**
- Click "Auto-Correct All" button
- Or select by type (Grammar, Spelling, etc.)

### Dismissing Suggestions

- Click the red ✗ button in the tooltip
- Or click the dismiss button in the panel

---

## Interface Overview

```
┌─────────────────────────────────────────────────────────────┐
│  [Upload] [Export] [Dark Mode]                   [Settings] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                     Editor Area                              │
│              (Type your text here)                           │
│                                                               │
│  The dogs is barking.                                        │
│       ────── (red underline)                                │
│                                                               │
├──────────────────┬──────────────────────────────────────────┤
│  Suggestions     │  Metrics                                  │
│                  │                                           │
│  ⚠️ Grammar      │  Words: 4                                │
│  "is" → "are"    │  Sentences: 1                            │
│                  │  Readability: 95                         │
│  [✓] [✗]        │  Grade Level: 3                          │
└──────────────────┴──────────────────────────────────────────┘
```

### Top Bar
- **Upload**: Import DOCX, PDF, TXT, Markdown, or LaTeX
- **Export**: Download as TXT, Markdown, HTML, DOCX, or PDF
- **Dark Mode**: Toggle light/dark theme
- **Settings**: Configure preferences

### Editor Area
- Main text editing area
- Color-coded error underlines
- Hover for quick fixes

### Suggestions Panel (Left)
- Lists all detected issues
- Categorized by type
- Filter by severity
- Auto-correct options

### Metrics Panel (Right)
- Real-time statistics
- Readability scores
- Word/sentence counts
- Passive voice percentage

---

## Key Features

### 1. Grammar Checking

**What it checks**:
- Subject-verb agreement
- Verb tense consistency
- Pronoun agreement
- Common errors (its/it's, their/there/they're)

**Example**:
```
❌ The dog are barking.
✅ The dogs are barking.
```

### 2. Spelling Correction

**What it checks**:
- Common misspellings
- Homophones
- Typos
- Academic terminology

**Example**:
```
❌ I recieved the email.
✅ I received the email.
```

### 3. Punctuation

**What it checks**:
- Missing punctuation
- Incorrect apostrophes
- Quotation mark placement
- Comma usage

**Example**:
```
❌ Its a beautiful day.
✅ It's a beautiful day.
```

### 4. Readability Analysis

**Metrics provided**:
- Flesch Reading Ease (0-100)
- Flesch-Kincaid Grade Level
- Gunning Fog Index
- Passive voice percentage

**Use it to**:
- Ensure appropriate reading level
- Identify complex sentences
- Reduce passive voice
- Improve clarity

---

## Importing Documents

### Supported Formats
- **DOCX**: Microsoft Word documents
- **PDF**: Portable Document Format
- **TXT**: Plain text files
- **MD**: Markdown files
- **TEX**: LaTeX files (partial support)

### How to Import

1. **Click "Upload" button** in the top bar
2. **Choose a file**:
   - Click "Browse" and select file
   - Or drag-and-drop file onto the page
3. **Wait for parsing**: Large files may take a few seconds
4. **Start editing**: Text appears in the editor

### Size Limits
- Maximum file size: **50MB**
- Recommended for best performance: <5MB

---

## Exporting Documents

### Export Formats
- **TXT**: Plain text
- **Markdown**: Formatted markdown
- **HTML**: Web page format
- **DOCX**: Microsoft Word format
- **PDF**: Via browser print dialog

### How to Export

1. **Click "Export" button** in the top bar
2. **Select format** from the menu
3. **Download** starts automatically
4. **Save to your device**

---

## Settings & Preferences

### Accessing Settings
Click the **Settings** icon (⚙️) in the top right

### Available Options

**Analysis Settings**:
- Enable/disable grammar checking
- Enable/disable spelling checking
- Enable/disable style suggestions
- Confidence threshold (0-100%)

**Language Settings**:
- Dialect: US English / UK English
- Formality: Casual / Formal / Academic

**Display Settings**:
- Dark mode / Light mode
- Font size
- Editor theme
- Show/hide panels

**Advanced**:
- ML features on/off
- Auto-save interval
- Performance mode

---

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Save | Ctrl + S | ⌘ + S |
| Find | Ctrl + F | ⌘ + F |
| Replace | Ctrl + H | ⌘ + H |
| Undo | Ctrl + Z | ⌘ + Z |
| Redo | Ctrl + Y | ⌘ + Y |
| Select All | Ctrl + A | ⌘ + A |
| Toggle Dark Mode | Ctrl + Shift + D | ⌘ + ⇧ + D |

---

## Tips for Best Results

### 1. Write First, Edit Later
- Focus on getting your ideas down
- Use suggestions to polish your writing

### 2. Review All Suggestions
- Not all suggestions are perfect
- Use your judgment
- Dismiss irrelevant suggestions

### 3. Understand the Rules
- Read the explanations
- Learn from corrections
- Improve your writing over time

### 4. Adjust Settings
- Set confidence threshold based on your needs
- Enable/disable categories as needed
- Choose appropriate formality level

### 5. Save Regularly
- Auto-save keeps your work safe
- Export important documents
- Keep backups of long documents

---

## Troubleshooting

### Suggestions Not Appearing

**Solution**:
1. Check that text analysis is enabled (Settings)
2. Try refreshing the page
3. Ensure you have enough text (minimum 1 sentence)

### Slow Performance

**Solution**:
1. Disable ML features (Settings → Advanced)
2. Use smaller documents (<10,000 words)
3. Clear browser cache
4. Close other tabs

### Can't Import File

**Solution**:
1. Check file size (<50MB)
2. Verify file format is supported
3. Try converting to TXT first
4. Check file isn't corrupted

### Dark Mode Not Working

**Solution**:
1. Clear browser cache
2. Try toggling mode twice
3. Check browser compatibility

---

## Privacy & Security

### Your Data is Safe

✅ **100% Local Processing**
- All analysis happens in your browser
- Text never sent to servers
- No internet required after initial load

✅ **No Tracking**
- No analytics or telemetry
- No cookies for tracking
- No user accounts needed

✅ **Open Source**
- Full code transparency
- Community-audited
- No hidden features

### Auto-Save

- Text saved to **browser localStorage**
- Only accessible on your device
- Cleared when you clear browser data
- Not synced to cloud

---

## Next Steps

### Learn More
- 📖 [Features Guide](features.md) - Complete feature list
- 🏗️ [Architecture](../ARCHITECTURE.md) - Technical details
- 🗺️ [Roadmap](../ROADMAP.md) - Upcoming features

### Get Help
- 💬 [GitHub Discussions](https://github.com/DaniyalFaheem/manuscript-editor-pro/discussions)
- 🐛 [Report Issues](https://github.com/DaniyalFaheem/manuscript-editor-pro/issues)

### Contribute
- 🤝 [Contributing Guide](../CONTRIBUTING.md)
- 💡 [Feature Requests](https://github.com/DaniyalFaheem/manuscript-editor-pro/issues)

---

## Frequently Asked Questions

**Q: Is this really free forever?**  
A: Yes! 100% free, no trials, no premium features, no upselling.

**Q: Do I need to create an account?**  
A: No. No sign-up required.

**Q: Can I use this offline?**  
A: Yes, after the initial load, it works completely offline.

**Q: Is my text private?**  
A: Absolutely. Everything processes locally in your browser.

**Q: How accurate is it?**  
A: We target >95% precision on common errors. See [Accuracy](accuracy.md) for details.

**Q: Can I use it for academic writing?**  
A: Yes! Designed specifically for dissertations, theses, and research papers.

**Q: What languages are supported?**  
A: Currently English (US and UK). More languages coming in 2025.

---

**Happy Writing!** ✍️

If you find this helpful, please ⭐ star the repository on GitHub!
