import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveBackgroundsForPage } from '../../lib/bg/resolveBackgrounds';
import { backgroundService } from '../../lib/bg/BackgroundService';

export function BackgroundRoot() {
  const location = useLocation();
  const [currentImage, setCurrentImage] = useState<string>('');
  const [nextImage, setNextImage] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentPageRef = useRef<string>('');
  const currentUrlsRef = useRef<string[]>([]);
  const currentIndexRef = useRef<number>(0);
  const carouselEnabledRef = useRef<boolean>(false);
  const carouselIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselIntervalMsRef = useRef<number>(7000);
  const abortControllerRef = useRef<AbortController | null>(null);

  const transitionToImage = (url: string) => {
    if (url === currentImage || url === nextImage) return;

    // Preload in background without blocking transition
    backgroundService.preload(url).catch(() => {});

    if (abortControllerRef.current?.signal.aborted) return;

    // Start transition immediately
    setNextImage(url);
    setIsTransitioning(true);
  };

  const handleTransitionEnd = () => {
    if (isTransitioning && nextImage) {
      setCurrentImage(nextImage);
      setIsTransitioning(false);
      setNextImage('');
    }
  };

  const navigateToNext = async () => {
    if (currentUrlsRef.current.length <= 1) return;

    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
      carouselIntervalRef.current = null;
    }

    currentIndexRef.current = (currentIndexRef.current + 1) % currentUrlsRef.current.length;
    const nextUrl = currentUrlsRef.current[currentIndexRef.current];

    transitionToImage(nextUrl);

    if (carouselEnabledRef.current) {
      startCarousel();
    }
  };

  const navigateToPrev = async () => {
    if (currentUrlsRef.current.length <= 1) return;

    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
      carouselIntervalRef.current = null;
    }

    currentIndexRef.current = (currentIndexRef.current - 1 + currentUrlsRef.current.length) % currentUrlsRef.current.length;
    const prevUrl = currentUrlsRef.current[currentIndexRef.current];

    transitionToImage(prevUrl);

    if (carouselEnabledRef.current) {
      startCarousel();
    }
  };

  const preloadCarouselImages = () => {
    if (currentUrlsRef.current.length <= 1) return;

    const nextIndex = (currentIndexRef.current + 1) % currentUrlsRef.current.length;
    const nextNextIndex = (currentIndexRef.current + 2) % currentUrlsRef.current.length;

    backgroundService.preload(currentUrlsRef.current[nextIndex]).catch(() => {});
    backgroundService.preload(currentUrlsRef.current[nextNextIndex]).catch(() => {});
  };

  const startCarousel = () => {
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
    }

    preloadCarouselImages();

    carouselIntervalRef.current = setInterval(async () => {
      if (currentUrlsRef.current.length <= 1) return;

      currentIndexRef.current = (currentIndexRef.current + 1) % currentUrlsRef.current.length;
      const nextUrl = currentUrlsRef.current[currentIndexRef.current];

      transitionToImage(nextUrl);
      preloadCarouselImages();
    }, carouselIntervalMsRef.current);
  };

  useEffect(() => {
    const handleNext = () => navigateToNext();
    const handlePrev = () => navigateToPrev();

    window.addEventListener('backgroundNext', handleNext);
    window.addEventListener('backgroundPrev', handlePrev);

    return () => {
      window.removeEventListener('backgroundNext', handleNext);
      window.removeEventListener('backgroundPrev', handlePrev);
    };
  }, []);

  useEffect(() => {
    const pageKey = location.pathname.slice(1) || 'home';
    const pageName = pageKey.split('/')[0];
    const pageChanged = pageName !== currentPageRef.current;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const loadPageBackground = async () => {
      try {
        if (carouselIntervalRef.current) {
          clearInterval(carouselIntervalRef.current);
          carouselIntervalRef.current = null;
        }

        const resolved = await resolveBackgroundsForPage(pageName);

        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        if (resolved.urls.length === 0) {
          console.warn('[BackgroundRoot] No background images found for page:', pageName);
          setHasError(true);
          return;
        }

        setHasError(false);

        currentUrlsRef.current = resolved.urls;
        carouselEnabledRef.current = resolved.carouselEnabled;
        carouselIntervalMsRef.current = resolved.carouselIntervalMs;

        const randomIndex = Math.floor(Math.random() * resolved.urls.length);
        currentIndexRef.current = randomIndex;
        const selectedUrl = resolved.urls[randomIndex];

        // Skip if same image and not a page change
        if (selectedUrl === currentImage && !pageChanged) {
          return;
        }

        if (!currentImage || pageChanged) {
          // Check if image is already preloaded
          const isPreloaded = backgroundService.isPreloaded(selectedUrl);

          if (isPreloaded) {
            // If already cached, set immediately
            setCurrentImage(selectedUrl);
            setIsLoading(false);
          } else {
            // Start preload and use transition for smoother effect
            backgroundService.preload(selectedUrl).catch(() => {});

            // Use transition to the new image
            if (currentImage) {
              transitionToImage(selectedUrl);
            } else {
              // First load - set immediately and let browser load
              setCurrentImage(selectedUrl);
              setIsLoading(false);
            }
          }
        } else {
          // Same page, different image - use transition
          transitionToImage(selectedUrl);
        }

        if (resolved.urls.length > 1) {
          backgroundService.preloadMultiple(resolved.urls.slice(0, 3));
        }

        if (resolved.carouselEnabled && resolved.urls.length > 1) {
          setTimeout(() => {
            if (!abortControllerRef.current?.signal.aborted) {
              startCarousel();
            }
          }, 1500);
        }
      } catch (error) {
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }
        console.error('[BackgroundRoot] Error loading background:', error);
        setHasError(true);
      } finally {
        currentPageRef.current = pageName;
      }
    };

    loadPageBackground();

    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
        carouselIntervalRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [location.pathname]);

  const handleImageError = (url: string) => {
    console.error('[BackgroundRoot] Failed to load image:', url);
    if (currentUrlsRef.current.length > 1) {
      navigateToNext();
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (!currentImage && !nextImage) {
    return (
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white/80 rounded-full animate-spin" />
          </div>
        )}
        {hasError && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-900/50 text-white px-4 py-2 rounded-lg text-sm z-50">
            No background images configured. Check console for details.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white/80 rounded-full animate-spin" />
        </div>
      )}
      {currentImage && (
        <img
          src={currentImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out"
          style={{
            opacity: isTransitioning ? 0 : 1,
            willChange: isTransitioning ? 'opacity' : 'auto',
            transform: 'translateZ(0)',
          }}
          onLoad={handleImageLoad}
          onError={() => handleImageError(currentImage)}
          loading="eager"
          decoding="async"
        />
      )}
      {nextImage && (
        <img
          src={nextImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out"
          style={{
            opacity: isTransitioning ? 1 : 0,
            willChange: isTransitioning ? 'opacity' : 'auto',
            transform: 'translateZ(0)',
          }}
          onTransitionEnd={handleTransitionEnd}
          onError={() => handleImageError(nextImage)}
          loading="eager"
          decoding="async"
        />
      )}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
