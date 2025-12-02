import { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Grid,
  Slider,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

interface Settings {
  apiKey: string;
  autoDelete: boolean;
  deleteAfterHours: number;
  defaultModels: string[];
  enableNotifications: boolean;
  confidenceThreshold: number;
  includeHeatmap: boolean;
  darkMode: boolean;
}

const defaultSettings: Settings = {
  apiKey: '',
  autoDelete: true,
  deleteAfterHours: 24,
  defaultModels: ['efficientnet', 'xceptionnet', 'ensemble'],
  enableNotifications: true,
  confidenceThreshold: 0.7,
  includeHeatmap: true,
  darkMode: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  const handleChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // In production, save to backend or localStorage
    localStorage.setItem('deepfake-settings', JSON.stringify(settings));
    setSaved(true);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setSaved(false);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Configure your deepfake detection preferences.
        </Typography>

        {saved && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSaved(false)}>
            Settings saved successfully!
          </Alert>
        )}

        {/* API Configuration */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              API Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Configure your API key for authenticated access.
            </Typography>
            <TextField
              fullWidth
              label="API Key"
              type="password"
              value={settings.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="Enter your API key"
              helperText="Your API key for authenticated requests. Leave empty for anonymous access."
            />
          </CardContent>
        </Card>

        {/* Analysis Settings */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Analysis Settings
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Confidence Threshold: {(settings.confidenceThreshold * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={settings.confidenceThreshold}
                  onChange={(_, value) => handleChange('confidenceThreshold', value as number)}
                  min={0.3}
                  max={0.95}
                  step={0.05}
                  marks={[
                    { value: 0.3, label: '30%' },
                    { value: 0.5, label: '50%' },
                    { value: 0.7, label: '70%' },
                    { value: 0.95, label: '95%' },
                  ]}
                />
                <Typography variant="caption" color="text.secondary">
                  Content above this threshold will be flagged as potential deepfake.
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.includeHeatmap}
                      onChange={(e) => handleChange('includeHeatmap', e.target.checked)}
                    />
                  }
                  label="Generate heatmap visualization"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Privacy & Security
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoDelete}
                  onChange={(e) => handleChange('autoDelete', e.target.checked)}
                />
              }
              label="Automatically delete files after analysis"
            />

            {settings.autoDelete && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Delete files after: {settings.deleteAfterHours} hours
                </Typography>
                <Slider
                  value={settings.deleteAfterHours}
                  onChange={(_, value) => handleChange('deleteAfterHours', value as number)}
                  min={1}
                  max={72}
                  marks={[
                    { value: 1, label: '1h' },
                    { value: 24, label: '24h' },
                    { value: 48, label: '48h' },
                    { value: 72, label: '72h' },
                  ]}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableNotifications}
                  onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                />
              }
              label="Enable browser notifications for completed analyses"
            />
          </CardContent>
        </Card>

        <Divider sx={{ my: 3 }} />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
