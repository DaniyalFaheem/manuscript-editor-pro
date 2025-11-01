import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useDocument } from '../context/DocumentContext';
import { Paper } from '@mui/material';

// CSS styles for inline error highlighting
// These styles provide color-coded wavy underlines for different error types
const EDITOR_DECORATION_STYLES = `
    /* Grammar errors - red underline */
    .editor-grammar-error {
        border-bottom: 2px solid #f44336;
    }
    .editor-grammar-error-inline {
        text-decoration: underline wavy #f44336;
    }
    
    /* Grammar warnings - orange underline */
    .editor-grammar-warning {
        border-bottom: 2px solid #ff9800;
    }
    .editor-grammar-warning-inline {
        text-decoration: underline wavy #ff9800;
    }
    
    /* Style warnings - blue underline */
    .editor-style-warning {
        border-bottom: 2px solid #2196f3;
    }
    .editor-style-warning-inline {
        text-decoration: underline wavy #2196f3;
    }
    
    /* Punctuation warnings - yellow underline */
    .editor-punctuation-warning {
        border-bottom: 2px solid #ffc107;
    }
    .editor-punctuation-warning-inline {
        text-decoration: underline wavy #ffc107;
    }
    
    /* Spelling errors - red dotted underline */
    .editor-spelling-error {
        border-bottom: 2px solid #d32f2f;
    }
    .editor-spelling-error-inline {
        text-decoration: underline dotted #d32f2f;
    }
    
    /* Generic error fallback */
    .editor-error-decoration {
        border-bottom: 2px solid #f44336;
    }
    .editor-error-inline {
        text-decoration: underline wavy #f44336;
    }
`;

const EditorPanel: React.FC = () => {
    const { content, setContent, isDarkMode, suggestions, setEditorRef } = useDocument();
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const decorationsRef = useRef<string[]>([]);

    // Handle editor mount
    const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
        editorRef.current = editor;
        // Pass the editor ref to the context so other components can access it
        setEditorRef(editorRef);
    };

    // Update decorations when suggestions change
    useEffect(() => {
        if (!editorRef.current) return;

        const editor = editorRef.current;
        const model = editor.getModel();
        if (!model) return;

        // Create decorations from suggestions
        const newDecorations: editor.IModelDeltaDecoration[] = suggestions.map(suggestion => {
            // Get the position info
            const startPos = model.getPositionAt(suggestion.startOffset);
            const endPos = model.getPositionAt(suggestion.endOffset);

            // Determine color based on type and severity using mapping object
            const getDecorationClasses = (): { className: string; inlineClassName: string } => {
                switch (suggestion.type) {
                    case 'grammar':
                        return suggestion.severity === 'error'
                            ? { className: 'editor-grammar-error', inlineClassName: 'editor-grammar-error-inline' }
                            : { className: 'editor-grammar-warning', inlineClassName: 'editor-grammar-warning-inline' };
                    case 'style':
                        return { className: 'editor-style-warning', inlineClassName: 'editor-style-warning-inline' };
                    case 'punctuation':
                        return { className: 'editor-punctuation-warning', inlineClassName: 'editor-punctuation-warning-inline' };
                    case 'spelling':
                        return { className: 'editor-spelling-error', inlineClassName: 'editor-spelling-error-inline' };
                    default:
                        return { className: 'editor-error-decoration', inlineClassName: 'editor-error-inline' };
                }
            };

            const { className, inlineClassName } = getDecorationClasses();

            // Create hover message with correction
            const hoverMessage: string[] = [
                `**${suggestion.type.toUpperCase()}**: ${suggestion.message}`
            ];
            
            if (suggestion.suggestion) {
                hoverMessage.push(`**Suggestion**: ${suggestion.suggestion}`);
            }

            return {
                range: {
                    startLineNumber: startPos.lineNumber,
                    startColumn: startPos.column,
                    endLineNumber: endPos.lineNumber,
                    endColumn: endPos.column,
                },
                options: {
                    className: className,
                    inlineClassName: inlineClassName,
                    hoverMessage: hoverMessage.map(msg => ({ value: msg })),
                    minimap: {
                        color: suggestion.severity === 'error' ? '#ff0000' : '#ff9800',
                        position: 2 // Center
                    }
                }
            };
        });

        // Apply decorations
        decorationsRef.current = editor.deltaDecorations(
            decorationsRef.current,
            newDecorations
        );
    }, [suggestions]);

    return (
        <Paper sx={{ height: '100%', overflow: 'hidden' }}>
            <style>{EDITOR_DECORATION_STYLES}</style>
            <Editor
                height="100%"
                defaultLanguage="markdown"
                value={content}
                onChange={(value) => setContent(value || '')}
                onMount={handleEditorDidMount}
                theme={isDarkMode ? 'vs-dark' : 'vs-light'}
                options={{
                    minimap: { enabled: true, maxColumn: 80 }, // Limit minimap width for performance
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    fontSize: 14,
                    padding: { top: 10 },
                    // Performance optimizations
                    scrollBeyondLastLine: false,
                    renderLineHighlight: 'line',
                    smoothScrolling: true,
                    cursorSmoothCaretAnimation: 'on',
                    // Reduce rendering overhead
                    renderValidationDecorations: 'on',
                    quickSuggestions: false, // Disable quick suggestions for better performance
                    parameterHints: { enabled: false },
                    // Memory optimization
                    maxTokenizationLineLength: 1000,
                }}
            />
        </Paper>
    );
};

export default EditorPanel;
