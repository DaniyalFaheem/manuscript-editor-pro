import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Button,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onUploadComplete?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  disabled?: boolean;
}

const DEFAULT_MAX_SIZE = 100 * 1024 * 1024; // 100MB
const DEFAULT_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp',
  'image/gif',
  'video/mp4',
  'video/avi',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
];

export default function FileUpload({
  onFilesSelected,
  maxFiles = 10,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  disabled = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        file,
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        progress: 0,
      }));

      // Add rejected files with errors
      rejections.forEach((rejection) => {
        newFiles.push({
          file: rejection.file,
          id: `${rejection.file.name}-${Date.now()}`,
          status: 'error',
          progress: 0,
          error: rejection.errors.map((e) => e.message).join(', '),
        });
      });

      setFiles((prev) => [...prev, ...newFiles]);
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles,
    maxSize,
    disabled,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon color="primary" />;
    }
    return <VideoIcon color="secondary" />;
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      {/* Dropzone */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: '2px dashed',
          borderColor: isDragReject
            ? 'error.main'
            : isDragActive
            ? 'success.main'
            : 'divider',
          backgroundColor: isDragReject
            ? 'error.light'
            : isDragActive
            ? 'success.light'
            : 'background.paper',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: disabled ? 'divider' : 'primary.main',
            backgroundColor: disabled ? 'background.paper' : 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon
          sx={{
            fontSize: 64,
            color: isDragReject ? 'error.main' : 'primary.main',
            mb: 2,
          }}
        />
        <Typography variant="h6" gutterBottom>
          {isDragReject
            ? 'File type not supported'
            : isDragActive
            ? 'Drop files here'
            : 'Drag & drop files here'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          or click to browse
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Chip label="Images" size="small" icon={<ImageIcon />} variant="outlined" />
          <Chip label="Videos" size="small" icon={<VideoIcon />} variant="outlined" />
          <Chip label={`Max ${formatFileSize(maxSize)}`} size="small" variant="outlined" />
        </Box>
      </Paper>

      {/* File list */}
      {files.length > 0 && (
        <Paper sx={{ mt: 2 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={500}>
              Selected Files ({files.length})
            </Typography>
            <Button size="small" color="error" onClick={clearAll}>
              Clear All
            </Button>
          </Box>
          
          <List dense>
            {files.map((uploadedFile) => (
              <ListItem key={uploadedFile.id} divider>
                <ListItemIcon>{getFileIcon(uploadedFile.file)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {uploadedFile.file.name}
                      </Typography>
                      {getStatusIcon(uploadedFile.status)}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(uploadedFile.file.size)}
                      </Typography>
                      {uploadedFile.status === 'uploading' && (
                        <LinearProgress
                          variant="determinate"
                          value={uploadedFile.progress}
                          sx={{ mt: 0.5 }}
                        />
                      )}
                      {uploadedFile.error && (
                        <Typography variant="caption" color="error">
                          {uploadedFile.error}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => removeFile(uploadedFile.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
