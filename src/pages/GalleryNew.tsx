import React, { useEffect, useState } from 'react';
import { Camera, ExternalLink, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import ImageService from '../lib/imageService';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  featured: boolean;
  thumbnail_url?: string;
  media_count: number;
}

interface ProjectWithMedia extends Project {
  media: Array<{
    id: string;
    public_url: string;
    storage_path: string;
    bucket_name: string;
    title: string;
    alt_text: string;
  }>;
}

const GalleryNew: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectWithMedia | null>(null);

  useEffect(() => {
    setIsVisible(true);
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery_projects')
        .select(`
          *,
          thumbnail:media_items!gallery_projects_thumbnail_media_id_fkey(public_url),
          project_media(count)
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.warn('Gallery projects table not yet populated:', error.message);
        setProjects([]);
      } else {
        const projectsWithData = data?.map(p => ({
          ...p,
          thumbnail_url: p.thumbnail?.public_url,
          media_count: p.project_media?.[0]?.count || 0
        })) || [];
        setProjects(projectsWithData);
      }
    } catch (err) {
      console.warn('Error loading gallery projects:', err);
      setProjects([]);
    }
    setLoading(false);
  };

  const loadProjectMedia = async (project: Project) => {
    const { data, error } = await supabase
      .from('project_media')
      .select(`
        media_items(id, public_url, storage_path, bucket_name, title, alt_text)
      `)
      .eq('project_id', project.id)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error loading project media:', error);
      return;
    }

    const mediaItems = data?.map(pm => pm.media_items).filter(Boolean) || [];
    setSelectedProject({
      ...project,
      media: mediaItems as any[]
    });
  };

  const categories = ['all', ...new Set(projects.map(p => p.category))];

  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  const featuredProjects = filteredProjects.filter(p => p.featured);
  const regularProjects = filteredProjects.filter(p => !p.featured);

  return (
    <div className="relative min-h-screen pb-8 px-4 pt-32">
      <SEO
        title="Gallery"
        description="Explore Justin Aharoni's photography portfolio featuring commercial work, event coverage, brand photography, and personal artistic projects. Professional photography serving NYC, Long Island, and beyond."
        keywords={['photography portfolio', 'commercial photography', 'event photography', 'brand photography', 'wedding photography', 'corporate photography', 'professional photographer']}
      />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h1 className="text-section-title text-white mb-6">
            Gallery
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            <span className="font-display text-xl text-white/90 tracking-wide">Where brands come alive, celebrations become legends,</span>
            <br />
            <span className="text-white/60 font-body text-base">and personal visions transform into art that moves people</span>
          </p>
        </div>

        <div className={`flex flex-wrap justify-center gap-4 mb-12 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '200ms' }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex items-center gap-2 btn-section ${
                activeCategory === category ? 'active glass-button-active' : ''
              }`}
            >
              <Camera className="w-4 h-4" />
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : (
          <>
            {featuredProjects.length > 0 && (
              <div className="mb-16" style={{ contentVisibility: 'auto', containIntrinsicSize: '1000px' }}>
                <h2 className="text-card-title text-white mb-12 text-center">Featured Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredProjects.map((project, index) => (
                    <div
                      key={project.id}
                      onClick={() => loadProjectMedia(project)}
                      className={`group glass-card overflow-hidden glass-hover card-hover transition-all duration-500 hover:scale-105 h-full flex flex-col cursor-pointer ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                      }`}
                      style={{ transitionDelay: `${400 + index * 100}ms` }}
                    >
                      <div className="aspect-[4/3] overflow-hidden relative bg-gray-800">
                        {project.thumbnail_url ? (
                          <img
                            src={project.thumbnail_url.includes('/storage/v1/object/public/')
                              ? ImageService.getOptimizedUrl(
                                  project.thumbnail_url.split('/').slice(-2)[0],
                                  project.thumbnail_url.split('/').slice(-1)[0],
                                  'medium'
                                )
                              : project.thumbnail_url
                            }
                            srcSet={project.thumbnail_url.includes('/storage/v1/object/public/')
                              ? ImageService.getResponsiveSrcSet(
                                  project.thumbnail_url.split('/').slice(-2)[0],
                                  project.thumbnail_url.split('/').slice(-1)[0]
                                )
                              : undefined
                            }
                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                            alt={project.title}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:will-change-transform group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-16 h-16 text-white/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                        <div className="absolute bottom-3 right-3">
                          <span className="glass-badge px-2 py-1 text-xs">
                            {project.media_count} images
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-white font-semibold mb-3 text-lg">
                          {project.title}
                        </h3>
                        <p className="text-white/60 text-sm mb-6 line-clamp-3 flex-1">
                          {project.description}
                        </p>

                        <button className="w-full btn-secondary glass-button-enhanced text-sm flex items-center justify-center gap-2 mt-auto">
                          <ExternalLink className="w-4 h-4" />
                          View Project
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {regularProjects.length > 0 && (
              <div className="mb-16" style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
                {featuredProjects.length > 0 && (
                  <h2 className="text-card-title text-white/80 mb-8 text-center">More Projects</h2>
                )}
                <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
                  {regularProjects.map((project, index) => (
                    <div
                      key={project.id}
                      onClick={() => loadProjectMedia(project)}
                      className={`group glass-card overflow-hidden glass-hover card-hover transition-all duration-500 hover:scale-105 h-full flex flex-col w-64 cursor-pointer ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                      }`}
                      style={{ transitionDelay: `${600 + index * 50}ms` }}
                    >
                      <div className="aspect-square overflow-hidden relative bg-gray-800">
                        {project.thumbnail_url ? (
                          <img
                            src={project.thumbnail_url.includes('/storage/v1/object/public/')
                              ? ImageService.getOptimizedUrl(
                                  project.thumbnail_url.split('/').slice(-2)[0],
                                  project.thumbnail_url.split('/').slice(-1)[0],
                                  'small'
                                )
                              : project.thumbnail_url
                            }
                            srcSet={project.thumbnail_url.includes('/storage/v1/object/public/')
                              ? ImageService.getResponsiveSrcSet(
                                  project.thumbnail_url.split('/').slice(-2)[0],
                                  project.thumbnail_url.split('/').slice(-1)[0]
                                )
                              : undefined
                            }
                            sizes="264px"
                            alt={project.title}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:will-change-transform group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-12 h-12 text-white/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                        <div className="absolute bottom-2 right-2">
                          <span className="glass-badge px-1.5 py-0.5 text-xs">
                            {project.media_count}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-white font-medium mb-2 text-sm line-clamp-2">
                          {project.title}
                        </h3>

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

            {filteredProjects.length === 0 && (
              <div className="text-center py-16">
                <Camera className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/60 text-lg">
                  No projects found in this category yet.
                </p>
              </div>
            )}
          </>
        )}

        <div className={`glass-card p-8 mt-16 text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '800ms' }}>
          <h2 className="text-card-title text-white mb-4">
            Interested in working together?
          </h2>
          <p className="text-body text-white/70 mb-6">
            Let's discuss your next project or browse available prints
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-section glass-button-enhanced">
              Start a Project
            </Link>
            <Link to="/shop" className="btn-section glass-button-enhanced">
              Browse Shop
            </Link>
          </div>
        </div>
      </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
          <div className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{selectedProject.title}</h2>
                  <p className="text-white/60">{selectedProject.description}</p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-white hover:text-white/60 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedProject.media.map((media) => (
                  <div key={media.id} className="aspect-square">
                    <img
                      src={ImageService.getOptimizedUrl(
                        media.bucket_name,
                        media.storage_path,
                        'large'
                      )}
                      srcSet={ImageService.getResponsiveSrcSet(
                        media.bucket_name,
                        media.storage_path
                      )}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      alt={media.alt_text || media.title}
                      className="w-full h-full object-cover rounded"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryNew;
