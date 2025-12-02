import { useRef, useEffect, useState } from 'react';
import { Box, Typography, Slider, IconButton, Tooltip, Paper } from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as ResetIcon,
  Opacity as OpacityIcon,
} from '@mui/icons-material';

interface HeatmapVisualizationProps {
  imageUrl: string;
  heatmapUrl: string;
  width?: number;
  height?: number;
}

export default function HeatmapVisualization({
  imageUrl,
  heatmapUrl,
  width = 500,
  height = 400,
}: HeatmapVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [opacity, setOpacity] = useState(0.5);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [heatmapImage, setHeatmapImage] = useState<HTMLImageElement | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load images
  useEffect(() => {
    const loadImages = async () => {
      setLoadError(null);
      
      const original = new Image();
      original.crossOrigin = 'anonymous';
      original.src = imageUrl;
      
      const heatmap = new Image();
      heatmap.crossOrigin = 'anonymous';
      heatmap.src = heatmapUrl;
      
      try {
        await Promise.all([
          new Promise<void>((resolve, reject) => { 
            original.onload = () => resolve();
            original.onerror = () => reject(new Error('Failed to load original image'));
          }),
          new Promise<void>((resolve, reject) => { 
            heatmap.onload = () => resolve();
            heatmap.onerror = () => reject(new Error('Failed to load heatmap image'));
          }),
        ]);
        
        setOriginalImage(original);
        setHeatmapImage(heatmap);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Failed to load images');
      }
    };
    
    loadImages();
  }, [imageUrl, heatmapUrl]);

  // Draw on canvas
  useEffect(() => {
    if (!canvasRef.current || !originalImage || !heatmapImage) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply transformations
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.scale(zoom, zoom);
    
    // Draw original image
    ctx.drawImage(originalImage, 0, 0, width, height);
    
    // Draw heatmap overlay
    ctx.globalAlpha = opacity;
    ctx.drawImage(heatmapImage, 0, 0, width, height);
    ctx.globalAlpha = 1;
    
    ctx.restore();
  }, [originalImage, heatmapImage, opacity, zoom, position, width, height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setOpacity(0.5);
  };

  // Show error message if images failed to load
  if (loadError) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Heatmap Visualization</Typography>
        <Box sx={{ textAlign: 'center', py: 4, color: 'error.main' }}>
          <Typography>{loadError}</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Heatmap Visualization</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Zoom In">
            <IconButton size="small" onClick={handleZoomIn}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton size="small" onClick={handleZoomOut}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset View">
            <IconButton size="small" onClick={handleReset}>
              <ResetIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Canvas */}
      <Box
        sx={{
          width,
          height,
          overflow: 'hidden',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundColor: '#f0f0f0',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ display: 'block' }}
        />
      </Box>

      {/* Controls */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <OpacityIcon color="action" />
          <Typography variant="body2" sx={{ minWidth: 80 }}>
            Overlay: {Math.round(opacity * 100)}%
          </Typography>
          <Slider
            value={opacity}
            onChange={(_, value) => setOpacity(value as number)}
            min={0}
            max={1}
            step={0.05}
            sx={{ flex: 1 }}
          />
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: 0.5,
              background: 'linear-gradient(to right, #00ff00, #ffff00)',
            }}
          />
          <Typography variant="caption">Low Suspicion</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: 0.5,
              background: 'linear-gradient(to right, #ffff00, #ff0000)',
            }}
          />
          <Typography variant="caption">High Suspicion</Typography>
        </Box>
      </Box>
    </Paper>
  );
}
