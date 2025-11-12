import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Minus, Send, Loader2, AlertCircle, Search as SearchIcon } from "lucide-react";
import { secureChatService, ChatMessage, ChatServiceError } from '../lib/secureChatService';
import { aiSearchClient } from '../lib/aiSearchClient';
import { useTurnstile } from '../hooks/useTurnstile';
import { useNavigate } from "react-router-dom";
import ConversationBubble from './ConversationBubble';

type WidgetState = 'closed' | 'open' | 'minimized';
type Mode = 'chat' | 'search';

interface ChatWidgetProps {
  initialQuery?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ initialQuery }) => {
  const [state, setState] = useState<WidgetState>('closed');
  const [mode, setMode] = useState<Mode>('chat');
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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
    const saved = sessionStorage.getItem('chat_widget_conversation');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setMessages(parsed);
          setState('minimized');
          setHasUnread(true);
        }
      } catch (e) {
        console.error('Failed to load conversation:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('chat_widget_conversation', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (initialQuery && state === 'closed') {
      setInput(initialQuery);
      setState('open');
      setMode('search');
    }
  }, [initialQuery]);

  useEffect(() => {
    if (state === 'open') {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [state, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpen = () => {
    setState('open');
    setHasUnread(false);
  };

  const handleClose = () => {
    setState('closed');
  };

  const handleMinimize = () => {
    setState('minimized');
  };

  const handleNewConversation = () => {
    setMessages([]);
    setSearchResults([]);
    setError(null);
    setMode('chat');
    sessionStorage.removeItem('chat_widget_conversation');
  };

  const handleSendChat = async () => {
    if (!input.trim() || isLoading) return;

    if (!turnstileToken) {
      setError('Security verification in progress...');
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
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
        setError("AI assistant unavailable. Please try again later.");
      }

      resetTurnstile();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSearch = async () => {
    if (!input.trim() || isLoading) return;

    const searchQuery = input.trim();
    setInput("");
    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const response = await aiSearchClient.search(searchQuery, {
        enableAI: true,
        enableRerank: true,
        limit: 8
      });

      if (response.error) {
        setError(response.error);
      }

      setSearchResults(response.results || []);

      if (response.results.length === 0) {
        setError('No results found. Try different keywords or browse the gallery.');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (mode === 'chat') {
      handleSendChat();
    } else {
      handleSendSearch();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResultClick = (url: string) => {
    navigate(url);
    handleMinimize();
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setSearchResults([]);
    setError(null);
  };

  useEffect(() => {
    const handleKeyboardShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'a') {
        e.preventDefault();
        if (state === 'closed' || state === 'minimized') {
          handleOpen();
        } else {
          handleClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcut);
    return () => window.removeEventListener('keydown', handleKeyboardShortcut);
  }, [state]);

  if (state === 'closed') {
    return (
      <>
        <div ref={containerRef} className="hidden" />
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center group"
          title="Open AI Assistant (Ctrl+Shift+A)"
        >
          <MessageCircle className="w-6 h-6" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
      </>
    );
  }

  if (state === 'minimized') {
    return (
      <>
        <div ref={containerRef} className="hidden" />
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-50 flex items-center gap-2"
          title="Open AI Assistant"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Continue conversation</span>
          {hasUnread && (
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          )}
        </button>
      </>
    );
  }

  return (
    <>
      <div ref={containerRef} className="hidden" />
      <div className="fixed bottom-6 right-6 w-[min(400px,calc(100vw-3rem))] max-h-[600px] glass-card rounded-2xl shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">AI Assistant</h3>
              <p className="text-white/60 text-xs">
                {isReady ? 'Online' : 'Initializing...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMinimize}
              className="text-white/60 hover:text-white transition-colors"
              title="Minimize"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="text-white/60 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 p-3 border-b border-white/10">
          <button
            onClick={() => switchMode('chat')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'chat'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Chat
          </button>
          <button
            onClick={() => switchMode('search')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'search'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <SearchIcon className="w-4 h-4 inline mr-2" />
            Search
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[350px]">
          {mode === 'chat' && messages.length === 0 && (
            <div className="text-center text-white/60 text-sm py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Ask me about the portfolio, services, or prints.</p>
              <p className="text-xs mt-2">Try: "Show me wedding photos" or "How much for a portrait session?"</p>
            </div>
          )}

          {mode === 'chat' && messages.map((message, index) => (
            <ConversationBubble key={index} message={message} />
          ))}

          {mode === 'search' && searchResults.length === 0 && !isLoading && !error && (
            <div className="text-center text-white/60 text-sm py-8">
              <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Search the portfolio, essays, and shop.</p>
              <p className="text-xs mt-2">AI-powered search finds the most relevant content.</p>
            </div>
          )}

          {mode === 'search' && searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(result.url)}
                  className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                >
                  <div className="flex items-start gap-3">
                    {result.image && (
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm truncate">{result.title}</h4>
                      <p className="text-white/60 text-xs mt-1 line-clamp-2">{result.description}</p>
                      <span className="text-white/40 text-xs mt-1 inline-block">{result.type}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-2 text-white/60">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">{mode === 'chat' ? 'Thinking...' : 'Searching...'}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-white">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-white/10">
          {messages.length > 0 && mode === 'chat' && (
            <button
              onClick={handleNewConversation}
              className="w-full mb-2 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              New Conversation
            </button>
          )}
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === 'chat' ? "Ask me anything..." : "Search for..."}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-white/30 transition-colors"
              rows={1}
              maxLength={2000}
              disabled={isLoading || (mode === 'chat' && !isReady)}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || (mode === 'chat' && !isReady)}
              className="px-4 py-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {!isReady && mode === 'chat' && (
            <p className="text-xs text-white/40 mt-2 text-center">Initializing security...</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatWidget;
