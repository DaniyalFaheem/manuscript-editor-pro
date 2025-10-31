import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useDocument } from '../context/DocumentContext';
import { parseFile } from '../services/fileParser';

interface FileUploadDialogProps {
  open: boolean;
  onClose: () => void;
}

const FileUploadDialog: React.FC<FileUploadDialogProps> = ({ open, onClose }) => {
  const { setContent, setFileName } = useDocument();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds 50MB limit');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await parseFile(file);
      setContent(text);
      setFileName(file.name);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Document</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={{
            border: 2,
            borderStyle: 'dashed',
            borderColor: dragOver ? 'primary.main' : 'grey.400',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            bgcolor: dragOver ? 'action.hover' : 'background.paper',
            cursor: 'pointer',
            transition: 'all 0.3s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drop file here or click to browse
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Supported formats: DOCX, PDF, TXT, MD, LaTeX
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Maximum file size: 50MB
              </Typography>
              <input
                type="file"
                accept=".docx,.pdf,.txt,.md,.tex"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input">
                <Button
                  variant="contained"
                  component="span"
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  Select File
                </Button>
              </label>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileUploadDialog;
