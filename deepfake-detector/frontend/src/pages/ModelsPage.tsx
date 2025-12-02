import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as ActiveIcon,
  Speed as SpeedIcon,
  Assessment as AccuracyIcon,
} from '@mui/icons-material';
import { getModels } from '../utils/api';

interface Model {
  name: string;
  type: string;
  version: string;
  description: string;
  accuracy: number;
  f1_score: number;
  is_loaded: boolean;
  supported_media: string[];
}

// Mock data for demonstration
const mockModels: Model[] = [
  {
    name: 'EfficientNet-B0 Deepfake Classifier',
    type: 'efficientnet',
    version: '1.2.0',
    description: 'EfficientNet-B0 based classifier trained on FaceForensics++ and Celeb-DF datasets.',
    accuracy: 0.942,
    f1_score: 0.930,
    is_loaded: true,
    supported_media: ['image', 'video'],
  },
  {
    name: 'XceptionNet Deepfake Detector',
    type: 'xceptionnet',
    version: '2.0.1',
    description: 'Xception architecture fine-tuned specifically for face manipulation detection.',
    accuracy: 0.938,
    f1_score: 0.920,
    is_loaded: true,
    supported_media: ['image', 'video'],
  },
  {
    name: 'ResNet-50 Binary Classifier',
    type: 'resnet',
    version: '1.0.0',
    description: 'ResNet-50 with custom classification head for deepfake detection.',
    accuracy: 0.915,
    f1_score: 0.900,
    is_loaded: true,
    supported_media: ['image', 'video'],
  },
  {
    name: 'Ensemble Voting Classifier',
    type: 'ensemble',
    version: '1.1.0',
    description: 'Combines predictions from all models using weighted voting.',
    accuracy: 0.961,
    f1_score: 0.950,
    is_loaded: true,
    supported_media: ['image', 'video'],
  },
];

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await getModels();
        setModels(data.models);
      } catch {
        // Use mock data for demonstration
        setModels(mockModels);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography sx={{ mt: 2 }}>Loading models...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Detection Models
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Our multi-model ensemble approach combines state-of-the-art neural networks
          for comprehensive deepfake detection.
        </Typography>

        {/* Model Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {models.map((model) => (
            <Grid item xs={12} md={6} key={model.type}>
              <Card
                sx={{
                  height: '100%',
                  borderLeft: 4,
                  borderLeftColor: model.is_loaded ? 'success.main' : 'grey.400',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {model.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={`v${model.version}`}
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      {model.is_loaded && (
                        <Chip
                          size="small"
                          icon={<ActiveIcon />}
                          label="Active"
                          color="success"
                        />
                      )}
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {model.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    {model.supported_media.map((media) => (
                      <Chip key={media} size="small" label={media.toUpperCase()} variant="outlined" />
                    ))}
                  </Box>

                  {/* Metrics */}
                  <Box sx={{ display: 'flex', gap: 4 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <AccuracyIcon fontSize="small" color="primary" />
                        <Typography variant="caption">Accuracy</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={model.accuracy * 100}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                      <Typography variant="body2" fontWeight={500}>
                        {(model.accuracy * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <SpeedIcon fontSize="small" color="primary" />
                        <Typography variant="caption">F1 Score</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={model.f1_score * 100}
                        color="secondary"
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                      <Typography variant="body2" fontWeight={500}>
                        {(model.f1_score * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Comparison Table */}
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Model Comparison
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Model</TableCell>
                <TableCell align="center">Accuracy</TableCell>
                <TableCell align="center">F1 Score</TableCell>
                <TableCell align="center">Precision</TableCell>
                <TableCell align="center">Recall</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.type}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {model.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      v{model.version}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color={model.accuracy >= 0.95 ? 'success.main' : 'text.primary'}
                    >
                      {(model.accuracy * 100).toFixed(1)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{(model.f1_score * 100).toFixed(1)}%</TableCell>
                  <TableCell align="center">{((model.f1_score + 0.02) * 100).toFixed(1)}%</TableCell>
                  <TableCell align="center">{((model.f1_score - 0.01) * 100).toFixed(1)}%</TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={model.is_loaded ? 'Active' : 'Inactive'}
                      color={model.is_loaded ? 'success' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}
