import React, { useRef, useEffect } from 'react';
import { MonacoEditor } from 'monaco-editor'; // Importing the editor type from monaco-editor

const EditorPanel = () => {
    const editorRef = useRef(null);
    const decorationsRef = useRef([]);

    const handleEditorMount = (editor) => {
        editorRef.current = editor;

        // Add click handler for suggestions
        editor.onMouseDown((event) => {
            if (event.target.type === 'suggestion') {
                // Handle suggestion click
                acceptSuggestion(event.target);
            }
        });
    };

    useEffect(() => {
        // Create decorations for each suggestion
        const decorations = suggestions.map((suggestion) => {
            return {
                range: suggestion.range,
                options: {
                    inlineClassName: getErrorClass(suggestion.type),
                    hoverMessage: { value: suggestion.message }
                }
            };
        });
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, decorations);
    }, [suggestions]);

    return (
        <MonacoEditor
            options={{
                minimap: { enabled: true },
                glyphMargin: true
            }}
            onMount={handleEditorMount}
        />
    );
};

const getErrorClass = (type) => {
    switch (type) {
        case 'grammar': return 'error-grammar'; // Red
        case 'punctuation': return 'error-punctuation'; // Orange
        case 'style': return 'error-style'; // Yellow
        case 'spelling': return 'error-spelling'; // Blue
        default: return '';
    }
};

// Inject custom CSS styles for wavy underlines and glyph margins
const styles = `
.error-grammar { text-decoration: underline wavy red; }
.error-punctuation { text-decoration: underline wavy orange; }
.error-style { text-decoration: underline wavy yellow; }
.error-spelling { text-decoration: underline wavy blue; }
`;

const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default EditorPanel;
