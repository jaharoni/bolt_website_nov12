import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Telescope,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Search,
} from "lucide-react";
import { searchManager } from "../lib/searchManager";
import {
  secureChatService,
  ChatMessage,
  ChatServiceError,
} from "../lib/secureChatService";
import { useTurnstile } from "../hooks/useTurnstile";
import ConversationBubble from "./ConversationBubble";

interface SearchBarProps {
  compact?: boolean;
}

const SearchBarNew: React.FC<SearchBarProps> = ({ compact = false }) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSparkle, setIsSparkle] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(
    "How can I help you today?",
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showExternalSearch, setShowExternalSearch] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const isAIConfigured = true;

  const {
    containerRef,
    token,
    isReady,
    reset: resetTurnstile,
  } = useTurnstile((tkn) => {
    setTurnstileToken(tkn);
  });

  useEffect(() => {
    if (token) {
      setTurnstileToken(token);
    }
  }, [token]);

  const worldPlaceholders = [
    "我能帮你什么吗？",
    "¿Cómo puedo ayudarte?",
    "How can I help you today?",
    "كيف يمكنني المساعدة؟",
    "मैं कैसे मदद कर सकता हूँ?",
    "Como posso ajudar?",
    "Как я могу помочь?",
    "どのようにお手伝いできますか？",
    "Comment puis-je vous aider?",
    "Wie kann ich Ihnen helfen?",
  ];

  const getNextPlaceholder = () => {
    if (Math.random() < 0.2) {
      return "How can I help you today?";
    }
    const randomIndex = Math.floor(Math.random() * worldPlaceholders.length);
    return worldPlaceholders[randomIndex];
  };

  useEffect(() => {
    const placeholderTimer = setInterval(() => {
      setCurrentPlaceholder(getNextPlaceholder());
    }, 4000);

    return () => clearInterval(placeholderTimer);
  }, []);

  useEffect(() => {
    const savedConversation = sessionStorage.getItem("chat_conversation");
    if (savedConversation) {
      try {
        const parsed = JSON.parse(savedConversation);
        if (parsed.length > 0) {
          setMessages(parsed);
          setIsMinimized(true);
        }
      } catch (e) {
        console.error("Failed to load conversation:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("chat_conversation", JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isExpanded) {
      scrollToBottom();
    }
  }, [messages, isExpanded]);

  const isConversationalQuery = (text: string): boolean => {
    const lowerText = text.toLowerCase().trim();

    const simpleKeywords = [
      "gallery",
      "galleries",
      "portfolio",
      "portfolios",
      "shop",
      "store",
      "buy",
      "purchase",
      "about",
      "bio",
      "biography",
      "contact",
      "email",
      "reach",
      "essay",
      "essays",
      "writing",
      "article",
      "articles",
      "home",
      "main",
    ];

    if (
      simpleKeywords.some(
        (keyword) =>
          lowerText === keyword || lowerText.startsWith(keyword + " "),
      )
    ) {
      return false;
    }

    const conversationalIndicators = [
      "how",
      "what",
      "where",
      "when",
      "why",
      "who",
      "can you",
      "could you",
      "would you",
      "tell me",
      "show me",
      "find me",
      "i want",
      "i need",
      "i am looking",
      "?",
    ];

    return conversationalIndicators.some((indicator) =>
      lowerText.includes(indicator),
    );
  };

  const handleAIChat = async (messageText: string) => {
    if (!turnstileToken) {
      setError(
        "Security verification in progress. Using basic search instead...",
      );
      setTimeout(async () => {
        try {
          const searchResult = await searchManager.search(messageText);
          navigate(searchResult.suggestedRoute);
        } catch (error) {
          navigate("/gallery");
        }
      }, 1000);
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsExpanded(true);
    setIsMinimized(false);
    setIsLoading(true);
    setError(null);
    setShowExternalSearch(false);

    try {
      const allMessages = [...messages, userMessage].slice(-10);
      const response = await secureChatService.chat(
        allMessages,
        turnstileToken,
      );

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.message.content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      resetTurnstile();

      const lowerContent = response.message.content.toLowerCase();
      if (
        lowerContent.includes("couldn't find") ||
        lowerContent.includes("not available on") ||
        lowerContent.includes("don't have information")
      ) {
        setShowExternalSearch(true);
      }
    } catch (err) {
      console.error("Chat error:", err);

      if (err instanceof ChatServiceError) {
        setError(err.getUserFriendlyMessage());
      } else {
        setError("AI assistant unavailable. Using basic search...");
        setTimeout(async () => {
          try {
            const searchResult = await searchManager.search(messageText);
            navigate(searchResult.suggestedRoute);
            setMessages([]);
            setIsExpanded(false);
          } catch (error) {
            navigate("/gallery");
          }
        }, 1500);
      }

      resetTurnstile();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSparkle(true);

    try {
      if (isAIConfigured && isConversationalQuery(query)) {
        await handleAIChat(query);
        setQuery("");
      } else {
        setIsLoading(true);
        const searchResult = await searchManager.search(query);
        navigate(searchResult.suggestedRoute);

        if (searchResult.results.length > 0) {
          sessionStorage.setItem("searchResults", JSON.stringify(searchResult));
        }

        setQuery("");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Search failed:", error);
      navigate("/gallery");
      setQuery("");
      setIsLoading(false);
    } finally {
      setTimeout(() => setIsSparkle(false), 800);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch(e as any);
    }
    if (e.key === "Escape") {
      handleMinimize();
    }
  };

  const handleMinimize = () => {
    setIsExpanded(false);
    setIsMinimized(true);
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setIsMinimized(false);
  };

  const handleNewConversation = () => {
    setMessages([]);
    setIsExpanded(false);
    setIsMinimized(false);
    setError(null);
    setShowExternalSearch(false);
    sessionStorage.removeItem("chat_conversation");
  };

  const handleExternalSearch = () => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMessage) {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(lastUserMessage.content)}`;
      window.open(searchUrl, "_blank");
    }
  };

  useEffect(() => {
    if (!compact && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [compact]);

  const visibleMessages = messages.slice(-4);

  if (compact) {
    return (
      <div className="relative max-w-md">
        <div ref={containerRef} className="hidden" />
        <form onSubmit={handleSearch} className="relative">
          <div
            className={`relative flex-1 glass-yellow-subtle search-enhanced ${isSparkle ? "sparkle-effect" : ""} rounded-full transition-all duration-300`}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <input
              ref={inputRef}
              type="text"
              placeholder={
                currentPlaceholder.length > 25
                  ? "How can I help?"
                  : currentPlaceholder
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                if (messages.length > 0 && isMinimized) {
                  handleExpand();
                }
              }}
              className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none transition-all duration-300 rounded-full py-2 pl-10 pr-12"
              disabled={isLoading}
            />
            {isMinimized && messages.length > 0 && (
              <button
                type="button"
                onClick={handleExpand}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-yellow-400 animate-pulse"
                title="Continue conversation"
              />
            )}
          </div>
        </form>

        {isExpanded && (
          <div
            ref={conversationRef}
            className="absolute top-full mt-2 left-0 right-0 glass-card rounded-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-300"
            style={{ maxHeight: "400px" }}
          >
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <span className="text-white text-sm font-medium">
                AI Assistant
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNewConversation}
                  className="text-white/60 hover:text-white text-xs"
                  title="New conversation"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleMinimize}
                  className="text-white/60 hover:text-white"
                  title="Minimize"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              className="overflow-y-auto p-3 space-y-2"
              style={{ maxHeight: "280px" }}
            >
              {visibleMessages.map((message, index) => (
                <ConversationBubble key={index} message={message} />
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl frost-medium text-white/90">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-white">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {showExternalSearch && (
                <div className="flex justify-center">
                  <button
                    onClick={handleExternalSearch}
                    className="glass-button px-4 py-2 text-sm text-white flex items-center gap-2 hover:bg-white/10"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Search on Google
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {!isReady && (
              <p className="text-xs text-white/40 px-3 pb-2 text-center">
                Initializing security...
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto relative">
      <div ref={containerRef} className="hidden" />
      <form onSubmit={handleSearch}>
        <div
          className={`relative backdrop-blur-xl bg-white/5 search-enhanced rounded-full px-6 py-4 flex items-center gap-3 transition-all duration-300 glass-hover-yellow ${isSparkle ? "sparkle-effect" : ""}`}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={currentPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              if (messages.length > 0 && isMinimized) {
                handleExpand();
              }
            }}
            className="flex-1 text-white text-lg font-display placeholder-white/60 focus:outline-none"
            style={{
              background: "none",
              backgroundColor: "transparent",
              backgroundImage: "none",
              boxShadow: "none",
            }}
            disabled={isLoading}
          />

          {isMinimized && messages.length > 0 && (
            <button
              type="button"
              onClick={handleExpand}
              className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse flex-shrink-0"
              title="Continue conversation"
            />
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex-shrink-0 glass-button p-2.5 text-white hover:text-yellow-300 hover:bg-yellow-400/15 hover:border-yellow-400/40 transition-all duration-300 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-white disabled:scale-100"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Telescope className="w-5 h-5" strokeWidth={2} />
            )}
          </button>
        </div>
      </form>

      {isExpanded && (
        <div
          ref={conversationRef}
          className="mt-4 glass-card rounded-2xl overflow-hidden animate-in slide-in-from-top-4 duration-500"
          style={{ maxHeight: "500px" }}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <span className="text-white font-medium">AI Assistant</span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleNewConversation}
                className="text-white/60 hover:text-white text-sm flex items-center gap-1"
                title="New conversation"
              >
                <X className="w-4 h-4" />
                <span className="text-xs">New</span>
              </button>
              <button
                onClick={handleMinimize}
                className="text-white/60 hover:text-white"
                title="Minimize"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="overflow-y-auto p-4 space-y-3"
            style={{ maxHeight: "360px" }}
          >
            {visibleMessages.map((message, index) => (
              <ConversationBubble key={index} message={message} />
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="p-4 rounded-2xl frost-medium text-white/90">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start">
                <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-white">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {showExternalSearch && (
              <div className="flex justify-center">
                <button
                  onClick={handleExternalSearch}
                  className="glass-button px-6 py-3 text-white flex items-center gap-2 hover:bg-white/10 transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                  Search on Google instead
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {!isReady && (
            <p className="text-xs text-white/40 p-4 text-center border-t border-white/10">
              Initializing security verification...
            </p>
          )}
        </div>
      )}

      {isAIConfigured && !isExpanded && (
        <div className="text-center mt-3">
          <p className="text-white/40 text-xs">
            Ask conversational questions for AI assistance, or use keywords to
            navigate
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchBarNew;
