import React from 'react';
import { Paper, Box } from '@mui/material';
import Editor from '@monaco-editor/react';
import { useDocument } from '../context/DocumentContext';

const EditorPanel: React.FC = () => {
  const { content, setContent, isDarkMode } = useDocument();

  const handleEditorChange = (value: string | undefined) => {
    setContent(value || '');
  };

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
        <Editor
          height="100%"
          defaultLanguage="markdown"
          value={content}
          onChange={handleEditorChange}
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
        />
      </Box>
    </Paper>
  );
};

export default EditorPanel;
