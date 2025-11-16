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

  const currentPageRef = useRef<string>('');
  const currentUrlsRef = useRef<string[]>([]);
  const currentIndexRef = useRef<number>(0);
  const carouselEnabledRef = useRef<boolean>(false);
  const carouselIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselIntervalMsRef = useRef<number>(7000);
  const isLoadingRef = useRef<boolean>(false);

  const transitionToImage = (url: string) => {
    if (url === currentImage || url === nextImage) return;

    setNextImage(url);
    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentImage(url);
      setIsTransitioning(false);
      setNextImage('');
    }, 800);
  };

  const navigateToNext = () => {
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

  const navigateToPrev = () => {
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

  const preloadNextCarouselImage = () => {
    if (currentUrlsRef.current.length <= 1) return;
    const nextIndex = (currentIndexRef.current + 1) % currentUrlsRef.current.length;
    const nextUrl = currentUrlsRef.current[nextIndex];
    backgroundService.preload(nextUrl).catch(() => {});
  };

  const startCarousel = () => {
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
    }

    preloadNextCarouselImage();

    carouselIntervalRef.current = setInterval(() => {
      if (currentUrlsRef.current.length <= 1) return;

      currentIndexRef.current = (currentIndexRef.current + 1) % currentUrlsRef.current.length;
      const nextUrl = currentUrlsRef.current[currentIndexRef.current];

      transitionToImage(nextUrl);
      preloadNextCarouselImage();
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

    if (isLoadingRef.current) {
      return;
    }

    const pageChanged = pageName !== currentPageRef.current;
    currentPageRef.current = pageName;
    isLoadingRef.current = true;

    const loadPageBackground = async () => {
      try {
        if (carouselIntervalRef.current) {
          clearInterval(carouselIntervalRef.current);
          carouselIntervalRef.current = null;
        }

        const resolved = await resolveBackgroundsForPage(pageName);

        if (resolved.urls.length === 0) {
          console.warn('[BackgroundRoot] No background images found for page:', pageName);
          setHasError(true);
          isLoadingRef.current = false;
          return;
        }

        setHasError(false);

        currentUrlsRef.current = resolved.urls;
        carouselEnabledRef.current = resolved.carouselEnabled;
        carouselIntervalMsRef.current = resolved.carouselIntervalMs;

        const randomIndex = Math.floor(Math.random() * resolved.urls.length);
        currentIndexRef.current = randomIndex;
        const selectedUrl = resolved.urls[randomIndex];

        if (selectedUrl === currentImage && !pageChanged) {
          isLoadingRef.current = false;
          return;
        }

        if (!currentImage || pageChanged) {
          await backgroundService.preload(selectedUrl);
          setCurrentImage(selectedUrl);
        } else {
          transitionToImage(selectedUrl);
        }

        if (resolved.urls.length > 1) {
          backgroundService.preloadMultiple(resolved.urls.slice(0, 10));
        }

        if (resolved.carouselEnabled && resolved.urls.length > 1) {
          startCarousel();
        }

        isLoadingRef.current = false;
      } catch (error) {
        console.error('[BackgroundRoot] Error loading background:', error);
        setHasError(true);
        isLoadingRef.current = false;
      }
    };

    loadPageBackground();

    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
        carouselIntervalRef.current = null;
      }
    };
  }, [location.pathname]);

  if (!currentImage && !nextImage) {
    return (
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
      {currentImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${currentImage})`,
            opacity: isTransitioning ? 0 : 1,
            transition: 'opacity 800ms ease-in-out',
            willChange: isTransitioning ? 'opacity' : 'auto',
          }}
        >
          <img
            src={currentImage}
            alt=""
            className="hidden"
            loading="eager"
            decoding="async"
          />
        </div>
      )}
      {nextImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${nextImage})`,
            opacity: isTransitioning ? 1 : 0,
            transition: 'opacity 800ms ease-in-out',
            willChange: 'opacity',
          }}
        >
          <img
            src={nextImage}
            alt=""
            className="hidden"
            loading="eager"
            decoding="async"
          />
        </div>
      )}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
