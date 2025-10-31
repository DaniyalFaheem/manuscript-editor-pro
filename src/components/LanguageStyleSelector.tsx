import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Chip
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Language as LanguageIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import type { LanguageVariant, LanguageAnalysis } from '../services/languageStyleSwitcher';

interface LanguageStyleSelectorProps {
  analysis: LanguageAnalysis | null;
  currentVariant: LanguageVariant;
  onVariantChange: (variant: LanguageVariant) => void;
  onConvert: (targetVariant: LanguageVariant) => void;
}

const LanguageStyleSelector: React.FC<LanguageStyleSelectorProps> = ({
  analysis,
  currentVariant,
  onVariantChange,
  onConvert
}) => {
  const [targetVariant, setTargetVariant] = React.useState<LanguageVariant>(currentVariant);

  const handleVariantChange = (event: SelectChangeEvent<LanguageVariant>) => {
    const newVariant = event.target.value as LanguageVariant;
    setTargetVariant(newVariant);
    onVariantChange(newVariant);
  };

  const handleConvert = () => {
    onConvert(targetVariant);
  };

  const variantLabels: Record<LanguageVariant, string> = {
    US: '🇺🇸 US English',
    UK: '🇬🇧 UK English',
    AU: '🇦🇺 Australian English',
    CA: '🇨🇦 Canadian English'
  };

  const isMixed = analysis?.detectedVariant === 'mixed';
  const hasIssues = (analysis?.issues.length || 0) > 0;

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LanguageIcon />
        <Typography variant="h6">Language Style</Typography>
      </Box>

      {/* Detection Results */}
      {analysis && (
        <Box sx={{ mb: 2 }}>
          {isMixed ? (
            <Alert severity="warning" icon={<WarningIcon />}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Mixed language usage detected
              </Typography>
              <Typography variant="caption">
                Your document contains a mix of language variants. Consider standardizing
                to one variant for consistency.
              </Typography>
            </Alert>
          ) : (
            <Alert severity="success" icon={<CheckCircleIcon />}>
              <Typography variant="body2">
                Detected: {variantLabels[analysis.detectedVariant as LanguageVariant]} (
                {Math.round(analysis.confidence * 100)}% confidence)
              </Typography>
            </Alert>
          )}

          {/* Variant Distribution */}
          {hasIssues && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Variant Distribution:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {Object.entries(analysis.variantCounts).map(([variant, count]) => (
                  count > 0 && (
                    <Chip
                      key={variant}
                      label={`${variant}: ${count}`}
                      size="small"
                      variant="outlined"
                    />
                  )
                ))}
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                Found {analysis.issues.length} word{analysis.issues.length !== 1 ? 's' : ''} that can be converted
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Variant Selector */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Target Variant</InputLabel>
        <Select
          value={targetVariant}
          label="Target Variant"
          onChange={handleVariantChange}
        >
          <MenuItem value="US">{variantLabels.US}</MenuItem>
          <MenuItem value="UK">{variantLabels.UK}</MenuItem>
          <MenuItem value="AU">{variantLabels.AU}</MenuItem>
          <MenuItem value="CA">{variantLabels.CA}</MenuItem>
        </Select>
      </FormControl>

      {/* Convert Button */}
      <Button
        variant="contained"
        fullWidth
        onClick={handleConvert}
        disabled={!hasIssues}
      >
        Convert to {variantLabels[targetVariant]}
      </Button>

      {/* Info */}
      <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Common Conversions:</strong>
          <br />
          • -or/-our: color/colour, honor/honour
          <br />
          • -ize/-ise: analyze/analyse, organize/organise
          <br />
          • -er/-re: center/centre, theater/theatre
          <br />
          • -ense/-ence: defense/defence, license/licence
        </Typography>
      </Box>
    </Paper>
  );
};

export default LanguageStyleSelector;
