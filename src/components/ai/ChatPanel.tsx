/**
 * Chat Panel Component
 * Main chatbot interface for AI-powered document editing
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Divider,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/DeleteOutline';

import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import AIStatusIndicator from './AIStatusIndicator';
import SettingsPanel from './SettingsPanel';
import { ChatEngine, type ChatMessage as ChatMsg } from '../../lib/ai/chatbot/chat-engine';

interface ChatPanelProps {
  onClose: () => void;
  documentContent: string;
  onApplyChange?: (change: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  onClose,
  documentContent,
  onApplyChange,
}) => {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [canCancel, setCanCancel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const chatEngineRef = useRef<ChatEngine | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentRequestRef = useRef<{ cancel: () => void } | null>(null);

  useEffect(() => {
    // Initialize chat engine
    chatEngineRef.current = new ChatEngine();
    chatEngineRef.current.loadHistory();
    setMessages(chatEngineRef.current.getHistory());
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCancelRequest = () => {
    if (currentRequestRef.current) {
      currentRequestRef.current.cancel();
      currentRequestRef.current = null;
      setIsLoading(false);
      setCanCancel(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!chatEngineRef.current || !content.trim()) return;

    setIsLoading(true);
    setCanCancel(true);

    let cancelled = false;
    currentRequestRef.current = {
      cancel: () => {
        cancelled = true;
      }
    };

    try {
      await chatEngineRef.current.sendMessage(
        content,
        documentContent
      );
      
      if (!cancelled) {
        const updatedMessages = chatEngineRef.current.getHistory();
        setMessages(updatedMessages);
        chatEngineRef.current.saveHistory();
      }
    } catch (error) {
      if (!cancelled) {
        console.error('Chat error:', error);
      }
    } finally {
      if (!cancelled) {
        setIsLoading(false);
        setCanCancel(false);
      }
      currentRequestRef.current = null;
    }
  };

  const handleStreamMessage = async (content: string) => {
    if (!chatEngineRef.current || !content.trim()) return;

    setIsLoading(true);
    
    // Add user message immediately
    const updatedMessages = chatEngineRef.current.getHistory();
    setMessages([...updatedMessages]);

    // Create placeholder for streaming response
    const streamingMessage: ChatMsg = {
      id: 'streaming',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    try {
      await chatEngineRef.current.streamMessage(
        content,
        (chunk) => {
          streamingMessage.content += chunk;
          if (chatEngineRef.current) {
            setMessages([...chatEngineRef.current.getHistory().slice(0, -1), streamingMessage]);
          }
        },
        documentContent
      );
      
      // Update with final messages
      const finalMessages = chatEngineRef.current.getHistory();
      setMessages(finalMessages);
      chatEngineRef.current.saveHistory();
    } catch (error) {
      console.error('Stream error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (chatEngineRef.current) {
      chatEngineRef.current.clearHistory();
      setMessages([]);
      chatEngineRef.current.saveHistory();
    }
  };

  // Show settings if requested
  if (showSettings) {
    return (
      <Box sx={{ height: '100%', overflow: 'auto' }}>
        <SettingsPanel onClose={() => setShowSettings(false)} />
      </Box>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            AI Assistant
          </Typography>
          <AIStatusIndicator />
        </Box>
        
        <Box>
          <Tooltip title="Clear chat history">
            <IconButton size="small" onClick={handleClearHistory}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton size="small" onClick={() => setShowSettings(true)}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              color: 'text.secondary',
            }}
          >
            <Typography variant="h6">Welcome to AI Assistant!</Typography>
            <Typography variant="body2" align="center" sx={{ maxWidth: 400 }}>
              Ask me to help improve your manuscript. Try commands like:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">• "Check grammar in paragraph 2"</Typography>
              <Typography variant="body2">• "Make this more professional"</Typography>
              <Typography variant="body2">• "Fix passive voice"</Typography>
              <Typography variant="body2">• "/help for more commands"</Typography>
            </Box>
          </Box>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onApplyChange={onApplyChange}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input Area */}
      <Box sx={{ p: 2 }}>
        {canCancel && (
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
            <Box
              component="button"
              onClick={handleCancelRequest}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                border: 1,
                borderColor: 'error.main',
                borderRadius: 1,
                px: 2,
                py: 0.5,
                bgcolor: 'transparent',
                color: 'error.main',
                cursor: 'pointer',
                fontSize: '0.875rem',
                '&:hover': {
                  bgcolor: 'error.light',
                  color: 'error.contrastText',
                }
              }}
            >
              <CloseIcon fontSize="small" />
              Cancel Request
            </Box>
          </Box>
        )}
        <ChatInput
          onSend={handleSendMessage}
          onStream={handleStreamMessage}
          disabled={isLoading}
          placeholder="Ask me anything about your manuscript..."
        />
      </Box>
    </Paper>
  );
};

export default ChatPanel;
