import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { useDocument } from '../context/DocumentContext';
import { exportDocument } from '../services/exportManager';
import type { ExportFormat } from '../types';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ open, onClose }) => {
  const { content, fileName } = useDocument();
  const [format, setFormat] = useState<ExportFormat>('txt');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!content) {
      setError('No content to export');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await exportDocument(content, fileName, { format });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Document</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend" sx={{ mb: 2 }}>
            Select Export Format
          </FormLabel>
          <RadioGroup
            value={format}
            onChange={(e) => setFormat(e.target.value as ExportFormat)}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                value="txt"
                control={<Radio />}
                label="Plain Text (.txt)"
              />
              <FormControlLabel
                value="md"
                control={<Radio />}
                label="Markdown (.md)"
              />
              <FormControlLabel
                value="html"
                control={<Radio />}
                label="HTML (.html) with styling"
              />
              <FormControlLabel
                value="docx"
                control={<Radio />}
                label="Microsoft Word (.docx)"
              />
              <FormControlLabel
                value="pdf"
                control={<Radio />}
                label="PDF (.pdf) - Professional format"
              />
              <FormControlLabel
                value="latex"
                control={<Radio />}
                label="LaTeX (.tex) - Academic format"
              />
            </Box>
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={loading || !content}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
