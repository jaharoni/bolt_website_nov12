import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import SearchBar from "./SearchBarNew";
import WeatherDisplay from "./WeatherDisplay";
import NewsTicker from "./NewsTicker";
import { useTextBlock } from "../hooks/useTextBlock";
import { usePrefetchOnHover } from "../hooks/useBackgroundPrefetch";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuTimeout, setMenuTimeout] = useState<NodeJS.Timeout | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [welcomeText, setWelcomeText] = useState("Welcome");
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedNavItem, setSelectedNavItem] = useState<string | null>(null);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const navBrandName = useTextBlock("nav.brand", "Riverhead East Watch");
  const prefetchBackground = usePrefetchOnHover();

  // Top 50 world languages with weighted USA frequency
  const worldLanguages = [
    "欢迎", // Chinese (Mandarin)
    "Bienvenido", // Spanish
    "Welcome", // English (International)
    "مرحبا", // Arabic
    "स्वागत", // Hindi
    "Bem-vindo", // Portuguese
    "Добро пожаловать", // Russian
    "いらっしゃいませ", // Japanese
    "Bienvenue", // French
    "Willkommen", // German
    "환영합니다", // Korean
    "Benvenuto", // Italian
    "Hoş geldiniz", // Turkish
    "Chào mừng", // Vietnamese
    "Witamy", // Polish
    "ยินดีต้อนรับ", // Thai
    "Selamat datang", // Indonesian/Malay
    "Välkommen", // Swedish
    "Velkommen", // Norwegian/Danish
    "Tervetuloa", // Finnish
    "Καλώς ήρθατε", // Greek
    "ברוך הבא", // Hebrew
    "Vítejte", // Czech
    "Dobrodošli", // Croatian/Serbian/Bosnian
    "Bun venit", // Romanian
    "Maligayang pagdating", // Filipino
    "Добре дошли", // Bulgarian
    "Ласкаво просимо", // Ukrainian
    "Kosh kelibsiz", // Uzbek
    "Xoş gəlmisiniz", // Azerbaijani
    "Բարի գալուստ", // Armenian
    "კეთილი იყოს თქვენი მობრძანება", // Georgian
    "Mirë se vini", // Albanian
    "Dobrodošli", // Slovenian
    "Laipni lūdzam", // Latvian
    "Sveiki atvykę", // Lithuanian
    "Tere tulemast", // Estonian
    "Fáilte", // Irish Gaelic
    "Croeso", // Welsh
    "Ongi etorri", // Basque
    "Benvinguts", // Catalan
    "Benvenuti", // Corsican
    "Dobrodošao", // Montenegrin
    "Добредојдовте", // Macedonian
    "Selamat datang", // Brunei Malay
    "स्वागतम्", // Sanskrit
    "Καλώς ορίσατε", // Greek (formal)
    "Bem-vindos", // Portuguese (plural)
    "Bienvenue", // French Canadian
    "G'day mate", // Australian English
    "Kia ora" // Māori
  ];

  // Function to get next welcome message with USA bias
  const getNextWelcomeMessage = () => {
    // Every 5th message should be American English
    if (Math.random() < 0.2) { // 20% chance = roughly every 5th
      return "Welcome"; // American English
    }
    
    // Otherwise, pick randomly from world languages
    const randomIndex = Math.floor(Math.random() * worldLanguages.length);
    return worldLanguages[randomIndex];
  };

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced navbar backdrop on scroll with rAF throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Change welcome message every 3 seconds on home page
  useEffect(() => {
    if (isHome) {
      const welcomeTimer = setInterval(() => {
        setWelcomeText(getNextWelcomeMessage());
      }, 3000);

      return () => clearInterval(welcomeTimer);
    } else {
      setWelcomeText("Welcome");
    }
  }, [isHome]);

  // Clear selection state when route changes
  useEffect(() => {
    setSelectedNavItem(null);
  }, [location.pathname]);

  // Format time for EST
  const formatTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  };

  // Format date for EST
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "short", 
      day: "numeric",
      weekday: "short"
    });
  };

  const handleMouseEnter = () => {
    if (menuTimeout) {
      clearTimeout(menuTimeout);
      setMenuTimeout(null);
    }
    setIsMenuOpen(true);
  };

  const handleMouseLeave = () => {
    // Reset selection immediately when mouse leaves for smoother experience
    setSelectedNavItem(null);
    const timeout = setTimeout(() => {
      setIsMenuOpen(false);
    }, 300); // Reduced delay for more natural feel
    setMenuTimeout(timeout);
  };

  // Handle mobile menu body scroll lock
  useEffect(() => {
    if (isMobile && isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isMenuOpen]);

  // Handle Escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        setSelectedNavItem(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (menuTimeout) {
        clearTimeout(menuTimeout);
      }
    };
  }, [menuTimeout]);

  const navItems = [
    { path: "/", label: "Overview", key: "home" },
    { path: "/about", label: "Playbook", key: "about" },
    { path: "/contact", label: "Participate", key: "contact" },
  ];

  // Handle nav item click: scroll to top and close menu immediately
  const handleNavClick = (targetPath: string) => {
    window.scrollTo(0, 0);
    setIsMenuOpen(false);
    setSelectedNavItem(targetPath);
  };

  // Handle logo click: scroll to top
  const handleLogoClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <>
      {/* Main Navigation - FIXED TO VIEWPORT */}
      <nav className={`fixed top-4 left-4 right-4 z-50 pointer-events-none will-change-transform transition-all duration-300 ${scrolled ? 'nav-scrolled' : ''}`}>
        <div>
          {/* Main Navbar */}
          <div className={`rounded-2xl pointer-events-auto transition-all duration-300 ${
            scrolled ? 'backdrop-blur-xl bg-black/20 border border-white/10' : 'backdrop-blur-md bg-black/10 border border-white/5'
          }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
              {isMobile ? (
                /* Mobile Layout - Stacked */
                <div className="py-3 space-y-2">
                  {/* Top Row: Welcome/Logo - Most Important */}
                 <div className="flex items-center justify-between text-smart-contrast">
                    <Link
                      to="/"
                      onClick={handleLogoClick}
                     className="font-display text-2xl hover:text-yellow-300 transition-all duration-300 cursor-pointer hover:scale-105 tracking-tight uppercase"
                    >
                      {isHome ? welcomeText : navBrandName}
                    </Link>
                  </div>
                  
                  {/* Bottom Row: Time, Weather, and News */}
                  <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 text-smart-contrast">
                     <div className="text-xs font-mono">
                        <div className="text-xs">{formatDate(currentTime)}</div>
                        <div className="text-sm font-medium">{formatTime(currentTime)}</div>
                      </div>
                      <WeatherDisplay />
                    </div>
                    <div className="max-w-32">
                      <NewsTicker />
                    </div>
                    <div className="flex items-center justify-center">
                    </div>
                  </div>
                </div>
              ) : (
                /* Desktop Layout - Single Row */
                <div className="flex items-center justify-between h-16 relative">
                  {/* Clock & Weather - Top Left */}
                  <div className="flex items-start gap-6 text-smart-contrast">
                    <div className="text-sm font-mono">
                      <div className="text-xs">{formatDate(currentTime)}</div>
                      <div className="text-sm font-medium">{formatTime(currentTime)}</div>
                    </div>
                    <WeatherDisplay />
                  </div>

                  {/* News Ticker - Top Right */}
                  <div className="flex items-center justify-end">
                    <NewsTicker />
                  </div>

                  {/* Centered Logo/Welcome */}
                  <div className="absolute left-1/2 transform -translate-x-1/2">
                    <Link
                      to="/"
                      onClick={handleLogoClick}
                      className="font-display text-3xl text-smart-contrast hover:text-yellow-300 transition-all duration-300 cursor-pointer hover:scale-105 tracking-tight"
                    >
                      <span
                        onMouseEnter={handleMouseEnter}
                        role="button"
                        aria-expanded={isMenuOpen}
                        aria-controls="nav-dropdown-menu"
                      >
                        {isHome ? welcomeText : navBrandName}
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dropdown Pills - Individual pill-shaped items */}
          <div
            id="nav-dropdown-menu"
            className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-out ${
              isMenuOpen ? 'top-20 opacity-100 pointer-events-auto' : 'top-16 opacity-0 pointer-events-none'
            } z-40`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="navigation"
            aria-label="Main navigation">
            <div className="space-y-3 min-w-64">
              {/* Search Bar Pill */}
              <div className={`glass-yellow-subtle px-6 py-3 transition-all duration-200 hover:scale-105 glass-hover-yellow ${
                selectedNavItem ? 'opacity-30' : 'opacity-100'
              }`}>
                <div className="rounded-full transition-all duration-300 text-white">
                  <SearchBar compact />
                </div>
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => handleNavClick(item.path)}
                  onMouseEnter={() => prefetchBackground(item.key)}
                  onMouseDown={() => prefetchBackground(item.key)}
                  className={`block glass-button px-6 py-4 text-center transition-all duration-200 hover:scale-105 text-white ${
                    location.pathname === item.path
                      ? 'glass-yellow !text-yellow-100'
                      : 'glass-hover-yellow'
                  } ${
                    selectedNavItem && selectedNavItem !== item.path
                      ? 'opacity-30'
                      : selectedNavItem === item.path
                      ? 'opacity-100 !scale-105'
                      : 'opacity-100'
                  }`}
                >
                  <span className="font-nav text-base text-smart-contrast">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;