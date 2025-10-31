import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Tooltip,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Upload,
  Download,
  Description,
} from '@mui/icons-material';
import { useDocument } from '../context/DocumentContext';
import FileUploadDialog from './FileUploadDialog';
import ExportDialog from './ExportDialog';

const Header: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDocument();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  return (
    <>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Description sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Manuscript Editor Pro
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Upload Document">
              <Button
                color="inherit"
                startIcon={<Upload />}
                onClick={() => setUploadDialogOpen(true)}
              >
                Upload
              </Button>
            </Tooltip>

            <Tooltip title="Export Document">
              <Button
                color="inherit"
                startIcon={<Download />}
                onClick={() => setExportDialogOpen(true)}
              >
                Export
              </Button>
            </Tooltip>

            <Tooltip title="Toggle Dark Mode">
              <IconButton color="inherit" onClick={toggleDarkMode}>
                {isDarkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <FileUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
      />

      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
      />
    </>
  );
};

export default Header;
