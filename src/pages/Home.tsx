import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBarNew";
import SEO from "../components/SEO";
import { createPersonSchema } from "../lib/structuredData";

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://justinaharoni.com';
  const featuredImage = 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1200';

  return (
    <>
      <SEO
        title="Justin Aharoni - Visual Storyteller"
        description="Professional photographer and filmmaker specializing in commercial photography, event coverage, and artistic visual storytelling. Turning moments into magic, one frame at a time."
        keywords={['photographer', 'visual storyteller', 'commercial photography', 'event photography', 'wedding photographer', 'North Fork photographer', 'Long Island photographer', 'NYC photographer']}
        image={featuredImage}
        url={siteUrl}
        structuredData={createPersonSchema(siteUrl)}
      />


      <div className="relative z-10 min-h-screen pb-8 px-4 pt-32">
        <div className="max-w-4xl mx-auto flex items-center min-h-[calc(100vh-8rem)]">
          <div className="text-center space-y-12 w-full">
            <div className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="space-y-4">
                <h1 className="text-hero text-white text-smart-contrast font-display">
                  Justin Aharoni
                </h1>
                <p className="text-hero-sub text-white/90 text-smart-contrast">
                  <span className="font-display text-xl text-white/95 tracking-wide">Turning moments into magic, one frame at a time</span>
                </p>
              </div>
              <div className="mt-8 space-y-6">
  {/* Search Bar - Centered */}
  <div className="flex justify-center w-full mb-8">
    <SearchBar />
  </div>

  {/* Carousel Navigation Controls - Separate container below */}
  <div className="flex justify-center items-center gap-6">
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('backgroundPrev'))}
      className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-200"
      aria-label="Previous background"
    >
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('backgroundNext'))}
      className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-200"
      aria-label="Next background"
    >
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>

              </div>

              <div className="flex justify-center space-x-12 pt-8">
                {[
                  { to: "/about", label: "About" },
                  { to: "/gallery", label: "Gallery" },
                  { to: "/contact", label: "Contact" }
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-white/95 hover:text-yellow-400 text-nav-large transition-all duration-300 hover:scale-105 relative group small-caps-enhanced text-smart-contrast"
                  >
                    {link.label}
                    <div className="absolute bottom-0 left-1/2 w-0 h-px bg-yellow-400 transition-all duration-500 group-hover:w-full transform -translate-x-1/2" />
                  </Link>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6 border-t border-white/10">
                <Link to="/contact" className="btn-section glass-button-enhanced">
                  Ready to work together?
                </Link>
                <Link to="/shop" className="btn-section glass-button-enhanced">
                  Browse prints & downloads
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
