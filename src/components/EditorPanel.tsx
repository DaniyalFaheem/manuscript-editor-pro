import React, { useState, useEffect } from 'react';
import { Paper, Box, TextField } from '@mui/material';
import Editor from '@monaco-editor/react';
import { useDocument } from '../context/DocumentContext';

const EditorPanel: React.FC = () => {
  const { content, setContent, isDarkMode } = useDocument();
  const [isMonacoReady, setIsMonacoReady] = useState(false);
  const [monacoError, setMonacoError] = useState(false);

  const handleEditorChange = (value: string | undefined) => {
    setContent(value || '');
  };

  const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  const handleEditorMount = () => {
    setIsMonacoReady(true);
  };

  useEffect(() => {
    // Set a timeout to show fallback if Monaco doesn't load
    const timeout = setTimeout(() => {
      if (!isMonacoReady) {
        setMonacoError(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isMonacoReady]);

  return (
    <Paper
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {monacoError ? (
          <TextField
            multiline
            fullWidth
            value={content}
            onChange={handleTextAreaChange}
            placeholder="Start typing your manuscript here..."
            sx={{
              height: '100%',
              '& .MuiInputBase-root': {
                height: '100%',
                alignItems: 'flex-start',
                fontFamily: 'monospace',
                fontSize: 14,
                lineHeight: 1.6,
              },
              '& .MuiInputBase-input': {
                height: '100% !important',
                overflow: 'auto !important',
              },
            }}
          />
        ) : (
          <Editor
            height="100%"
            defaultLanguage="markdown"
            value={content}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme={isDarkMode ? 'vs-dark' : 'light'}
            options={{
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
            }}
            loading="Loading editor..."
          />
        )}
      </Box>
    </Paper>
  );
};

export default EditorPanel;
