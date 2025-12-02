import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton,
  Button,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

interface ModelResult {
  score: number;
  prediction: 'real' | 'fake' | 'uncertain';
  processing_time_ms: number;
}

interface AnalysisResult {
  id: string;
  status: 'completed' | 'processing' | 'failed';
  is_deepfake: boolean;
  confidence: number;
  models: Record<string, ModelResult>;
  analysis?: {
    facial_landmarks?: {
      anomaly_detected: boolean;
      landmark_count: number;
      symmetry_score: number;
    };
    texture_analysis?: {
      skin_texture_score: number;
      lighting_consistency: number;
      noise_pattern_anomaly: boolean;
    };
    metadata?: {
      camera_make?: string;
      camera_model?: string;
      software?: string;
      warnings: string[];
    };
  };
  processing_time_ms: number;
  created_at: string;
}

interface ResultsDashboardProps {
  result: AnalysisResult;
  onDownloadReport: () => void;
  onShare: () => void;
}

export default function ResultsDashboard({
  result,
  onDownloadReport,
  onShare,
}: ResultsDashboardProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'error';
    if (confidence >= 0.5) return 'warning';
    return 'success';
  };

  const getPredictionChip = (prediction: string, score: number) => {
    const isFake = prediction === 'fake';
    return (
      <Chip
        icon={isFake ? <ErrorIcon /> : <CheckCircleIcon />}
        label={`${prediction.toUpperCase()} (${(score * 100).toFixed(1)}%)`}
        color={isFake ? 'error' : 'success'}
        size="small"
      />
    );
  };

  return (
    <Box>
      {/* Main Result Card */}
      <Card
        sx={{
          mb: 3,
          borderLeft: 6,
          borderLeftColor: result.is_deepfake ? 'error.main' : 'success.main',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {result.is_deepfake ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                    <ErrorIcon fontSize="large" />
                    Potential Deepfake Detected
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                    <CheckCircleIcon fontSize="large" />
                    Content Appears Authentic
                  </Box>
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analysis ID: {result.id}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Download Report">
                <IconButton onClick={onDownloadReport}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share Results">
                <IconButton onClick={onShare}>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Confidence Meter */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Manipulation Confidence</Typography>
              <Typography variant="body2" fontWeight={600}>
                {(result.confidence * 100).toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={result.confidence * 100}
              color={getConfidenceColor(result.confidence)}
              sx={{ height: 10, borderRadius: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Low Risk</Typography>
              <Typography variant="caption" color="text.secondary">High Risk</Typography>
            </Box>
          </Box>

          {/* Processing Info */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`Processing Time: ${result.processing_time_ms.toFixed(0)}ms`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`Models Used: ${Object.keys(result.models).length}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={new Date(result.created_at).toLocaleString()}
              size="small"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Model Results */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Model Analysis Results</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Model</TableCell>
                  <TableCell align="center">Score</TableCell>
                  <TableCell align="center">Prediction</TableCell>
                  <TableCell align="right">Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(result.models).map(([modelName, modelResult]) => (
                  <TableRow key={modelName}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {modelName.charAt(0).toUpperCase() + modelName.slice(1)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={modelResult.score * 100}
                          color={modelResult.score > 0.5 ? 'error' : 'success'}
                          sx={{ width: 80, height: 8, borderRadius: 1 }}
                        />
                        <Typography variant="body2">
                          {(modelResult.score * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {getPredictionChip(modelResult.prediction, modelResult.score)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {modelResult.processing_time_ms.toFixed(0)}ms
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Detailed Analysis */}
      {result.analysis && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Detailed Analysis</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {/* Facial Landmarks */}
              {result.analysis.facial_landmarks && (
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                        Facial Landmarks
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Anomaly:</Typography>
                          <Chip
                            size="small"
                            label={result.analysis.facial_landmarks.anomaly_detected ? 'Detected' : 'None'}
                            color={result.analysis.facial_landmarks.anomaly_detected ? 'warning' : 'success'}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Landmarks:</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {result.analysis.facial_landmarks.landmark_count}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Symmetry:</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {(result.analysis.facial_landmarks.symmetry_score * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Texture Analysis */}
              {result.analysis.texture_analysis && (
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                        Texture Analysis
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Skin Texture:</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {(result.analysis.texture_analysis.skin_texture_score * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Lighting:</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {(result.analysis.texture_analysis.lighting_consistency * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Noise Pattern:</Typography>
                          <Chip
                            size="small"
                            label={result.analysis.texture_analysis.noise_pattern_anomaly ? 'Anomaly' : 'Normal'}
                            color={result.analysis.texture_analysis.noise_pattern_anomaly ? 'warning' : 'success'}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Metadata */}
              {result.analysis.metadata && (
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                        Metadata
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {result.analysis.metadata.camera_make && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Camera:</Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {result.analysis.metadata.camera_make}
                            </Typography>
                          </Box>
                        )}
                        {result.analysis.metadata.software && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Software:</Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {result.analysis.metadata.software}
                            </Typography>
                          </Box>
                        )}
                        {result.analysis.metadata.warnings.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {result.analysis.metadata.warnings.map((warning, index) => (
                              <Box
                                key={index}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  color: 'warning.main',
                                }}
                              >
                                <WarningIcon fontSize="small" />
                                <Typography variant="caption">{warning}</Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={onDownloadReport}
        >
          Download PDF Report
        </Button>
        <Button
          variant="outlined"
          startIcon={<ShareIcon />}
          onClick={onShare}
        >
          Share Results
        </Button>
      </Box>
    </Box>
  );
}
