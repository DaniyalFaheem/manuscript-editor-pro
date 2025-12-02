import { Box, Typography, Grid, Card, CardContent, Button, Container } from '@mui/material';
import {
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Psychology as AIIcon,
  CloudUpload as UploadIcon,
  Assessment as AssessmentIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: <AIIcon sx={{ fontSize: 48 }} />,
    title: 'AI-Powered Detection',
    description: 'Advanced CNN models including EfficientNet and XceptionNet for accurate deepfake detection.',
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 48 }} />,
    title: 'Fast Analysis',
    description: 'Process images in seconds and videos frame-by-frame with real-time progress tracking.',
  },
  {
    icon: <AssessmentIcon sx={{ fontSize: 48 }} />,
    title: 'Detailed Reports',
    description: 'Comprehensive analysis with heatmaps, confidence scores, and downloadable reports.',
  },
  {
    icon: <ShieldIcon sx={{ fontSize: 48 }} />,
    title: 'Privacy First',
    description: 'Your files are processed securely and automatically deleted after analysis.',
  },
];

const stats = [
  { value: '96%', label: 'Detection Accuracy' },
  { value: '<5s', label: 'Average Processing' },
  { value: '4+', label: 'Detection Models' },
  { value: '100%', label: 'Privacy Protected' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
        }}
      >
        <SecurityIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h2" component="h1" gutterBottom fontWeight={700}>
          Deepfake Detector
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
        >
          Protect yourself from manipulated media. Analyze images and videos for AI-generated content with our advanced detection system.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<UploadIcon />}
          onClick={() => navigate('/analyze')}
          sx={{ px: 4, py: 1.5 }}
        >
          Start Analysis
        </Button>
      </Box>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 8 }}>
        {stats.map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Card
              sx={{
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <CardContent>
                <Typography variant="h3" fontWeight={700}>
                  {stat.value}
                </Typography>
                <Typography variant="body2">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Features Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" textAlign="center" gutterBottom fontWeight={600}>
          How It Works
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
        >
          Our multi-model ensemble approach combines state-of-the-art neural networks
          to detect various forms of media manipulation.
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA Section */}
      <Card
        sx={{
          textAlign: 'center',
          p: 6,
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          color: 'white',
          mb: 4,
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Ready to Verify Your Media?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
          Upload an image or video now and get instant analysis results.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={() => navigate('/analyze')}
        >
          Analyze Now
        </Button>
      </Card>

      {/* Supported Formats */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Supported formats: JPEG, PNG, WEBP, GIF, MP4, AVI, MOV, MKV, WEBM
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Maximum file size: 100MB
        </Typography>
      </Box>
    </Container>
  );
}
