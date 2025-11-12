import React, { useEffect, useState } from 'react';
import { Camera, Users, Heart, ShoppingBag, ExternalLink, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { createPortfolioSchema, createWebPageSchema } from '../lib/structuredData';

const Gallery: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('commercial');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const sections = [
    {
      id: 'commercial',
      title: 'Commercial',
      icon: <Camera className="w-5 h-5" />,
      description: 'Brand campaigns, corporate events, and professional photography'
    },
    {
      id: 'event',
      title: 'Event',
      icon: <Users className="w-5 h-5" />,
      description: 'Weddings, celebrations, and special moments captured'
    },
    {
      id: 'personal',
      title: 'Personal',
      icon: <Heart className="w-5 h-5" />,
      description: 'Artistic work and limited edition prints available for purchase'
    }
  ];

  const galleryItems = {
    commercial: [
      {
        id: 1,
        title: "Tech Startup Campaign",
        type: "photography",
        image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Complete brand identity shoot for emerging tech company",
        recent: true
      },
      {
        id: 2,
        title: "Corporate Event Coverage",
        type: "photography",
        image: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Annual conference and networking event documentation",
        recent: true
      },
      {
        id: 3,
        title: "Product Launch Video",
        type: "video",
        image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Dynamic promotional content for new product line",
        recent: true
      },
      {
        id: 4,
        title: "Restaurant Brand Story",
        type: "photography",
        image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Culinary photography and brand storytelling",
        recent: false
      },
      {
        id: 13,
        title: "Fashion Lookbook",
        type: "photography",
        image: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Seasonal collection photography for boutique brand",
        recent: false
      },
      {
        id: 14,
        title: "Architecture Showcase",
        type: "photography",
        image: "https://images.pexels.com/photos/3184639/pexels-photo-3184639.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Modern building photography for real estate firm",
        recent: false
      }
    ],
    event: [
      {
        id: 5,
        title: "Intimate Wedding Ceremony",
        type: "photography",
        image: "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Beautiful outdoor ceremony and reception coverage",
        recent: true
      },
      {
        id: 6,
        title: "Music Festival Documentation",
        type: "photography",
        image: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Live performance and crowd energy capture",
        recent: true
      },
      {
        id: 7,
        title: "Corporate Gala",
        type: "photography",
        image: "https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Elegant evening event with award presentations",
        recent: true
      },
      {
        id: 8,
        title: "Birthday Celebration",
        type: "photography",
        image: "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Joyful family gathering and milestone celebration",
        recent: false
      },
      {
        id: 15,
        title: "Art Gallery Opening",
        type: "photography",
        image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Contemporary art exhibition launch event",
        recent: false
      },
      {
        id: 16,
        title: "Charity Fundraiser",
        type: "photography",
        image: "https://images.pexels.com/photos/3184432/pexels-photo-3184432.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Annual benefit dinner and auction coverage",
        recent: false
      }
    ],
    personal: [
      {
        id: 9,
        title: "Urban Solitude Series",
        type: "photography",
        price: 150,
        image: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Limited edition architectural photography prints",
        available: true,
        recent: true
      },
      {
        id: 10,
        title: "Golden Hour Portraits",
        type: "photography",
        price: 200,
        image: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Intimate portrait series capturing natural light",
        available: true,
        recent: true
      },
      {
        id: 11,
        title: "Abstract Landscapes",
        type: "photography",
        price: 175,
        image: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Experimental landscape photography collection",
        available: false,
        recent: true
      },
      {
        id: 12,
        title: "Street Life Chronicles",
        type: "photography",
        price: 125,
        image: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Documentary-style street photography series",
        available: true,
        recent: false
      },
      {
        id: 17,
        title: "Night Market Stories",
        type: "photography",
        price: 100,
        image: "https://images.pexels.com/photos/3184394/pexels-photo-3184394.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Cultural documentation of evening commerce",
        available: true,
        recent: false
      },
      {
        id: 18,
        title: "Minimalist Interiors",
        type: "photography",
        price: 225,
        image: "https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Clean architectural space photography",
        available: false,
        recent: false
      }
    ]
  };

  const getIcon = (type: string) => {
    return type === 'video' ? <Play className="w-4 h-4" /> : <Camera className="w-4 h-4" />;
  };

  // Separate recent and past items
  const currentItems = galleryItems[activeSection as keyof typeof galleryItems];
  const recentItems = currentItems.filter(item => item.recent);
  const pastItems = currentItems.filter(item => !item.recent);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://justinaharoni.com';

  return (
    <div className="relative min-h-screen pb-32 px-4 pt-32">
      <SEO
        title="Photography Gallery"
        description="Explore Justin Aharoni's portfolio featuring commercial photography, event coverage, and personal artistic work. Professional photography services for brands, weddings, and special occasions."
        keywords={['photography portfolio', 'commercial photography', 'event photography', 'wedding photography', 'brand photography', 'professional photographer gallery']}
        url={`${siteUrl}/gallery`}
        structuredData={createPortfolioSchema(siteUrl)}
      />
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h1 className="text-section-title text-white/98 mb-6 text-smart-contrast">
            Gallery
          </h1>
          <p className="text-lg text-white/90 max-w-3xl mx-auto">
            <span className="font-display text-xl text-white/98 tracking-wide text-smart-contrast">Where brands come alive, celebrations become legends,</span>
            <br />
            <span className="text-white/85 font-body text-base text-smart-contrast">and personal visions transform into art that moves people</span>
          </p>
        </div>

        {/* Section Navigation */}
        <div className={`flex flex-wrap justify-center gap-4 mb-12 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '200ms' }}>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 btn-section ${
                activeSection === section.id
                  ? 'active glass-button-active'
                  : ''
              }`}
            >
              {section.icon}
              {section.title}
            </button>
          ))}
        </div>

        {/* Section Description */}
        <div className={`text-center mb-12 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '300ms' }}>
          <p className="text-white/85 text-lg mb-2 text-smart-contrast">
            {sections.find(s => s.id === activeSection)?.description}
          </p>
          {activeSection === 'personal' && (
            <p className="text-white/75 text-sm italic text-smart-contrast">
              Some items available for purchase
            </p>
          )}
        </div>

        {/* Recent Work - Large Grid */}
        {recentItems.length > 0 && (
          <div className="mb-16">
            <h2 className={`text-card-title text-white mb-12 text-center transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '350ms' }}>Recent Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`group glass-card overflow-hidden glass-hover card-hover transition-all duration-700 hover:scale-105 h-full flex flex-col ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                  }`}
                  style={{
                    transitionDelay: `${400 + index * 100}ms`
                  }}
                >
                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                    {/* Media Type Indicator */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="glass-button glass-button-enhanced p-2 text-white">
                        {getIcon(item.type)}
                      </div>
                    </div>

                    {/* Availability Badge for Personal Section */}
                    {activeSection === 'personal' && 'available' in item && (
                      <div className="absolute top-3 left-3">
                        <span className={`glass-badge px-2 py-1 rounded-full text-xs font-medium ${
                          item.available
                            ? 'text-green-300 border-green-500/30'
                            : 'text-red-300 border-red-500/30'
                        }`}>
                          {item.available ? 'Available' : 'Sold Out'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-white/98 font-semibold mb-3 text-lg">
                      {item.title}
                    </h3>
                    <p className="text-white/85 text-sm mb-6 line-clamp-3 flex-1">
                      {item.description}
                    </p>

                    {/* Action Button */}
                    <button className="w-full btn-secondary glass-button-enhanced text-sm flex items-center justify-center gap-2 mt-auto">
                      <ExternalLink className="w-4 h-4" />
                      Take a Look
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Work - Smaller Grid */}
        {pastItems.length > 0 && (
          <div className="mb-16">
            <h2 className={`text-card-title text-white/80 mb-8 text-center transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '550ms' }}>Past Work</h2>
            <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
              {pastItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`group glass-card overflow-hidden glass-hover card-hover transition-all duration-700 hover:scale-105 h-full flex flex-col w-64 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{
                    transitionDelay: `${600 + index * 50}ms`
                  }}
                >
                  {/* Image */}
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                    {/* Media Type Indicator */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="glass-button glass-button-enhanced p-1.5 text-white">
                        {getIcon(item.type)}
                      </div>
                    </div>

                    {/* Availability Badge for Personal Section */}
                    {activeSection === 'personal' && 'available' in item && (
                      <div className="absolute top-2 left-2">
                        <span className={`glass-badge px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          item.available
                            ? 'text-green-300 border-green-500/30'
                            : 'text-red-300 border-red-500/30'
                        }`}>
                          {item.available ? 'Available' : 'Sold Out'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-white font-medium mb-2 text-sm line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Action Button */}
                    <button className="w-full btn-ghost text-xs flex items-center justify-center gap-1 mt-auto">
                      <ExternalLink className="w-3 h-3" />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Items Message */}
        {recentItems.length === 0 && pastItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-white/60 text-lg">
              No items in this section yet.
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className={`glass-card p-8 mt-16 mb-24 text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '800ms' }}>
          <h2 className="text-card-title text-white mb-4">
            Interested in working together?
          </h2>
          <p className="text-body text-white/70 mb-6">
            Let's discuss your next project or browse available prints
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="btn-section glass-button-enhanced"
            >
              Start a Project
            </Link>
            <Link
              to="/shop"
              className="btn-section glass-button-enhanced"
            >
              Browse Shop
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Gallery;
