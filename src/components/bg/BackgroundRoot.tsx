import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveBackgroundsForPage } from '../../lib/bg/resolveBackgrounds';
import { backgroundService } from '../../lib/bg/BackgroundService';

export function BackgroundRoot() {
  const location = useLocation();
  const [currentImage, setCurrentImage] = useState<string>('');
  const [nextImage, setNextImage] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);

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
    }, 600);
  };

  const navigateToNext = () => {
    if (currentUrlsRef.current.length <= 1) return;

    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
      carouselIntervalRef.current = null;
    }

    currentIndexRef.current = (currentIndexRef.current + 1) % currentUrlsRef.current.length;
    const nextUrl = currentUrlsRef.current[currentIndexRef.current];

    backgroundService.preload(nextUrl).then(() => {
      transitionToImage(nextUrl);
    }).catch(() => {
      transitionToImage(nextUrl);
    });

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

    backgroundService.preload(prevUrl).then(() => {
      transitionToImage(prevUrl);
    }).catch(() => {
      transitionToImage(prevUrl);
    });

    if (carouselEnabledRef.current) {
      startCarousel();
    }
  };

  const startCarousel = () => {
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
    }

    carouselIntervalRef.current = setInterval(() => {
      if (currentUrlsRef.current.length <= 1) return;

      currentIndexRef.current = (currentIndexRef.current + 1) % currentUrlsRef.current.length;
      const nextUrl = currentUrlsRef.current[currentIndexRef.current];

      backgroundService.preload(nextUrl).then(() => {
        transitionToImage(nextUrl);
      }).catch(() => {
        transitionToImage(nextUrl);
      });
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
          isLoadingRef.current = false;
          return;
        }

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

        await backgroundService.preload(selectedUrl);

        if (!currentImage || pageChanged) {
          setCurrentImage(selectedUrl);
        } else {
          transitionToImage(selectedUrl);
        }

        if (resolved.urls.length > 1) {
          backgroundService.preloadMultiple(resolved.urls.slice(0, 6));
        }

        if (resolved.carouselEnabled && resolved.urls.length > 1) {
          startCarousel();
        }

        isLoadingRef.current = false;
      } catch (error) {
        console.error('[BackgroundRoot] Error loading background:', error);
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
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
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
            transition: 'opacity 600ms ease-in-out',
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
            transition: 'opacity 600ms ease-in-out',
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
