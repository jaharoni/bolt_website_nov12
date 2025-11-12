import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Eye, Calendar, Tag, ArrowLeft, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';
import { essayService, Essay, EssaySection, EssayMedia } from '../lib/essayService';
import ImageService from '../lib/imageService';

const EssayDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [essay, setEssay] = useState<Essay | null>(null);
  const [sections, setSections] = useState<EssaySection[]>([]);
  const [sectionMedia, setSectionMedia] = useState<Record<string, EssayMedia[]>>({});
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (slug) {
      loadEssay();
    }
  }, [slug]);

  useEffect(() => {
    if (!loading && essay) {
      setIsVisible(true);
      essayService.incrementViewCount(essay.id);
    }
  }, [loading, essay]);

  const loadEssay = async () => {
    try {
      setLoading(true);
      const essayData = await essayService.getEssayBySlug(slug!);

      if (!essayData) {
        navigate('/essays');
        return;
      }

      setEssay(essayData);

      const sectionsData = await essayService.getEssaySections(essayData.id);
      setSections(sectionsData);

      const mediaBySection: Record<string, EssayMedia[]> = {};
      for (const section of sectionsData) {
        const media = await essayService.getSectionMedia(section.id);
        mediaBySection[section.id] = media;
      }
      setSectionMedia(mediaBySection);
    } catch (error) {
      console.error('Error loading essay:', error);
      navigate('/essays');
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (section: EssaySection, index: number) => {
    const media = sectionMedia[section.id] || [];

      switch (section.section_type) {
        case 'full-bleed': {
          return (
            <div key={section.id} className="w-full my-12">
              {media[0]?.media_item && (
                <div className="relative aspect-[21/9] overflow-hidden rounded-lg">
                  <img
                    src={ImageService.getOptimizedUrl(
                      media[0].media_item.bucket_name,
                      media[0].media_item.storage_path,
                      'fullscreen'
                    )}
                    alt={media[0].media_item.alt_text || media[0].media_item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {media[0].caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                      <p className="text-white/90 text-sm italic">{media[0].caption}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }

        case 'side-by-side': {
          return (
            <div key={section.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
              {media.slice(0, 2).map((item) => (
                <div key={item.id} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  {item.media_item && (
                    <>
                      <img
                        src={ImageService.getOptimizedUrl(
                          item.media_item.bucket_name,
                          item.media_item.storage_path,
                          'large'
                        )}
                        alt={item.media_item.alt_text || item.media_item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {item.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <p className="text-white/90 text-sm italic">{item.caption}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          );
        }

        case 'grid-2x2':
        case 'grid-3x3': {
          const cols = section.section_type === 'grid-2x2' ? 2 : 3;
          return (
            <div
              key={section.id}
              className={`grid grid-cols-1 md:grid-cols-${cols} gap-4 my-12`}
            >
              {media.map((item) => (
                <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg">
                  {item.media_item && (
                    <>
                      <img
                        src={ImageService.getOptimizedUrl(
                          item.media_item.bucket_name,
                          item.media_item.storage_path,
                          'medium'
                        )}
                        alt={item.media_item.alt_text || item.media_item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {item.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <p className="text-white/90 text-xs italic">{item.caption}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          );
        }

        case 'stacked': {
          return (
            <div key={section.id} className="space-y-8 my-12">
              {media.map((item) => (
                <div key={item.id} className="relative aspect-[16/9] overflow-hidden rounded-lg">
                  {item.media_item && (
                    <>
                      <img
                        src={ImageService.getOptimizedUrl(
                          item.media_item.bucket_name,
                          item.media_item.storage_path,
                          'large'
                        )}
                        alt={item.media_item.alt_text || item.media_item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {item.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <p className="text-white/90 text-sm italic">{item.caption}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          );
        }

        case 'text-block': {
          return (
            <div key={section.id} className="my-12 max-w-3xl mx-auto">
              <div
                className="prose prose-invert prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: section.content.html || section.content.text || '' }}
              />
            </div>
          );
        }

        default:
          return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-yellow-400 rounded-full animate-spin"></div>
          <p className="text-white/60 mt-4">Loading essay...</p>
        </div>
      </div>
    );
  }

  if (!essay) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="relative min-h-screen pb-8 px-4 pt-32">

      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <div className={`mb-8 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Link
            to="/essays"
            className="inline-flex items-center text-white/70 hover:text-yellow-400 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Essays
          </Link>
        </div>

        {/* Hero Section */}
        <div className={`mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '200ms' }}>
          {/* Featured Image */}
          {essay.featured_image && (
            <div className="relative aspect-[21/9] overflow-hidden rounded-2xl mb-8">
              <img
                src={ImageService.getOptimizedUrl(
                  essay.featured_image.bucket_name,
                  essay.featured_image.storage_path,
                  'fullscreen'
                )}
                alt={essay.featured_image.alt_text || essay.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <h1 className="text-4xl md:text-6xl font-light text-white mb-4">
                  {essay.title}
                </h1>
                {essay.subtitle && (
                  <p className="text-xl md:text-2xl text-white/95 font-light">
                    {essay.subtitle}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-white/60 text-sm mb-8">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(essay.published_at || essay.created_at)}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {essay.read_time_minutes} min read
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              {essay.view_count} views
            </div>
          </div>

          {/* Tags */}
          {essay.tags && essay.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {essay.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/essays?tag=${tag}`}
                  className="glass-badge text-white/70 hover:text-yellow-400 hover:border-yellow-400/50 px-3 py-1 rounded-full text-sm transition-colors duration-300"
                >
                  <Tag className="w-3 h-3 inline mr-1" />
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Excerpt */}
          {essay.excerpt && (
            <div className="glass-card p-8">
              <p className="text-lg text-white/90 leading-relaxed font-light">
                {essay.excerpt}
              </p>
            </div>
          )}
        </div>

        {/* Essay Content Sections */}
        <div className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`} style={{ transitionDelay: '400ms' }}>
          {sections.map((section, index) => renderSection(section, index))}
        </div>

        {/* Back to Essays CTA */}
        <div className={`glass-card p-8 text-center mt-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '600ms' }}>
          <p className="text-white/90 mb-6 text-lg">Enjoyed this essay?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/essays" className="btn-primary glass-button-enhanced">
              Explore More Essays
            </Link>
            <Link to="/contact" className="btn-secondary glass-button-enhanced">
              Commission Your Story
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EssayDetail;
