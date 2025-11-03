/**
 * AI Status Indicator Component
 * Shows the current status of AI providers with progress information
 */

import React, { useState, useEffect } from 'react';
import { Chip, Tooltip, LinearProgress, Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { getAIOrchestrator } from '../../lib/ai';
import { AIProviderStatus } from '../../lib/ai/providers/types';
import { WebLLMProvider } from '../../lib/ai/providers/webllm';

interface ProgressInfo {
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
}

const AIStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<AIProviderStatus>(AIProviderStatus.LOADING);
  const [providerName, setProviderName] = useState<string>('');
  const [progressInfo, setProgressInfo] = useState<ProgressInfo | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const orchestrator = getAIOrchestrator();
      const provider = await orchestrator.getBestProvider();
      
      if (provider) {
        const info = await provider.getInfo();
        setStatus(info.status);
        setProviderName(info.name);

        // Subscribe to progress updates if it's WebLLM
        if (provider instanceof WebLLMProvider && info.status === AIProviderStatus.LOADING) {
          provider.onInitializationProgress((progress) => {
            setProgressInfo({
              progress: progress.progress,
              message: progress.message,
              estimatedTimeRemaining: progress.estimatedTimeRemaining,
            });
          });
        }
      } else {
        setStatus(AIProviderStatus.UNAVAILABLE);
        setProviderName('No provider');
      }
    } catch {
      setStatus(AIProviderStatus.ERROR);
      setProviderName('Error');
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case AIProviderStatus.AVAILABLE:
        return {
          label: providerName,
          color: 'success' as const,
          icon: <CheckCircleIcon fontSize="small" />,
          tooltip: `AI is ready (${providerName})`,
        };
      case AIProviderStatus.LOADING:
        return {
          label: progressInfo 
            ? `${Math.round(progressInfo.progress * 100)}%`
            : 'Loading',
          color: 'warning' as const,
          icon: <HourglassEmptyIcon fontSize="small" />,
          tooltip: progressInfo?.message || 'AI is initializing...',
        };
      case AIProviderStatus.UNAVAILABLE:
        return {
          label: 'Offline',
          color: 'default' as const,
          icon: <ErrorIcon fontSize="small" />,
          tooltip: 'AI is not available. Install Ollama for full functionality.',
        };
      case AIProviderStatus.ERROR:
        return {
          label: 'Error',
          color: 'error' as const,
          icon: <ErrorIcon fontSize="small" />,
          tooltip: 'AI encountered an error',
        };
    }
  };

  const config = getStatusConfig();

  const tooltipContent = (
    <Box>
      <Typography variant="body2">{config.tooltip}</Typography>
      {status === AIProviderStatus.LOADING && progressInfo && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progressInfo.progress * 100}
            sx={{ mb: 0.5 }}
          />
          {progressInfo.estimatedTimeRemaining !== undefined && (
            <Typography variant="caption">
              ~{progressInfo.estimatedTimeRemaining}s remaining
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );

  return (
    <Tooltip title={tooltipContent}>
      <Chip
        label={config.label}
        size="small"
        color={config.color}
        icon={config.icon}
        sx={{ cursor: 'pointer' }}
        onClick={checkStatus}
      />
    </Tooltip>
  );
};

export default AIStatusIndicator;
