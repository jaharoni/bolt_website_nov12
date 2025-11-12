import React, { useEffect, useState } from 'react';
import { Camera, Film, Palette, Award, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { getBrandLogos, BrandLogo } from '../lib/brandLogos';
import { createPersonSchema, createWebPageSchema } from '../lib/structuredData';

const About: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [brandLogos, setBrandLogos] = useState<BrandLogo[]>([]);

  useEffect(() => {
    setIsVisible(true);
    setBrandLogos(getBrandLogos());
  }, []);

  const skills = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Photography",
      description: "Commercial, live event, and artistic photography"
    },
    {
      icon: <Film className="w-6 h-6" />,
      title: "Video Production",
      description: "From concept to final cut, creating compelling visual narratives"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Digital Media",
      description: "Motion graphics, VFX, and cutting-edge visual experimentation"
    }
  ];

  const experience = [
    {
      year: "2024",
      title: "Creative Director",
      company: "Independent Practice",
      description: "Full-service visual storytelling for brands and individuals"
    },
    {
      year: "2020-2023",
      title: "Senior Visual Producer",
      company: "Various Agencies",
      description: "Led creative campaigns for major brands and cultural institutions"
    },
    {
      year: "2015-2020",
      title: "Photographer & Filmmaker",
      company: "Freelance",
      description: "Built reputation through documentary work and commercial projects"
    }
  ];

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://justinaharoni.com';

  return (
    <div className="relative min-h-screen pb-32 px-4 pt-32">
      <SEO
        title="About Justin Aharoni"
        description="Visual storyteller and professional photographer based in North Fork, Long Island. Specializing in commercial, event, and personal photography with a focus on authentic storytelling and human connection."
        keywords={['about Justin Aharoni', 'photographer bio', 'visual storyteller', 'North Fork photographer', 'Long Island photographer', 'professional photographer NYC']}
        url={`${siteUrl}/about`}
        structuredData={createWebPageSchema(
          'About Justin Aharoni - Visual Storyteller',
          'Learn about Justin Aharoni, a professional photographer and filmmaker specializing in commercial, event, and artistic photography.',
          `${siteUrl}/about`,
          [
            { name: 'Home', url: siteUrl },
            { name: 'About', url: `${siteUrl}/about` }
          ]
        )}
      />
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h1 className="text-section-title text-white/98 mb-6 text-smart-contrast">
            About
          </h1>
        </div>

        {/* Bio Section */}
        <div className={`glass-card p-8 mb-12 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '200ms' }}>
          <div className="prose prose-invert max-w-none">
            <p className="font-display text-lg text-white/95 mb-6 leading-relaxed tracking-wide">
              I believe in the power of visual storytelling to connect, inspire, and transform. Whether capturing a quiet moment or orchestrating a full production, I approach every project with the same commitment to finding and elevating the authentic story within each frame.
            </p>
            <p className="font-display text-lg text-white/95 mb-6 leading-relaxed tracking-wide">
              My approach combines technical expertise with genuine curiosity about the human experience. Whether I'm capturing live events, developing a brand campaign, or experimenting with digital media, I'm always looking for the story that wants to be told.
            </p>
            <p className="font-display text-lg text-white/95 leading-relaxed tracking-wide">
              Recently relocated to the North Fork of Long Island, I've found that the clarity of mind this area provides—while still being in close proximity to NYC—has become essential to my creative process. The balance between peaceful surroundings and urban energy shapes how I see and capture the world.
            </p>
          </div>
        </div>

        {/* Skills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {skills.map((skill, index) => (
            <div
              key={skill.title}
              className={`glass-card p-6 glass-hover card-hover transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${600 + index * 100}ms` }}
            >
              <div className="text-yellow-200/90 mb-4">
                {skill.icon}
              </div>
              <h3 className="text-card-title text-white/98 mb-2">
                {skill.title}
              </h3>
              <p className="text-body text-white/90">
                {skill.description}
              </p>
            </div>
          ))}
        </div>

        {/* Brand Collaborators */}
        <div className={`border-t border-white/10 pt-12 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '700ms' }}>
          <h2 className="text-card-title text-white/98 mb-12 text-center">Past Collaborators</h2>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-8 items-center justify-items-center mb-8 max-w-4xl mx-auto">
            {brandLogos.map((brand, index) => (
              <div
                key={brand.name}
                className="group relative w-32 h-20 glass-card flex items-center justify-center hover:bg-white/5 transition-all duration-500 hover:scale-110 p-4"
                style={{
                  transitionDelay: `${800 + index * 50}ms`,
                  backgroundColor: `${brand.fallbackColor}20`
                }}
                title={brand.name}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white/80 group-hover:text-white transition-colors duration-300 mb-1">
                    {brand.initials}
                  </div>
                  <div className="text-xs text-white/50 group-hover:text-white/70 transition-colors duration-300">
                    {brand.name}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Contact CTA */}
        <div className={`glass-card p-8 text-center mt-12 mb-24 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '1100ms' }}>
          <p className="text-body-large text-white/95 mb-6">
            Ready to create something together?
          </p>
          <div className="flex justify-center space-x-6">
            <Link
              to="/contact"
              className="btn-section glass-button-enhanced"
            >
              Get In Touch
            </Link>
            <Link
              to="/shop"
              className="btn-section glass-button-enhanced"
            >
              Browse Prints
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;