/**
 * Quality Dashboard Component
 * Displays document quality metrics
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { metricsCalculator } from '../../lib/ai/analysis/metrics';
import type { QualityMetrics } from '../../lib/ai/providers/types';

interface QualityDashboardProps {
  content: string;
}

const QualityDashboard: React.FC<QualityDashboardProps> = ({ content }) => {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (content) {
      calculateMetrics();
    }
  }, [content]);

  const calculateMetrics = async () => {
    setLoading(true);
    try {
      const result = await metricsCalculator.calculateMetrics(content);
      setMetrics(result);
    } catch (error) {
      console.error('Metrics calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'warning.main';
    return 'error.main';
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Quality Metrics
        </Typography>
        <LinearProgress />
      </Paper>
    );
  }

  if (!metrics) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Quality Metrics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start writing to see quality metrics
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Quality Metrics
      </Typography>

      {/* Overall Score */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Overall Quality</Typography>
          <Typography variant="body2" fontWeight="bold">
            {metrics.overallScore}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={metrics.overallScore}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              bgcolor: getScoreColor(metrics.overallScore),
            },
          }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Individual Metrics */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Grammar Accuracy</Typography>
            <Typography variant="body2">{metrics.grammarAccuracy}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={metrics.grammarAccuracy}
            sx={{ height: 4, borderRadius: 2 }}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Style Consistency</Typography>
            <Typography variant="body2">{metrics.styleConsistency}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={metrics.styleConsistency}
            sx={{ height: 4, borderRadius: 2 }}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Citation Completeness</Typography>
            <Typography variant="body2">{metrics.citationCompleteness}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={metrics.citationCompleteness}
            sx={{ height: 4, borderRadius: 2 }}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Chip label={`${metrics.wordCount} words`} size="small" />
        <Chip label={`Grade ${metrics.readabilityGrade}`} size="small" />
      </Box>

      {/* Improvements */}
      {metrics.improvements.length > 0 && (
        <>
          <Typography variant="subtitle2" gutterBottom>
            Suggestions
          </Typography>
          <List dense>
            {metrics.improvements.map((improvement, idx) => (
              <ListItem key={idx} disableGutters>
                <ListItemText
                  primary={improvement}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
};

export default QualityDashboard;
