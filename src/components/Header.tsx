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
  Upload,
  Download,
  Description,
  Search,
  Slideshow,
  Keyboard,
  SmartToy,
} from '@mui/icons-material';
import { useDocument } from '../context/DocumentContext';
import FileUploadDialog from './FileUploadDialog';
import ExportDialog from './ExportDialog';
import SearchReplaceDialog from './SearchReplaceDialog';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';

interface HeaderProps {
  onToggleAIChat?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleAIChat }) => {
  const { togglePresentationMode, content, setContent } = useDocument();
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
          background: 'linear-gradient(135deg, #1a1a24 0%, #2d1b4e 100%)',
          borderBottom: '2px solid',
          borderColor: 'rgba(139, 92, 246, 0.3)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.2)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, #8b5cf6 50%, transparent 100%)',
            opacity: 0.6,
          },
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
              background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #f0abfc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(139, 92, 246, 0.5)',
              filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.3))',
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
                  background: 'rgba(139, 92, 246, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: 'rgba(139, 92, 246, 0.4)',
                  '&:hover': {
                    background: 'rgba(139, 92, 246, 0.35)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.5)',
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
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid',
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  '&:hover': {
                    background: 'rgba(139, 92, 246, 0.35)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
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
                  background: 'rgba(139, 92, 246, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: 'rgba(139, 92, 246, 0.4)',
                  '&:hover': {
                    background: 'rgba(139, 92, 246, 0.35)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.5)',
                  },
                  transition: 'all 0.2s ease-in-out',
                  borderRadius: 2,
                }}
              >
                Export
              </Button>
            </Tooltip>

            <Tooltip title="AI Assistant" arrow>
              <IconButton 
                color="inherit" 
                onClick={onToggleAIChat}
                sx={{
                  background: 'rgba(236, 72, 153, 0.2)',
                  border: '1px solid',
                  borderColor: 'rgba(236, 72, 153, 0.3)',
                  '&:hover': {
                    background: 'rgba(236, 72, 153, 0.35)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 16px rgba(236, 72, 153, 0.4)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <SmartToy />
              </IconButton>
            </Tooltip>

            <Tooltip title="Presentation Mode (F11)" arrow>
              <IconButton 
                color="inherit" 
                onClick={togglePresentationMode}
                sx={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid',
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  '&:hover': {
                    background: 'rgba(139, 92, 246, 0.35)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
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
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid',
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  '&:hover': {
                    background: 'rgba(139, 92, 246, 0.35)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Keyboard />
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
