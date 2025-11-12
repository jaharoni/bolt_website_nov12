import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import { secureChatService, ChatMessage, ChatServiceError } from '../lib/secureChatService';
import { useNavigate } from 'react-router-dom';
import { useTurnstile } from '../hooks/useTurnstile';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, initialQuery }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { containerRef, token, isReady, reset: resetTurnstile } = useTurnstile((tkn) => {
    setTurnstileToken(tkn);
  });

  useEffect(() => {
    if (token) {
      setTurnstileToken(token);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen && initialQuery && messages.length === 0 && isReady && turnstileToken) {
      handleSendMessage(initialQuery);
    }
  }, [isOpen, initialQuery, isReady, turnstileToken]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, error]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText: string = input) => {
    if (!messageText.trim() || isLoading) return;

    if (!turnstileToken) {
      setError('Security verification in progress. Please wait a moment and try again.');
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const allMessages = [...messages, userMessage].slice(-10);

      const response = await secureChatService.chat(allMessages, turnstileToken);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message.content,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      resetTurnstile();

    } catch (err) {
      console.error('Chat error:', err);

      if (err instanceof ChatServiceError) {
        setError(err.getUserFriendlyMessage());
      } else {
        setError("I'm sorry, I encountered an error. Please try again or use the navigation menu to explore the site.");
      }

      resetTurnstile();
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (route: string) => {
    navigate(route);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl h-[600px] glass-card overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-display text-white">Chat with AI</h2>
              <p className="text-xs text-white/60">Ask me anything about Justin's work</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="glass-button p-2 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-4">Ask me anything about Justin's work</p>
              <div className="text-left max-w-md mx-auto mb-6 space-y-2">
                <p className="text-white/40 text-xs font-medium mb-2">Try asking:</p>
                <div className="space-y-1 text-white/50 text-xs">
                  <p>• "Show me dramatic urban landscape photos"</p>
                  <p>• "How much for wedding photography?"</p>
                  <p>• "Find essays about documentary work"</p>
                  <p>• "Write an email about commercial rates"</p>
                  <p>• "Calculate a quote for 6-hour event coverage"</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => handleQuickAction('/gallery')}
                  className="btn-section text-sm"
                >
                  View Gallery
                </button>
                <button
                  onClick={() => handleQuickAction('/shop')}
                  className="btn-section text-sm"
                >
                  Browse Shop
                </button>
                <button
                  onClick={() => handleQuickAction('/about')}
                  className="btn-section text-sm"
                >
                  About Justin
                </button>
                <button
                  onClick={() => handleQuickAction('/contact')}
                  className="btn-section text-sm"
                >
                  Get in Touch
                </button>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-yellow-400/20 border border-yellow-400/30 text-white'
                    : 'frost-medium text-white/90'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs text-white/40 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-4 rounded-2xl frost-medium text-white/90">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-white">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t border-white/10">
          <div ref={containerRef} className="hidden" />
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={isLoading || !isReady}
              className="flex-1 input-glass glass-input-enhanced rounded-full px-6 py-3"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim() || !isReady}
              className="btn-primary glass-button-enhanced px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          {!isReady && (
            <p className="text-xs text-white/40 mt-2 text-center">Initializing security...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
