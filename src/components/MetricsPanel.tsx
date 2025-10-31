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
      elevation={2}
      sx={{
        height: '100%',
        overflow: 'auto',
        p: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Document Metrics
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Word Count Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TextFields sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle2">Word Statistics</Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Words
            </Typography>
            <Typography variant="h5">{metrics.wordCount}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Characters
            </Typography>
            <Typography variant="h5">{metrics.characterCount}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Sentences
            </Typography>
            <Typography variant="h5">{metrics.sentenceCount}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Paragraphs
            </Typography>
            <Typography variant="h5">{metrics.paragraphCount}</Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Readability Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Assessment sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle2">Readability Scores</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Flesch Reading Ease
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={metrics.fleschReadingEase}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: 'grey.300',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getReadabilityColor(metrics.fleschReadingEase),
                  },
                }}
              />
            </Box>
            <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 40 }}>
              {metrics.fleschReadingEase.toFixed(1)}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {getReadabilityLabel(metrics.fleschReadingEase)}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Grade Level (Flesch-Kincaid)
          </Typography>
          <Typography variant="h6">
            {metrics.fleschKincaidGrade.toFixed(1)}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Gunning Fog Index
          </Typography>
          <Typography variant="h6">
            {metrics.gunningFog.toFixed(1)}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Complex Words
          </Typography>
          <Typography variant="h6">
            {metrics.complexWordCount}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Writing Quality Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Spellcheck sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle2">Writing Quality</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Passive Voice
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(metrics.passiveVoicePercentage, 100)}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: 'grey.300',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getPassiveVoiceColor(metrics.passiveVoicePercentage),
                  },
                }}
              />
            </Box>
            <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 50 }}>
              {metrics.passiveVoicePercentage.toFixed(1)}%
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {metrics.passiveVoicePercentage <= 10 ? 'Good' : metrics.passiveVoicePercentage <= 20 ? 'Acceptable' : 'Too High'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            Avg. Words per Sentence
          </Typography>
          <Typography variant="h6">
            {metrics.averageWordsPerSentence.toFixed(1)}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Tips Section */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Article sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle2">Tips</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          • Aim for Flesch Reading Ease score above 60
          <br />
          • Keep passive voice below 10%
          <br />
          • Target 15-20 words per sentence
          <br />
          • Minimize complex words
        </Typography>
      </Box>
    </Paper>
  );
};

export default MetricsPanel;
