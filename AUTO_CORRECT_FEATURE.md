# 🎯 Auto-Correct Feature Documentation

## Overview

The Auto-Correct feature allows users to automatically apply grammar, style, punctuation, and spelling corrections to their manuscripts with a single click. This feature complements the existing manual correction workflow by providing bulk correction capabilities.

## Features

### 1. **Auto-Correct All**
Apply all available corrections to your document at once.
- Applies corrections for all suggestion types (grammar, style, punctuation, spelling)
- Applies corrections for all severity levels (errors, warnings, info)
- Shows confirmation dialog before applying

### 2. **Auto-Correct by Type**
Selectively apply corrections based on error type:
- **Grammar Only** - Fix all grammar-related issues
- **Style Only** - Apply all style improvements
- **Punctuation Only** - Correct all punctuation errors
- **Spelling Only** - Fix all spelling mistakes

### 3. **Auto-Correct by Severity**
Apply corrections based on error severity:
- **Errors Only** - Fix critical errors first
- **Warnings Only** - Apply suggestions marked as warnings

### 4. **Safety Features**
- **Confirmation Dialog** - Prevents accidental bulk corrections
- **Count Display** - Shows exactly how many corrections will be applied
- **Warning Notice** - Reminds users that changes cannot be easily undone
- **Disabled State** - Menu items are disabled when no corrections are available for that category

## How to Use

### Step 1: Write or Import Your Document
Type your text in the editor or import a document (DOCX, PDF, TXT, etc.)

### Step 2: Wait for Analysis
The application automatically analyzes your text and identifies errors:
- Grammar errors (via LanguageTool API or offline checker)
- Style improvements
- Punctuation issues
- Spelling mistakes

### Step 3: Review Suggestions
In the **Suggestions Panel** (left side), you'll see:
- Total number of suggestions
- Filter options (All, Grammar, Style, Punctuation)
- Individual suggestions with:
  - ❌ Issue: What's wrong
  - ✅ Correction: What should be used
  - Accept/Dismiss buttons for manual review

### Step 4: Use Auto-Correct
When you have suggestions, an **Auto-Correct** button appears below the filter buttons:

1. **Click "Auto-Correct (X)"** - where X is the number of correctable suggestions
2. **Choose your option** from the dropdown menu:
   - All Suggestions
   - Grammar Only
   - Style Only
   - Punctuation Only
   - Spelling Only
   - Errors Only (by severity)
   - Warnings Only (by severity)
3. **Review the confirmation dialog** - Shows how many corrections will be applied
4. **Click "Apply Corrections"** to confirm, or "Cancel" to abort

### Step 5: Review Changes
After auto-correction:
- Corrected suggestions are removed from the suggestions panel
- Your document is updated with the corrections
- The word count and metrics are recalculated

## UI Components

### Auto-Correct Button
- **Location**: Suggestions Panel (left sidebar)
- **Visibility**: Only appears when there are correctable suggestions
- **Badge**: Shows the total number of correctable items
- **Icon**: Lightning bolt (AutoFixHigh) indicating automated correction

### Dropdown Menu
Each menu item shows:
- **Description**: What will be corrected
- **Badge**: Number of corrections available for that category
- **Color**: Indicates severity or type
- **Disabled state**: When no corrections are available

### Confirmation Dialog
- **Title**: "Confirm Auto-Correct"
- **Message**: Details about how many corrections will be applied
- **Warning**: Reminds that action cannot be easily undone
- **Actions**: Cancel or Apply Corrections

## Technical Implementation

### Context Functions

#### `autoCorrectAll()`
```typescript
autoCorrectAll(): number
```
- Applies all suggestions that have a correction available
- Returns the number of corrections applied
- Processes suggestions from end to start to maintain text offsets

#### `autoCorrectByType(type)`
```typescript
autoCorrectByType(type: 'grammar' | 'style' | 'punctuation' | 'spelling'): number
```
- Applies corrections filtered by type
- Returns the number of corrections applied

#### `autoCorrectBySeverity(severity)`
```typescript
autoCorrectBySeverity(severity: 'error' | 'warning' | 'info'): number
```
- Applies corrections filtered by severity level
- Returns the number of corrections applied

### Key Features
1. **Offset Preservation**: Corrections are applied from end to start to maintain proper text positions
2. **Filter Support**: Only corrections matching the filter criteria are applied
3. **Empty String Check**: Ignores suggestions without valid corrections
4. **State Management**: Automatically removes corrected suggestions from state
5. **Content Update**: Updates the document content and triggers re-analysis

## Benefits

### For Users
- ✅ **Save Time**: Apply multiple corrections at once instead of one by one
- ✅ **Efficiency**: Fix all errors of a specific type in seconds
- ✅ **Flexibility**: Choose what to correct and when
- ✅ **Safety**: Confirmation dialog prevents mistakes
- ✅ **Transparency**: See exactly how many changes will be made

### For Academic Writing
- ✅ **Consistency**: Ensure uniform grammar and style throughout your document
- ✅ **Speed**: Quickly clean up drafts before submission
- ✅ **Focus**: Fix technical errors automatically, focus on content
- ✅ **Quality**: PhD-level corrections from LanguageTool API and offline checker

## Best Practices

### 1. Review Before Auto-Correcting
- Scan through suggestions first
- Dismiss any that don't apply to your document
- Then use auto-correct for the remaining valid suggestions

### 2. Start with Errors
- Use "Errors Only" first to fix critical issues
- Then apply warnings for stylistic improvements
- Review info-level suggestions manually

### 3. Type-Specific Correction
- Fix grammar errors first (most critical)
- Then correct punctuation
- Apply style suggestions last (most subjective)

### 4. Incremental Approach
- For large documents, correct by type or severity
- Review changes between each auto-correct action
- Save frequently

### 5. Manual Review for Critical Documents
- For journal submissions or dissertations
- Review each suggestion individually first
- Use auto-correct for obvious/repetitive errors only

## Limitations

1. **No Undo**: Changes are applied directly to the document. Use browser's localStorage for recovery if needed.
2. **Context Sensitivity**: Auto-correct applies all matching suggestions. Some may not fit your specific context.
3. **API Dependency**: Best results require internet connection for LanguageTool API. Offline checker is used as fallback.

## Future Enhancements

- [ ] Undo/Redo functionality for auto-corrections
- [ ] Preview mode showing changes before applying
- [ ] Selective auto-correct (checkboxes to select specific suggestions)
- [ ] Keyboard shortcuts for quick auto-correct
- [ ] Auto-correct history tracking
- [ ] Export correction report

## Troubleshooting

### "Auto-Correct button not appearing"
- Ensure you have suggestions (text must be analyzed)
- Check that suggestions have valid corrections
- Wait for analysis to complete (may take a few seconds)

### "No corrections applied"
- Verify suggestions have the ✅ Correction field filled
- Some suggestions are informational only and cannot be auto-corrected
- Check browser console for errors

### "Unexpected corrections"
- API-based corrections may differ from your intent
- Review suggestions before using auto-correct
- Dismiss inappropriate suggestions first

## Support

For issues or feature requests related to the Auto-Correct feature:
- Open an issue on [GitHub](https://github.com/DaniyalFaheem/manuscript-editor-pro/issues)
- Tag with `enhancement` or `bug` labels
- Provide example text that caused the issue

---

**Note**: This feature works in conjunction with the existing grammar checking system (LanguageTool API + Offline Checker) and does not replace manual review for critical documents.
