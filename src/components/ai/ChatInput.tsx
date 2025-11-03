/**
 * Chat Input Component
 * User input field with suggestions and send button
 */

import React, { useState, type KeyboardEvent } from 'react';
import { Box, TextField, IconButton, Chip, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FlashOnIcon from '@mui/icons-material/FlashOn';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStream?: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const SUGGESTED_PROMPTS = [
  'Check grammar',
  'Improve clarity',
  'Fix passive voice',
  'Make more professional',
  '/help',
];

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onStream,
  disabled = false,
  placeholder = 'Type your message...',
}) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      setShowSuggestions(false);
    }
  };

  const handleStream = () => {
    if (input.trim() && !disabled && onStream) {
      onStream(input.trim());
      setInput('');
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  return (
    <Box>
      {/* Suggested Prompts */}
      {showSuggestions && (
        <Box sx={{ mb: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {SUGGESTED_PROMPTS.map((prompt) => (
            <Chip
              key={prompt}
              label={prompt}
              size="small"
              onClick={() => handleSuggestionClick(prompt)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      )}

      {/* Input Field */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
        
        {onStream && (
          <Tooltip title="Stream response (real-time)">
            <span>
              <IconButton
                color="secondary"
                onClick={handleStream}
                disabled={disabled || !input.trim()}
                sx={{ mb: 0.5 }}
              >
                <FlashOnIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}
        
        <Tooltip title="Send message">
          <span>
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={disabled || !input.trim()}
              sx={{ mb: 0.5 }}
            >
              <SendIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ChatInput;
