import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, MessageCircle } from "lucide-react";
import { searchManager } from "../lib/searchManager";

interface SearchBarSimpleProps {
  compact?: boolean;
  onOpenChat?: (query: string) => void;
}

const SearchBarSimple: React.FC<SearchBarSimpleProps> = ({
  compact = false,
  onOpenChat,
}) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSparkle, setIsSparkle] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(
    "Search portfolio, shop, essays...",
  );

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholders = [
    "Search portfolio, shop, essays...",
    "Find wedding photography",
    "Browse prints for sale",
    "Explore photo essays",
    "Search portfolios...",
  ];

  useEffect(() => {
    const placeholderTimer = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * placeholders.length);
      setCurrentPlaceholder(placeholders[randomIndex]);
    }, 4000);

    return () => clearInterval(placeholderTimer);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSparkle(true);
    setIsLoading(true);

    try {
      const searchResult = await searchManager.search(query);
      navigate(searchResult.suggestedRoute);

      if (searchResult.results.length > 0) {
        sessionStorage.setItem("searchResults", JSON.stringify(searchResult));
      }

      setQuery("");
    } catch (error) {
      console.error("Search failed:", error);
      navigate("/gallery");
      setQuery("");
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsSparkle(false), 800);
    }
  };

  const handleAskAI = () => {
    if (onOpenChat && query.trim()) {
      onOpenChat(query.trim());
      setQuery("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch(e as any);
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

  if (compact) {
    return (
      <div className="relative max-w-md">
        <form onSubmit={handleSearch} className="relative">
          <div
            className={`relative flex-1 glass-card search-enhanced ${isSparkle ? "sparkle-effect" : ""}`}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <input
              ref={inputRef}
              type="text"
              placeholder={
                currentPlaceholder.length > 25
                  ? "Search..."
                  : currentPlaceholder
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none transition-all duration-300 rounded-full py-2 pl-10 pr-12"
              disabled={isLoading}
            />
            {query.trim() && onOpenChat && (
              <button
                type="button"
                onClick={handleAskAI}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                title="Ask AI"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto relative floating-element card-floating">
      <form onSubmit={handleSearch}>
        <div className={`relative group ${isSparkle ? "sparkle-effect" : ""}`}>
          <div className="relative glass-card card-hover search-enhanced overflow-hidden">
            <div className="flex items-center">
              <div className="ml-6 text-cream-200 transition-colors duration-300 group-hover:text-mustard-400">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white/60 rounded-full animate-spin" />
                ) : (
                  <Search className="w-6 h-6" />
                )}
              </div>

              <input
                ref={inputRef}
                type="text"
                placeholder={currentPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-transparent py-6 px-6 text-white text-lg text-body placeholder-white/70 focus:outline-none transition-all duration-300"
                disabled={isLoading}
              />

              <div className="mr-6 flex items-center gap-2">
                {query.trim() && onOpenChat && (
                  <button
                    type="button"
                    onClick={handleAskAI}
                    className="btn-secondary px-4 py-3 rounded-full flex items-center gap-2 hover:scale-105 transition-all"
                    title="Ask AI"
                  >
                    <MessageCircle size={16} />
                    <span className="text-sm">Ask AI</span>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="btn-secondary flash-on-hover px-4 py-3 rounded-full disabled:bg-transparent disabled:scale-100 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-white/50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white/60 rounded-full animate-spin" />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="text-center mt-3">
        <p className="text-white/40 text-xs">
          Use keywords to navigate, or click "Ask AI" for conversational help
        </p>
      </div>
    </div>
  );
};

export default SearchBarSimple;
