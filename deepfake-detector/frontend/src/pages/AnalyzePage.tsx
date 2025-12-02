import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Link as LinkIcon,
  Search as AnalyzeIcon,
  CheckCircle as CompleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import { analyzeImage, analyzeUrl } from '../utils/api';

const steps = ['Select Media', 'Configure Analysis', 'View Results'];

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 24 }}>
      {value === index && children}
    </div>
  );
}

export default function AnalyzePage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles(files);
    setError(null);
    if (files.length > 0) {
      setActiveStep(1);
    }
  }, []);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    setError(null);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    try {
      let result;
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      if (tabValue === 0 && selectedFiles.length > 0) {
        // Analyze uploaded file
        result = await analyzeImage(selectedFiles[0]);
      } else if (tabValue === 1 && url) {
        // Analyze URL
        result = await analyzeUrl(url);
      } else {
        throw new Error('No media selected for analysis');
      }

      clearInterval(progressInterval);
      setProgress(100);
      setAnalysisId(result.id);
      setActiveStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewResults = () => {
    if (analysisId) {
      navigate(`/results/${analysisId}`);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedFiles([]);
    setUrl('');
    setError(null);
    setProgress(0);
    setAnalysisId(null);
  };

  const canAnalyze = tabValue === 0 ? selectedFiles.length > 0 : url.length > 0;

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Analyze Media
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Upload an image or video, or provide a URL to analyze for deepfake manipulation.
        </Typography>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        {activeStep === 0 && (
          <Card>
            <CardContent>
              <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                centered
                sx={{ mb: 2 }}
              >
                <Tab icon={<UploadIcon />} label="Upload File" />
                <Tab icon={<LinkIcon />} label="From URL" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  maxFiles={1}
                  maxSize={100 * 1024 * 1024}
                />
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <TextField
                  fullWidth
                  label="Media URL"
                  placeholder="https://example.com/image.jpg"
                  value={url}
                  onChange={handleUrlChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Enter a direct link to an image or video file"
                />
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    disabled={!url}
                    onClick={() => setActiveStep(1)}
                  >
                    Continue
                  </Button>
                </Box>
              </TabPanel>
            </CardContent>
          </Card>
        )}

        {activeStep === 1 && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              {isAnalyzing ? (
                <>
                  <CircularProgress size={60} sx={{ mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Analyzing Media...
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    This may take a few seconds depending on the file size.
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ maxWidth: 400, mx: 'auto' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {progress}% complete
                  </Typography>
                </>
              ) : (
                <>
                  <AnalyzeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Ready to Analyze
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {tabValue === 0
                      ? `File: ${selectedFiles[0]?.name}`
                      : `URL: ${url}`}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button variant="outlined" onClick={handleReset}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleAnalyze}
                      disabled={!canAnalyze}
                      startIcon={<AnalyzeIcon />}
                    >
                      Start Analysis
                    </Button>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {activeStep === 2 && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <CompleteIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Analysis Complete!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Your media has been analyzed. View the detailed results below.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="outlined" onClick={handleReset}>
                  Analyze Another
                </Button>
                <Button variant="contained" onClick={handleViewResults}>
                  View Results
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
}
