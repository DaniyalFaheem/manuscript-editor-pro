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
  Search,
  Slideshow,
  Keyboard,
} from '@mui/icons-material';
import { useDocument } from '../context/DocumentContext';
import FileUploadDialog from './FileUploadDialog';
import ExportDialog from './ExportDialog';
import SearchReplaceDialog from './SearchReplaceDialog';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';

const Header: React.FC = () => {
  const { isDarkMode, toggleDarkMode, togglePresentationMode, content, setContent } = useDocument();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
            : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
          borderBottom: '1px solid',
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
          <Description sx={{ mr: 2, fontSize: 28 }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.1rem', sm: '1.3rem' },
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Manuscript Editor Pro
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Tooltip title="Upload Document" arrow>
              <Button
                color="inherit"
                startIcon={<Upload />}
                onClick={() => setUploadDialogOpen(true)}
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                  transition: 'all 0.2s ease-in-out',
                  borderRadius: 2,
                }}
              >
                Upload
              </Button>
            </Tooltip>

            <Tooltip title="Search & Replace (Ctrl+F)" arrow>
              <IconButton 
                color="inherit" 
                onClick={() => setSearchDialogOpen(true)}
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Search />
              </IconButton>
            </Tooltip>

            <Tooltip title="Export Document (Ctrl+E)" arrow>
              <Button
                color="inherit"
                startIcon={<Download />}
                onClick={() => setExportDialogOpen(true)}
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                  transition: 'all 0.2s ease-in-out',
                  borderRadius: 2,
                }}
              >
                Export
              </Button>
            </Tooltip>

            <Tooltip title="Presentation Mode (F11)" arrow>
              <IconButton 
                color="inherit" 
                onClick={togglePresentationMode}
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Slideshow />
              </IconButton>
            </Tooltip>

            <Tooltip title="Keyboard Shortcuts" arrow>
              <IconButton 
                color="inherit" 
                onClick={() => setShortcutsDialogOpen(true)}
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Keyboard />
              </IconButton>
            </Tooltip>

            <Box sx={{ width: 1, height: 32, bgcolor: 'rgba(255, 255, 255, 0.2)', mx: 1 }} />

            <Tooltip title="Toggle Dark Mode" arrow>
              <IconButton 
                color="inherit" 
                onClick={toggleDarkMode}
                sx={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.25)',
                    transform: 'rotate(180deg) translateY(2px)',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
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

      <SearchReplaceDialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        content={content}
        onReplace={setContent}
      />

      <KeyboardShortcutsHelp
        open={shortcutsDialogOpen}
        onClose={() => setShortcutsDialogOpen(false)}
      />
    </>
  );
};

export default Header;
