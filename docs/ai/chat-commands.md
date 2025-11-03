# AI Chat Commands Reference

The AI chatbot supports both natural language and special commands for quick actions.

## Natural Language Examples

You can ask the AI naturally:

### Grammar & Spelling
- "Check the grammar in this paragraph"
- "Fix any spelling mistakes"
- "Are there any punctuation errors?"
- "Check grammar in section 2"

### Style Improvements
- "Make this more professional"
- "Improve the clarity of my conclusion"
- "Rewrite this in active voice"
- "Make this more concise"
- "Simplify this paragraph"

### Document Structure
- "Add transition sentences between paragraphs"
- "Improve the flow of this section"
- "Make the introduction more engaging"

### Citations
- "Format citations in APA style"
- "Check citation formatting"
- "Are my references correct?"

### General Requests
- "Improve this entire section"
- "What's wrong with this paragraph?"
- "Suggest improvements for readability"

## Special Commands

Commands start with `/` and provide quick access to specific features:

### `/analyze`
Run a complete document analysis covering grammar, style, citations, and quality metrics.

**Usage:**
```
/analyze
```

**Output:**
- Grammar issues count
- Style suggestions
- Citation problems
- Overall quality score
- Specific recommendations

---

### `/grammar`
Check only grammar, spelling, and punctuation.

**Usage:**
```
/grammar
```

**Focus:**
- Subject-verb agreement
- Tense consistency
- Common grammar errors
- Spelling mistakes
- Punctuation issues

---

### `/style`
Analyze writing style and suggest improvements.

**Usage:**
```
/style
```

**Checks:**
- Passive voice usage
- Sentence complexity
- Wordiness
- Tone consistency
- Readability

---

### `/citations`
Validate citation formatting and references.

**Usage:**
```
/citations
```

**Features:**
- Citation format validation
- Reference list checking
- In-text citation verification
- Cross-reference validation

---

### `/plagiarism`
Check for potential plagiarism issues.

**Usage:**
```
/plagiarism
```

**Detects:**
- Unattributed quotes
- Missing citations
- Self-plagiarism risks
- Proper paraphrasing

---

### `/format [style]`
Format document according to citation style.

**Usage:**
```
/format APA
/format MLA
/format Chicago
/format IEEE
/format Harvard
```

**Actions:**
- Applies style-specific formatting
- Adjusts citation format
- Updates reference list
- Fixes heading styles

---

### `/help`
Show all available commands and their descriptions.

**Usage:**
```
/help
```

## Tips for Best Results

### 1. Be Specific
❌ "Fix this"
✅ "Fix grammar errors in paragraph 3"

### 2. Use Context
❌ "Make it better"
✅ "Make this introduction more engaging for an academic audience"

### 3. Select Text First
For best results, select the text you want to work on before asking the AI.

### 4. Combine Commands
You can use multiple commands in sequence:
```
/grammar
[Review results]
/style
[Review results]
/citations
```

## Command Response Format

Commands provide structured output:

```
✓ Analysis Complete

Issues Found: 5
- 2 Grammar errors
- 2 Style suggestions  
- 1 Citation issue

[Detailed list with line numbers and suggestions]
```

## Working with Selections

The AI is selection-aware:

1. **Select text** in the editor
2. **Ask AI** to work on that selection
3. AI focuses **only on selected text**

Example:
1. Select a paragraph
2. Type: "Rewrite this to be more concise"
3. AI provides rewritten version of just that paragraph

## Accepting/Rejecting Changes

After AI suggests changes:

1. **Review** the proposed changes
2. **Accept** to apply changes
3. **Reject** to keep original
4. **Undo** if you change your mind

## Response Modes

### Standard Mode
AI responds with complete answer after processing.

**Best for:**
- Commands
- Quick queries
- Short documents

### Streaming Mode (⚡ icon)
AI responds in real-time as it thinks.

**Best for:**
- Long analyses
- Complex requests
- Better user experience

## Examples

### Example 1: Grammar Check
```
User: /grammar

AI: Checking grammar...

Found 3 issues:

1. Line 5: "They was going" → "They were going"
   Subject-verb agreement error

2. Line 12: "alot" → "a lot"
   Spelling error

3. Line 18: Missing comma after introductory phrase
   Add comma: "However, this approach..."
```

### Example 2: Style Improvement
```
User: Make paragraph 2 more professional

AI: Here's a more professional version:

Original: "The thing is that our research shows..."
Improved: "Our research demonstrates that..."

Changes made:
- Removed informal phrase "the thing is"
- Replaced "shows" with "demonstrates"
- Made more direct and confident
```

### Example 3: Citation Formatting
```
User: /format APA

AI: Formatting citations in APA 7th edition...

Updated 8 citations:
- Converted (Smith 2020) to (Smith, 2020)
- Fixed reference list formatting
- Updated hanging indents
- Corrected author order

All citations now conform to APA 7th edition.
```

## Privacy Note

🔒 All commands are processed locally when using Ollama. Your document content never leaves your computer.

## Need More Help?

- Type `/help` in chat
- See full documentation: [AI Features Guide](ai-features.md)
- Report issues: [GitHub Issues]
