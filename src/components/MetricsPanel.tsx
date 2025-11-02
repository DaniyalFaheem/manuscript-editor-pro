import React from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  TextFields,
  Article,
  Spellcheck,
  Assessment,
} from '@mui/icons-material';
import { useDocument } from '../context/DocumentContext';

const MetricsPanel: React.FC = () => {
  const { metrics } = useDocument();

  const getReadabilityColor = (score: number): string => {
    if (score >= 60) return 'success.main';
    if (score >= 30) return 'warning.main';
    return 'error.main';
  };

  const getReadabilityLabel = (score: number): string => {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  };

  const getPassiveVoiceColor = (percentage: number): string => {
    if (percentage <= 10) return 'success.main';
    if (percentage <= 20) return 'warning.main';
    return 'error.main';
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        overflow: 'auto',
        p: 2.5,
        background: (theme) => theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
        border: '1px solid',
        borderColor: (theme) => theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(99, 102, 241, 0.1)',
        boxShadow: (theme) => theme.palette.mode === 'dark'
          ? '0 8px 32px rgba(0, 0, 0, 0.3)'
          : '0 8px 32px rgba(99, 102, 241, 0.1)',
        borderRadius: 3,
        backdropFilter: 'blur(10px)',
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{
          fontWeight: 700,
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)'
            : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.01em',
          mb: 2,
        }}
      >
        Document Metrics
      </Typography>

      <Divider sx={{ 
        my: 2,
        borderColor: (theme) => theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(99, 102, 241, 0.1)',
      }} />

      {/* Word Count Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <TextFields sx={{ 
            mr: 1, 
            color: 'primary.main',
            fontSize: 20,
          }} />
          <Typography 
            variant="subtitle2"
            sx={{ fontWeight: 600, letterSpacing: '0.01em' }}
          >
            Word Statistics
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            background: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(99, 102, 241, 0.1)'
              : 'rgba(99, 102, 241, 0.05)',
            border: '1px solid',
            borderColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(99, 102, 241, 0.2)'
              : 'rgba(99, 102, 241, 0.1)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
            },
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
              Words
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {metrics.wordCount}
            </Typography>
          </Box>
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            background: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(245, 158, 11, 0.1)'
              : 'rgba(245, 158, 11, 0.05)',
            border: '1px solid',
            borderColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(245, 158, 11, 0.2)'
              : 'rgba(245, 158, 11, 0.1)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
            },
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
              Characters
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.main' }}>
              {metrics.characterCount}
            </Typography>
          </Box>
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            background: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(16, 185, 129, 0.1)'
              : 'rgba(16, 185, 129, 0.05)',
            border: '1px solid',
            borderColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(16, 185, 129, 0.2)'
              : 'rgba(16, 185, 129, 0.1)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
            },
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
              Sentences
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
              {metrics.sentenceCount}
            </Typography>
          </Box>
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            background: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(59, 130, 246, 0.1)'
              : 'rgba(59, 130, 246, 0.05)',
            border: '1px solid',
            borderColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(59, 130, 246, 0.2)'
              : 'rgba(59, 130, 246, 0.1)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
            },
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
              Paragraphs
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>
              {metrics.paragraphCount}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Readability Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Assessment sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle2">Readability</Typography>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Flesch Score
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={metrics.fleschReadingEase}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  bgcolor: 'grey.300',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getReadabilityColor(metrics.fleschReadingEase),
                  },
                }}
              />
            </Box>
            <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 40 }}>
              {metrics.fleschReadingEase.toFixed(0)}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {getReadabilityLabel(metrics.fleschReadingEase)}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Grade Level
            </Typography>
            <Typography variant="h6">
              {metrics.fleschKincaidGrade.toFixed(1)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Complex Words
            </Typography>
            <Typography variant="h6">
              {metrics.complexWordCount}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Writing Quality Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Spellcheck sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle2">Quality</Typography>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Passive Voice
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(metrics.passiveVoicePercentage, 100)}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  bgcolor: 'grey.300',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getPassiveVoiceColor(metrics.passiveVoicePercentage),
                  },
                }}
              />
            </Box>
            <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 45 }}>
              {metrics.passiveVoicePercentage.toFixed(0)}%
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {metrics.passiveVoicePercentage <= 10 ? 'Good' : metrics.passiveVoicePercentage <= 20 ? 'OK' : 'High'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            Avg Words/Sentence
          </Typography>
          <Typography variant="h6">
            {metrics.averageWordsPerSentence.toFixed(0)}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Tips Section - Compact */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Article sx={{ mr: 1, color: 'primary.main', fontSize: '1rem' }} />
          <Typography variant="subtitle2">Tips</Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
          • Flesch score &gt; 60
          <br />
          • Passive voice &lt; 10%
          <br />
          • 15-20 words/sentence
        </Typography>
      </Box>
    </Paper>
  );
};

export default MetricsPanel;
