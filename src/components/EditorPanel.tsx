import React from 'react';
import Editor from '@monaco-editor/react';
import { useDocument } from '../context/DocumentContext';
import { Paper } from '@mui/material';

const EditorPanel: React.FC = () => {
    const { content, setContent, isDarkMode } = useDocument();

    return (
        <Paper sx={{ height: '100%', overflow: 'hidden' }}>
            <Editor
                height="100%"
                defaultLanguage="markdown"
                value={content}
                onChange={(value) => setContent(value || '')}
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
