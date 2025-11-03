/**
 * Chat Message Component
 * Displays individual chat messages
 */

import React from 'react';
import { Box, Paper, Typography, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { type ChatMessage as ChatMsg } from '../../lib/ai/chatbot/chat-engine';

interface ChatMessageProps {
  message: ChatMsg;
  onApplyChange?: (_change: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  // Don't display system messages
  if (isSystem) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 1,
        alignItems: 'flex-start',
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
        }}
      >
        {isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
      </Avatar>

      {/* Message Content */}
      <Paper
        elevation={1}
        sx={{
          p: 1.5,
          maxWidth: '75%',
          bgcolor: isUser ? 'primary.light' : 'background.paper',
          color: isUser ? 'primary.contrastText' : 'text.primary',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {message.content}
        </Typography>
        
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            opacity: 0.7,
          }}
        >
          {message.timestamp.toLocaleTimeString()}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ChatMessage;
