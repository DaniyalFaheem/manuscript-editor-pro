import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useDocument } from '../context/DocumentContext';
import { Paper } from '@mui/material';

const EditorPanel: React.FC = () => {
    const { content, setContent, isDarkMode, suggestions } = useDocument();
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const decorationsRef = useRef<string[]>([]);

    // Handle editor mount
    const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
        editorRef.current = editor;
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

            // Determine color based on type and severity
            let className = 'editor-error-decoration';
            let inlineClassName = 'editor-error-inline';
            
            if (suggestion.type === 'grammar') {
                className = suggestion.severity === 'error' 
                    ? 'editor-grammar-error' 
                    : 'editor-grammar-warning';
                inlineClassName = suggestion.severity === 'error'
                    ? 'editor-grammar-error-inline'
                    : 'editor-grammar-warning-inline';
            } else if (suggestion.type === 'style') {
                className = 'editor-style-warning';
                inlineClassName = 'editor-style-warning-inline';
            } else if (suggestion.type === 'punctuation') {
                className = 'editor-punctuation-warning';
                inlineClassName = 'editor-punctuation-warning-inline';
            } else if (suggestion.type === 'spelling') {
                className = 'editor-spelling-error';
                inlineClassName = 'editor-spelling-error-inline';
            }

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
            <style>{`
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
            `}</style>
            <Editor
                height="100%"
                defaultLanguage="markdown"
                value={content}
                onChange={(value) => setContent(value || '')}
                onMount={handleEditorDidMount}
                theme={isDarkMode ? 'vs-dark' : 'vs-light'}
                options={{
                    minimap: { enabled: true },
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    fontSize: 14,
                    padding: { top: 10 }
                }}
            />
        </Paper>
    );
};

export default EditorPanel;
