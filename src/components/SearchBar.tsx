import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, MessageCircle } from "lucide-react";
import { searchManager } from "../lib/searchManager";
import ChatModal from "./ChatModal";

interface SearchBarProps {
  compact?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ compact = false }) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSparkle, setIsSparkle] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState("How can I help you today?");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const isAIConfigured = true;

  // Top 50 world languages for search placeholders
  const worldPlaceholders = [
    "我能帮你什么吗？", // Chinese (Mandarin)
    "¿Cómo puedo ayudarte?", // Spanish
    "How can I help you today?", // English (International)
    "كيف يمكنني المساعدة؟", // Arabic
    "मैं कैसे मदद कर सकता हूँ?", // Hindi
    "Como posso ajudar?", // Portuguese
    "Как я могу помочь?", // Russian
    "どのようにお手伝いできますか？", // Japanese
    "Comment puis-je vous aider?", // French
    "Wie kann ich Ihnen helfen?", // German
    "어떻게 도와드릴까요?", // Korean
    "Come posso aiutarti?", // Italian
    "Nasıl yardımcı olabilirim?", // Turkish
    "Tôi có thể giúp gì?", // Vietnamese
    "Jak mogę pomóc?", // Polish
    "ฉันช่วยอะไรได้บ้าง?", // Thai
    "Bagaimana saya bisa membantu?", // Indonesian/Malay
    "Hur kan jag hjälpa dig?", // Swedish
    "Hvordan kan jeg hjelpe?", // Norwegian/Danish
    "Miten voin auttaa?", // Finnish
    "Πώς μπορώ να βοηθήσω;", // Greek
    "איך אני יכול לעזור?", // Hebrew
    "Jak mohu pomoci?", // Czech
    "Kako mogu pomoći?", // Croatian/Serbian/Bosnian
    "Cum pot ajuta?", // Romanian
    "Paano kita matutulungan?", // Filipino
    "Как мога да помогна?", // Bulgarian
    "Як я можу допомогти?", // Ukrainian
    "Qanday yordam bera olaman?", // Uzbek
    "Necə kömək edə bilərəm?", // Azerbaijani
    "Ինչպե՞ս կարող եմ օգնել:", // Armenian
    "როგორ შემიძლია დაგეხმაროთ?", // Georgian
    "Si mund t'ju ndihmoj?", // Albanian
    "Kako vam lahko pomagam?", // Slovenian
    "Kā es varu palīdzēt?", // Latvian
    "Kaip galiu padėti?", // Lithuanian
    "Kuidas saan aidata?", // Estonian
    "Conas is féidir liom cabhrú?", // Irish Gaelic
    "Sut alla i helpu?", // Welsh
    "Nola lagun dezaket?", // Basque
    "Com puc ajudar?", // Catalan
    "Cumu possu aiutà?", // Corsican
    "Kako mogu pomoći?", // Montenegrin
    "Како можам да помогнам?", // Macedonian
    "Bagaimana saya boleh membantu?", // Brunei Malay
    "कथं साहाय्यं करोमि?", // Sanskrit
    "Πώς μπορώ να σας βοηθήσω;", // Greek (formal)
    "Como posso ajudar-vos?", // Portuguese (formal)
    "Comment puis-je vous aider?", // French Canadian
    "How can I help ya?", // Australian English
    "Me pēhea au e āwhina ai?" // Māori
  ];

  // Function to get next placeholder with USA bias
  const getNextPlaceholder = () => {
    // Every 5th message should be American English
    if (Math.random() < 0.2) { // 20% chance = roughly every 5th
      return "How can I help you today?"; // American English
    }
    
    // Otherwise, pick randomly from world languages
    const randomIndex = Math.floor(Math.random() * worldPlaceholders.length);
    return worldPlaceholders[randomIndex];
  };

  // Change placeholder every 4 seconds (slightly slower than navbar)
  useEffect(() => {
    const placeholderTimer = setInterval(() => {
      setCurrentPlaceholder(getNextPlaceholder());
    }, 4000);

    return () => clearInterval(placeholderTimer);
  }, []);

  const isConversationalQuery = (text: string): boolean => {
    const conversationalPatterns = [
      /^(what|how|why|when|where|who|can you|could you|tell me|show me|explain)/i,
      /\?$/,
      /(help|recommend|suggest|advice|tell me about|what do you think)/i,
      /\b(i want|i need|i'd like|looking for)\b/i
    ];
    return conversationalPatterns.some(pattern => pattern.test(text)) || text.split(' ').length > 5;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSparkle(true);
    setIsLoading(true);

    try {
      if (isAIConfigured && isConversationalQuery(query)) {
        setChatQuery(query);
        setQuery("");
        setIsLoading(false);
        setIsSparkle(false);
        setIsChatOpen(true);
      } else {
        const searchResult = await searchManager.search(query);
        navigate(searchResult.suggestedRoute);

        if (searchResult.results.length > 0) {
          sessionStorage.setItem('searchResults', JSON.stringify(searchResult));
        }

        setQuery("");
        setIsLoading(false);
        setTimeout(() => setIsSparkle(false), 800);
      }
    } catch (error) {
      console.error('Search failed:', error);
      navigate("/gallery");
      setQuery("");
      setIsLoading(false);
      setTimeout(() => setIsSparkle(false), 800);
    }
  };

  // Auto-focus effect for home page
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
      <>
        <div className="relative max-w-md">
          <form onSubmit={handleSearch} className="relative flex items-center gap-2">
            <div className={`relative flex-1 glass-card search-enhanced ${isSparkle ? 'sparkle-effect' : ''}`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <input
                ref={inputRef}
                type="text"
                placeholder={currentPlaceholder.length > 25 ? "How can I help?" : currentPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none transition-all duration-300 rounded-full py-2 pl-10 pr-12"
                disabled={isLoading}
              />
            </div>
            {isAIConfigured && (
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="glass-button p-2 text-white/70 hover:text-yellow-400 transition-colors"
                title="Open AI Chat"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setChatQuery("");
          }}
          initialQuery={chatQuery}
        />
      </>
    );
  }

  return (
    <>
      <div className="w-full max-w-3xl mx-auto relative floating-element card-floating">
        <form onSubmit={handleSearch}>
          <div className={`relative group ${isSparkle ? 'sparkle-effect' : ''}`}>
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
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="flex-1 bg-transparent py-6 px-6 text-white text-lg text-body placeholder-white/70 focus:outline-none transition-all duration-300"
                  disabled={isLoading}
                />
                <div className="mr-6 flex items-center gap-2">
                  {isAIConfigured && (
                    <button
                      type="button"
                      onClick={() => setIsChatOpen(true)}
                      className="btn-secondary flash-on-hover px-4 py-3 rounded-full"
                      title="Open AI Chat"
                    >
                      <MessageCircle size={16} />
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
        {isAIConfigured && (
          <div className="text-center mt-3">
            <p className="text-white/40 text-xs">
              Ask conversational questions for AI chat, or use keywords to navigate
            </p>
          </div>
        )}
      </div>
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatQuery("");
        }}
        initialQuery={chatQuery}
      />
    </>
  );
};

export default SearchBar;