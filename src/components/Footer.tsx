import React, { useState, useEffect } from 'react';
import { Instagram, Twitter, Linkedin, Mail, ExternalLink } from 'lucide-react';
import { useTextBlock } from '../hooks/useTextBlock';

const Footer: React.FC = () => {
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const footerQuote = useTextBlock("footer.quote", "eat more waffles");
  const footerCopyright = useTextBlock("footer.copyright", `© ${new Date().getFullYear()} Justin Aharoni`);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

      const fadeStart = 0.85;
      const opacity = Math.max(0, Math.min(1, (scrollPercent - fadeStart) / (1 - fadeStart)));
      setScrollOpacity(opacity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
    const socialLinks = [
      {
        name: 'Instagram',
        icon: <Instagram className="w-5 h-5" />,
        url: 'https://instagram.com/justinaharoni',
        color: 'hover:text-pink-400',
      },
      {
        name: 'Twitter',
        icon: <Twitter className="w-5 h-5" />,
        url: 'https://x.com/justinaharoni',
        color: 'hover:text-sky-400',
      },
      {
        name: 'LinkedIn',
        icon: <Linkedin className="w-5 h-5" />,
        url: 'https://www.linkedin.com/in/justinaharoni',
        color: 'hover:text-blue-400',
      },
      {
        name: 'Email',
        icon: <Mail className="w-5 h-5" />,
        url: 'mailto:contact@jaharoni.com',
        color: 'hover:text-green-400',
      },
    ];

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-40 py-6 px-4 backdrop-blur-xl bg-black/30 border-t border-white/10 transition-all duration-500 pointer-events-none"
      style={{
        opacity: scrollOpacity,
        transform: `translateY(${(1 - scrollOpacity) * 20}px)`
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-6">
          {/* Social Links */}
          <div className="flex items-center justify-center gap-6 md:flex-1 pointer-events-auto">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-white/60 ${link.color} transition-all duration-300 hover:scale-110 group`}
                aria-label={link.name}
              >
                <div className="relative">
                  {link.icon}
                  <ExternalLink className="w-3 h-3 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>

          {/* Quote */}
          <div className="text-center md:flex-1">
            <p className="text-quote text-white/80">
              {footerQuote}
            </p>
            <p className="text-caption text-white/40 mt-1">
              {footerCopyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;