import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import type { StructureAnalysis, Section } from '../services/documentStructureAnalyzer';

interface DocumentStructurePanelProps {
  analysis: StructureAnalysis | null;
}

const DocumentStructurePanel: React.FC<DocumentStructurePanelProps> = ({ analysis }) => {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set());

  if (!analysis) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Document Structure
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No content to analyze
        </Typography>
      </Paper>
    );
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: 'complete' | 'incomplete' | 'missing') => {
    switch (status) {
      case 'complete':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'incomplete':
        return <WarningIcon color="warning" fontSize="small" />;
      case 'missing':
        return <ErrorIcon color="error" fontSize="small" />;
    }
  };

  const renderSection = (section: Section, depth: number = 0) => {
    const isExpanded = expandedSections.has(section.id);
    const hasChildren = section.children.length > 0;

    return (
      <Box key={section.id}>
        <ListItem
          sx={{
            pl: depth * 2,
            py: 0.5,
            '&:hover': { backgroundColor: 'action.hover' }
          }}
        >
          {hasChildren && (
            <IconButton
              size="small"
              onClick={() => toggleSection(section.id)}
              sx={{ mr: 1 }}
            >
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
          {!hasChildren && <Box sx={{ width: 40 }} />}
          
          <ListItemText
            primary={section.title}
            secondary={`${section.wordCount} words`}
            primaryTypographyProps={{
              variant: 'body2',
              fontWeight: section.level === 1 ? 'bold' : 'normal'
            }}
            secondaryTypographyProps={{ variant: 'caption' }}
          />
          
          <Chip
            label={section.type}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </ListItem>

        {hasChildren && (
          <Collapse in={isExpanded}>
            {section.children.map(child => renderSection(child, depth + 1))}
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Document Structure
      </Typography>

      {/* Structure Score */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Structure Score</Typography>
          <Typography variant="body2" fontWeight="bold">
            {analysis.structureScore}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={analysis.structureScore}
          sx={{ height: 8, borderRadius: 1 }}
          color={
            analysis.structureScore >= 80
              ? 'success'
              : analysis.structureScore >= 60
              ? 'warning'
              : 'error'
          }
        />
      </Box>

      {/* Missing Sections */}
      {analysis.missingRequiredSections.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Missing Required Sections:
          </Typography>
          {analysis.missingRequiredSections.map(section => (
            <Chip
              key={section}
              label={section}
              size="small"
              color="warning"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Alert>
      )}

      {/* Section Completion Status */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Section Completion
        </Typography>
        <List dense>
          {analysis.sectionCompletionStatus.map(item => (
            <ListItem key={item.section} sx={{ py: 0.5 }}>
              {getStatusIcon(item.status)}
              <ListItemText
                primary={item.section.replace(/-/g, ' ')}
                secondary={`${item.wordCount} / ${item.expectedMinWords} words`}
                sx={{ ml: 1 }}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Section Tree */}
      {analysis.sections.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Document Outline
          </Typography>
          <List dense>
            {analysis.sections.map(section => renderSection(section))}
          </List>
        </Box>
      )}

      {/* Total Word Count */}
      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">
          Total: {analysis.totalWordCount.toLocaleString()} words
        </Typography>
      </Box>
    </Paper>
  );
};

export default DocumentStructurePanel;
