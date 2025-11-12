import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, Eye, Calendar, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { essayService, Essay } from '../lib/essayService';
import ImageService from '../lib/imageService';
import { createWebPageSchema } from '../lib/structuredData';

const Essays: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [searchParams] = useSearchParams();
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || 'all');
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    setIsVisible(true);
    loadEssays();
  }, []);

  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam) {
      setSelectedTag(tagParam);
    }
  }, [searchParams]);

  const loadEssays = async () => {
    try {
      setLoading(true);
      const data = await essayService.getPublishedEssays();
      setEssays(data);

      const tags = new Set<string>();
      data.forEach(essay => {
        if (essay.tags) {
          essay.tags.forEach(tag => tags.add(tag));
        }
      });
      setAvailableTags(['all', ...Array.from(tags).sort()]);
    } catch (error) {
      console.error('Error loading essays:', error);
    } finally {
      setLoading(false);
      // Trigger content animation after loading
      setTimeout(() => setContentVisible(true), 50);
    }
  };

  const filteredEssays = selectedTag === 'all'
    ? essays
    : essays.filter(essay => essay.tags && essay.tags.includes(selectedTag));

  const featuredEssay = essays.find(essay => essay.is_featured);
  const regularEssays = filteredEssays.filter(essay => !essay.is_featured);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEssayImage = (essay: Essay) => {
    if (essay.featured_image) {
      return ImageService.getOptimizedUrl(
        essay.featured_image.bucket_name,
        essay.featured_image.storage_path,
        'large'
      );
    }
    return 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800';
  };

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://justinaharoni.com';


  const featuredImage = featuredEssay ? getEssayImage(featuredEssay) : 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1200';

  return (
    <div className="relative min-h-screen pb-32 px-4 pt-32">
      <SEO
        title="Essays"
        description="Deep dives into the human condition through visual storytelling. Explore essays combining photography and narrative by Justin Aharoni."
        keywords={['photography essays', 'visual storytelling', 'photo essays', 'photography blog', 'creative writing', 'documentary photography']}
        url={`${siteUrl}/essays`}
        image={featuredImage}
        structuredData={createWebPageSchema(
          'Essays - Visual Storytelling by Justin Aharoni',
          'Deep dives into the human condition where every photograph becomes a chapter and every story reveals something profound.',
          `${siteUrl}/essays`,
          [
            { name: 'Home', url: siteUrl },
            { name: 'Essays', url: `${siteUrl}/essays` }
          ]
        )}
      />
      <div className="max-w-5xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h1 className="text-section-title text-white/98 mb-6 text-smart-contrast">
            Essays
          </h1>
          <p className="text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
            <span className="font-display text-xl text-white/98 tracking-wide text-smart-contrast">Deep dives into the human condition</span>
            <br />
            <span className="text-white/85 font-body text-base text-smart-contrast">where every photograph becomes a chapter and every story reveals something profound about who we are</span>
          </p>
        </div>

        {essays.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg">No essays published yet. Check back soon!</p>
          </div>
        ) : (
          <>
            {featuredEssay && selectedTag === 'all' && (
              <div className={`mb-16 transition-all duration-1000 ${
                contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} style={{ transitionDelay: '200ms' }}>
                <div className="glass-card overflow-hidden glass-hover card-hover transition-all duration-500">
                  <div className="lg:flex">
                    <div className="lg:w-1/2">
                      <div className="aspect-video lg:aspect-square overflow-hidden relative">
                        <img
                          src={getEssayImage(featuredEssay)}
                          alt={featuredEssay.title}
                          loading="eager"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-700 hover:will-change-transform hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className="glass-badge text-yellow-300 border-yellow-400/50 bg-yellow-400/20 px-3 py-1 rounded-full text-xs font-medium">
                            Featured
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                      <h2 className="text-3xl md:text-4xl font-light text-white/98 mb-3">
                        {featuredEssay.title}
                      </h2>
                      {featuredEssay.subtitle && (
                        <p className="text-xl text-white/95 font-light mb-6">
                          {featuredEssay.subtitle}
                        </p>
                      )}
                      {featuredEssay.excerpt && (
                        <p className="text-white/90 leading-relaxed mb-6">
                          {featuredEssay.excerpt}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-6 text-white/60 text-sm mb-6">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {featuredEssay.read_time_minutes} min read
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-2" />
                          {featuredEssay.view_count} views
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(featuredEssay.published_at || featuredEssay.created_at)}
                        </div>
                      </div>

                      <Link to={`/essays/${featuredEssay.slug}`}>
                        <button className="group self-start btn-primary auto-shimmer flex items-center">
                          View Essay
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12" style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
              {regularEssays.slice(0, 2).map((essay, index) => (
                <Link
                  key={essay.id}
                  to={`/essays/${essay.slug}`}
                  className={`group glass-card overflow-hidden glass-hover card-hover transition-all duration-700 hover:scale-105 ${
                    contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                  }`}
                  style={{
                    transitionDelay: `${400 + index * 100}ms`
                  }}
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={getEssayImage(essay)}
                      alt={essay.title}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:will-change-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {essay.tags && essay.tags.length > 0 && (
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {essay.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="glass-badge text-smart-contrast px-2 py-1 rounded-full text-xs font-medium border-white/30">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-light text-white/98 mb-2">
                      {essay.title}
                    </h3>
                    {essay.subtitle && (
                      <p className="text-base text-white/95 font-light mb-3">
                        {essay.subtitle}
                      </p>
                    )}
                    {essay.excerpt && (
                      <p className="text-white/85 text-sm leading-relaxed mb-4 line-clamp-2">
                        {essay.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-white/50 text-xs mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {essay.read_time_minutes} min
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {essay.view_count}
                        </div>
                      </div>
                      <div>{formatDate(essay.published_at || essay.created_at)}</div>
                    </div>

                    <button className="group self-start btn-secondary flex items-center">
                      <span>View Essay</span>
                      <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>

            {regularEssays.length > 2 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 justify-items-center" style={{ contentVisibility: 'auto', containIntrinsicSize: '500px' }}>
                {regularEssays.slice(2, 5).map((essay, index) => (
                  <Link
                    key={essay.id}
                    to={`/essays/${essay.slug}`}
                    className={`group glass-card overflow-hidden glass-hover card-hover transition-all duration-700 hover:scale-105 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                    style={{
                      transitionDelay: `${600 + index * 100}ms`
                    }}
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={getEssayImage(essay)}
                        alt={essay.title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:will-change-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {essay.tags && essay.tags.length > 0 && (
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                          {essay.tags.slice(0, 1).map((tag) => (
                            <span key={tag} className="glass-badge text-smart-contrast px-2 py-1 rounded-full text-xs font-medium border-white/30">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-base font-light text-white mb-1 line-clamp-2">
                        {essay.title}
                      </h3>
                      {essay.subtitle && (
                        <p className="text-sm text-white/70 font-light mb-3 line-clamp-1">
                          {essay.subtitle}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-white/50 text-xs mb-3">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {essay.read_time_minutes} min
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {essay.view_count}
                        </div>
                      </div>

                      <button className="group w-full btn-small flex items-center justify-center text-xs">
                        <span>View</span>
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className={`text-center mt-16 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '1100ms' }}>
              <p className="font-display text-xl text-white/80 mb-8 leading-relaxed">
                Inspired by these stories?
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                <Link
                  to="/contact"
                  className="btn-section glass-button-enhanced"
                >
                  Commission Your Story
                </Link>
                <Link
                  to="/gallery"
                  className="btn-section glass-button-enhanced"
                >
                  View Portfolio
                </Link>
                <Link
                  to="/shop"
                  className="btn-section glass-button-enhanced"
                >
                  Browse Prints
                </Link>
              </div>
            </div>

            <div className={`glass-card p-8 mt-16 mb-24 text-center transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '1300ms' }}>
              <h2 className="text-card-title text-white mb-4">
                Stay Updated
              </h2>
              <p className="text-body text-white/70 mb-6">
                Get notified when new essays are published
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 input-glass glass-input-enhanced rounded-full px-4 py-3"
                />
                <button className="btn-primary glass-button-enhanced">
                  <span>Subscribe</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Essays;
