/**
 * AI Settings Panel Component
 * Configuration options for AI features
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Switch,
  Divider,
  Button,
} from '@mui/material';
import { getAIOrchestrator } from '../../lib/ai';
import type { AIConfig } from '../../lib/ai/providers/types';

interface SettingsPanelProps {
  onClose?: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [config, setConfig] = useState<AIConfig>({
    preferredProvider: 'auto',
    ollamaUrl: 'http://localhost:11434',
    selectedModel: 'llama3.2',
    enableRealtime: true,
    enablePrivacyMode: true,
    grammarStrictness: 'normal',
    citationStyle: 'APA',
  });

  useEffect(() => {
    // Load current config
    const orchestrator = getAIOrchestrator();
    setConfig(orchestrator.getConfig());
  }, []);

  const handleConfigChange = (key: keyof AIConfig, value: unknown) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    
    // Update orchestrator
    const orchestrator = getAIOrchestrator();
    orchestrator.updateConfig(newConfig);
    
    // Save to localStorage
    localStorage.setItem('ai-config', JSON.stringify(newConfig));
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        AI Settings
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
        {/* Provider Selection */}
        <FormControl component="fieldset">
          <FormLabel component="legend">AI Provider</FormLabel>
          <RadioGroup
            value={config.preferredProvider}
            onChange={(e) => handleConfigChange('preferredProvider', e.target.value)}
          >
            <FormControlLabel value="auto" control={<Radio />} label="Auto (recommended)" />
            <FormControlLabel value="ollama" control={<Radio />} label="Ollama (local)" />
            <FormControlLabel value="webllm" control={<Radio />} label="WebLLM (browser)" />
            <FormControlLabel value="transformers" control={<Radio />} label="Transformers.js" />
          </RadioGroup>
        </FormControl>

        <Divider />

        {/* Model Selection */}
        <FormControl fullWidth>
          <FormLabel>Model</FormLabel>
          <Select
            value={config.selectedModel}
            onChange={(e) => handleConfigChange('selectedModel', e.target.value)}
            size="small"
          >
            <MenuItem value="llama3.2">Llama 3.2 (3B - Fast)</MenuItem>
            <MenuItem value="mistral">Mistral (7B - Balanced)</MenuItem>
            <MenuItem value="phi3">Phi-3 (3.8B - Efficient)</MenuItem>
          </Select>
        </FormControl>

        <Divider />

        {/* Citation Style */}
        <FormControl fullWidth>
          <FormLabel>Citation Style</FormLabel>
          <Select
            value={config.citationStyle}
            onChange={(e) => handleConfigChange('citationStyle', e.target.value)}
            size="small"
          >
            <MenuItem value="APA">APA 7th Edition</MenuItem>
            <MenuItem value="MLA">MLA 9th Edition</MenuItem>
            <MenuItem value="Chicago">Chicago 17th Edition</MenuItem>
            <MenuItem value="IEEE">IEEE</MenuItem>
            <MenuItem value="Harvard">Harvard</MenuItem>
          </Select>
        </FormControl>

        {/* Grammar Strictness */}
        <FormControl fullWidth>
          <FormLabel>Grammar Strictness</FormLabel>
          <Select
            value={config.grammarStrictness}
            onChange={(e) => handleConfigChange('grammarStrictness', e.target.value)}
            size="small"
          >
            <MenuItem value="lenient">Lenient (Faster, fewer suggestions)</MenuItem>
            <MenuItem value="normal">Normal (Balanced)</MenuItem>
            <MenuItem value="strict">Strict (More thorough, slower)</MenuItem>
          </Select>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Higher strictness provides more detailed analysis but may take longer
          </Typography>
        </FormControl>

        <Divider />

        {/* Performance Options */}
        <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Performance Settings
          </Typography>
          
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={config.enableRealtime}
                  onChange={(e) => handleConfigChange('enableRealtime', e.target.checked)}
                />
              }
              label="Enable real-time checking"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Analyzes text as you type (may impact performance on slower devices)
            </Typography>
          </Box>

          <Box sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.enablePrivacyMode}
                  onChange={(e) => handleConfigChange('enablePrivacyMode', e.target.checked)}
                />
              }
              label="Privacy mode (all local processing)"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              All processing happens locally - no data sent to external servers
            </Typography>
          </Box>
        </Box>

        {/* Performance Tips */}
        <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom color="info.dark">
            💡 Performance Tips
          </Typography>
          <Typography variant="caption" color="info.dark" component="div">
            • Use "Lenient" strictness for faster analysis on large documents
            <br />
            • Disable real-time checking if experiencing lag
            <br />
            • Ollama provides the best performance for local AI
            <br />
            • WebLLM requires a modern GPU (Chrome 113+)
          </Typography>
        </Box>

        {onClose && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" onClick={onClose}>
              Done
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default SettingsPanel;
