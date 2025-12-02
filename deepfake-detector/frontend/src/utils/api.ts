import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Analysis API
export interface AnalysisResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  is_deepfake: boolean;
  confidence: number;
  models: Record<string, {
    score: number;
    prediction: 'real' | 'fake' | 'uncertain';
    processing_time_ms: number;
  }>;
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
  heatmap_url?: string;
  report_url?: string;
  processing_time_ms: number;
  created_at: string;
}

export async function analyzeImage(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<AnalysisResult>('/api/v1/analyze/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function analyzeVideo(file: File, frameSampleRate = 10): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('frame_sample_rate', String(frameSampleRate));

  const response = await api.post<AnalysisResult>('/api/v1/analyze/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function analyzeUrl(url: string): Promise<AnalysisResult> {
  const response = await api.post<AnalysisResult>('/api/v1/analyze/url', {
    url,
    include_heatmap: true,
  });

  return response.data;
}

export async function getResults(analysisId: string): Promise<AnalysisResult> {
  const response = await api.get<AnalysisResult>(`/api/v1/results/${analysisId}`);
  return response.data;
}

export async function downloadReport(analysisId: string, format: 'json' | 'pdf' = 'pdf'): Promise<void> {
  const response = await api.get(`/api/v1/results/${analysisId}/report`, {
    params: { format },
    responseType: 'blob',
  });

  // Create download link
  const blob = new Blob([response.data], {
    type: format === 'pdf' ? 'application/pdf' : 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${analysisId}_report.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Models API
export interface Model {
  name: string;
  type: string;
  version: string;
  description: string;
  accuracy: number;
  f1_score: number;
  is_loaded: boolean;
  supported_media: string[];
}

export interface ModelsResponse {
  models: Model[];
  default_model: string;
  ensemble_enabled: boolean;
}

export async function getModels(): Promise<ModelsResponse> {
  const response = await api.get<ModelsResponse>('/api/v1/models');
  return response.data;
}

export async function getModelInfo(modelName: string): Promise<Model> {
  const response = await api.get<Model>(`/api/v1/models/${modelName}`);
  return response.data;
}

// Auth API
export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);

  const response = await api.post<LoginResponse>('/api/v1/auth/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  // Store token
  localStorage.setItem('auth_token', response.data.access_token);

  return response.data;
}

export async function register(email: string, password: string, name?: string): Promise<{ id: string; email: string }> {
  const response = await api.post('/api/v1/auth/register', {
    email,
    password,
    name,
  });

  return response.data;
}

export function logout(): void {
  localStorage.removeItem('auth_token');
}

// Feedback API
export async function submitFeedback(
  analysisId: string,
  isCorrect: boolean,
  actualLabel?: 'real' | 'fake',
  comments?: string
): Promise<{ id: string; status: string }> {
  const response = await api.post('/api/v1/feedback', {
    analysis_id: analysisId,
    is_correct: isCorrect,
    actual_label: actualLabel,
    comments,
  });

  return response.data;
}

export default api;
