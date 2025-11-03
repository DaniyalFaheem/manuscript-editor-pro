/**
 * AI Status Indicator Component
 * Shows the current status of AI providers
 */

import React, { useState, useEffect } from 'react';
import { Chip, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { getAIOrchestrator } from '../../lib/ai';
import { AIProviderStatus } from '../../lib/ai/providers/types';

const AIStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<AIProviderStatus>(AIProviderStatus.LOADING);
  const [providerName, setProviderName] = useState<string>('');

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
      } else {
        setStatus(AIProviderStatus.UNAVAILABLE);
        setProviderName('No provider');
      }
    } catch (error) {
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
          label: 'Loading',
          color: 'warning' as const,
          icon: <HourglassEmptyIcon fontSize="small" />,
          tooltip: 'AI is initializing...',
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

  return (
    <Tooltip title={config.tooltip}>
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
