import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Fab,
  Zoom,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';

interface PresentationModeProps {
  content: string;
  onClose: () => void;
  initialDarkMode?: boolean;
}

const PresentationMode: React.FC<PresentationModeProps> = ({
  content,
  onClose,
  initialDarkMode = false
}) => {
  const [fontSize, setFontSize] = useState(16);
  const [darkMode, setDarkMode] = useState(initialDarkMode);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(-1);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle Escape key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Track current paragraph for focus mode
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const paragraphs = contentRef.current.querySelectorAll('.presentation-paragraph');
      const viewportCenter = window.innerHeight / 2;

      let closestIndex = -1;
      let closestDistance = Infinity;

      paragraphs.forEach((para, index) => {
        const rect = para.getBoundingClientRect();
        const paraCenter = rect.top + rect.height / 2;
        const distance = Math.abs(paraCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setCurrentParagraphIndex(closestIndex);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [content]);

  const handleZoomIn = () => {
    setFontSize(prev => Math.min(prev + 2, 32));
  };

  const handleZoomOut = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Split content into paragraphs
  const paragraphs = content.split('\n').filter(line => line.trim());

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5',
        color: darkMode ? '#e0e0e0' : '#333',
        overflow: 'auto',
        transition: 'background-color 0.3s, color 0.3s'
      }}
    >
      {/* Control Bar */}
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 10000,
          display: 'flex',
          gap: 1
        }}
      >
        <Zoom in>
          <Paper
            elevation={3}
            sx={{
              display: 'flex',
              gap: 1,
              p: 1,
              backgroundColor: darkMode ? '#333' : '#fff',
              borderRadius: 2
            }}
          >
            <IconButton
              size="small"
              onClick={handleZoomOut}
              aria-label="Decrease font size"
              sx={{ color: darkMode ? '#fff' : 'inherit' }}
            >
              <ZoomOutIcon />
            </IconButton>
            
            <IconButton
              size="small"
              onClick={handleZoomIn}
              aria-label="Increase font size"
              sx={{ color: darkMode ? '#fff' : 'inherit' }}
            >
              <ZoomInIcon />
            </IconButton>

            <IconButton
              size="small"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              sx={{ color: darkMode ? '#fff' : 'inherit' }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <IconButton
              size="small"
              onClick={onClose}
              aria-label="Exit presentation mode"
              sx={{ color: darkMode ? '#fff' : 'inherit' }}
            >
              <CloseIcon />
            </IconButton>
          </Paper>
        </Zoom>
      </Box>

      {/* Content */}
      <Box
        ref={contentRef}
        sx={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '80px 60px',
          minHeight: '100vh'
        }}
      >
        {paragraphs.map((paragraph, index) => {
          const isHeading = paragraph.trim().startsWith('#');
          const isCurrent = index === currentParagraphIndex;
          
          let headingLevel = 1;
          let text = paragraph;
          
          if (isHeading) {
            const match = paragraph.match(/^(#+)\s*(.+)$/);
            if (match) {
              headingLevel = match[1].length;
              text = match[2];
            }
          }

          return (
            <Box
              key={index}
              className="presentation-paragraph"
              sx={{
                mb: isHeading ? 3 : 2,
                opacity: isCurrent ? 1 : 0.6,
                transition: 'opacity 0.3s ease',
                '&:hover': {
                  opacity: 1
                }
              }}
            >
              {isHeading ? (
                <Typography
                  variant={`h${Math.min(headingLevel + 2, 6)}` as any}
                  sx={{
                    fontWeight: 'bold',
                    fontSize: `${fontSize + (6 - headingLevel) * 4}px`,
                    lineHeight: 1.4,
                    marginBottom: 2
                  }}
                >
                  {text}
                </Typography>
              ) : (
                <Typography
                  sx={{
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.8,
                    textAlign: 'justify',
                    fontFamily: '"Georgia", "Times New Roman", serif'
                  }}
                >
                  {paragraph}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Scroll to Top Button */}
      <Zoom in={currentParagraphIndex > 5}>
        <Fab
          size="small"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: darkMode ? '#444' : '#fff',
            color: darkMode ? '#fff' : 'inherit',
            '&:hover': {
              backgroundColor: darkMode ? '#555' : '#f5f5f5'
            }
          }}
          aria-label="Scroll to top"
        >
          ↑
        </Fab>
      </Zoom>
    </Box>
  );
};

export default PresentationMode;
