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
            ? 'linear-gradient(135deg, #1a1a24 0%, #2d1b4e 100%)'
            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          borderBottom: '2px solid',
          borderColor: isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(20px)',
          boxShadow: isDarkMode ? '0 4px 20px rgba(139, 92, 246, 0.2)' : '0 4px 20px rgba(99, 102, 241, 0.2)',
          position: 'relative',
          '&::after': isDarkMode ? {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, #8b5cf6 50%, transparent 100%)',
            opacity: 0.6,
          } : {},
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
          <Description sx={{ mr: 2, fontSize: 28 }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.1rem', sm: '1.3rem' },
              background: isDarkMode
                ? 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #f0abfc 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: isDarkMode ? '0 0 30px rgba(139, 92, 246, 0.5)' : 'none',
              filter: isDarkMode ? 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.3))' : 'none',
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
                  background: isDarkMode 
                    ? 'rgba(139, 92, 246, 0.2)'
                    : 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    background: isDarkMode
                      ? 'rgba(139, 92, 246, 0.35)'
                      : 'rgba(255, 255, 255, 0.25)',
                    transform: 'translateY(-2px)',
                    boxShadow: isDarkMode
                      ? '0 6px 20px rgba(139, 92, 246, 0.5)'
                      : '0 4px 12px rgba(0, 0, 0, 0.15)',
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
                  background: isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    background: isDarkMode ? 'rgba(139, 92, 246, 0.35)' : 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-2px)',
                    boxShadow: isDarkMode ? '0 4px 16px rgba(139, 92, 246, 0.4)' : 'none',
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
                  background: isDarkMode 
                    ? 'rgba(139, 92, 246, 0.2)'
                    : 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    background: isDarkMode
                      ? 'rgba(139, 92, 246, 0.35)'
                      : 'rgba(255, 255, 255, 0.25)',
                    transform: 'translateY(-2px)',
                    boxShadow: isDarkMode
                      ? '0 6px 20px rgba(139, 92, 246, 0.5)'
                      : '0 4px 12px rgba(0, 0, 0, 0.15)',
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
                  background: isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    background: isDarkMode ? 'rgba(139, 92, 246, 0.35)' : 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-2px)',
                    boxShadow: isDarkMode ? '0 4px 16px rgba(139, 92, 246, 0.4)' : 'none',
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
                  background: isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    background: isDarkMode ? 'rgba(139, 92, 246, 0.35)' : 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-2px)',
                    boxShadow: isDarkMode ? '0 4px 16px rgba(139, 92, 246, 0.4)' : 'none',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Keyboard />
              </IconButton>
            </Tooltip>

            <Box sx={{ 
              width: 1, 
              height: 32, 
              background: isDarkMode 
                ? 'linear-gradient(180deg, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)'
                : 'rgba(255, 255, 255, 0.2)', 
              mx: 1,
              borderRadius: 1,
            }} />

            <Tooltip title="Toggle Dark Mode" arrow>
              <IconButton 
                color="inherit" 
                onClick={toggleDarkMode}
                sx={{
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)'
                    : 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    background: isDarkMode
                      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(236, 72, 153, 0.5) 100%)'
                      : 'rgba(255, 255, 255, 0.3)',
                    transform: 'rotate(180deg) scale(1.1)',
                    boxShadow: isDarkMode ? '0 4px 20px rgba(139, 92, 246, 0.6)' : 'none',
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
