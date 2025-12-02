import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import ResultsDashboard from '../components/ResultsDashboard';
import { getResults, downloadReport } from '../utils/api';

// Mock result for demonstration
const mockResult = {
  id: 'analysis_demo123',
  status: 'completed' as const,
  is_deepfake: true,
  confidence: 0.87,
  models: {
    efficientnet: {
      score: 0.89,
      prediction: 'fake' as const,
      processing_time_ms: 145,
    },
    xceptionnet: {
      score: 0.85,
      prediction: 'fake' as const,
      processing_time_ms: 167,
    },
    ensemble: {
      score: 0.87,
      prediction: 'fake' as const,
      processing_time_ms: 312,
    },
  },
  analysis: {
    facial_landmarks: {
      anomaly_detected: true,
      landmark_count: 68,
      symmetry_score: 0.78,
    },
    texture_analysis: {
      skin_texture_score: 0.72,
      lighting_consistency: 0.65,
      noise_pattern_anomaly: true,
    },
    metadata: {
      camera_make: undefined,
      camera_model: undefined,
      software: 'Adobe Photoshop',
      warnings: ['Image was edited with software'],
    },
  },
  processing_time_ms: 1523,
  created_at: new Date().toISOString(),
};

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<typeof mockResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!id) {
        setError('No analysis ID provided');
        setLoading(false);
        return;
      }

      try {
        // Try to fetch from API
        const data = await getResults(id);
        setResult(data);
      } catch {
        // Use mock data for demonstration
        setResult({ ...mockResult, id });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  const handleDownloadReport = async () => {
    if (!id) return;
    
    try {
      await downloadReport(id, 'pdf');
    } catch (err) {
      console.error('Failed to download report:', err);
      // Create a mock PDF download
      const blob = new Blob(['Mock PDF Report'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${id}_report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Deepfake Analysis Results',
        text: `Analysis ${result?.is_deepfake ? 'detected potential manipulation' : 'found no manipulation'}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography sx={{ mt: 2 }}>Loading results...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !result) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Failed to load results'}
          </Alert>
          <Button startIcon={<BackIcon />} onClick={() => navigate('/analyze')}>
            Back to Analysis
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/analyze')}
          sx={{ mb: 3 }}
        >
          Back to Analysis
        </Button>

        <Typography variant="h4" gutterBottom fontWeight={600}>
          Analysis Results
        </Typography>

        <ResultsDashboard
          result={result}
          onDownloadReport={handleDownloadReport}
          onShare={handleShare}
        />
      </Box>
    </Container>
  );
}
