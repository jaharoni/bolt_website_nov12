import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveBackgroundsForPage } from '../../lib/bg/resolveBackgrounds';
import { backgroundService } from '../../lib/bg/BackgroundService';

export function BackgroundRoot() {
  const location = useLocation();
  const [currentImage, setCurrentImage] = useState<string>('');
  const [nextImage, setNextImage] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentPageRef = useRef<string>('');
  const currentUrlsRef = useRef<string[]>([]);
  const currentIndexRef = useRef<number>(0);
  const isSlideshowRef = useRef<boolean>(false);
  const isLoadingRef = useRef<boolean>(false);
  const selectedImageRef = useRef<string>('');
  const pageImageCacheRef = useRef<Map<string, string>>(new Map());
  const navTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const instantSwapImage = (url: string) => {
    if (url === currentImage) return;
    setCurrentImage(url);
    setImageLoaded(false);
  };

  const transitionToImage = (url: string) => {
    if (url === currentImage || url === nextImage) return;

    setNextImage(url);
    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentImage(url);
      setIsTransitioning(false);
      setNextImage('');
      setImageLoaded(false);
    }, 500);
  };

  useEffect(() => {
    const pageKey = location.pathname.slice(1) || 'home';
    const pageName = pageKey.split('/')[0];

    if (pageName === currentPageRef.current && selectedImageRef.current) {
      return;
    }

    if (navTimeoutRef.current) {
      clearTimeout(navTimeoutRef.current);
    }

    navTimeoutRef.current = setTimeout(() => {
      if (isLoadingRef.current) {
        return;
      }

      currentPageRef.current = pageName;
      isLoadingRef.current = true;

      const loadPageBackground = async () => {
        try {
          const cachedImage = pageImageCacheRef.current.get(pageName);
          if (cachedImage && selectedImageRef.current === '') {
            selectedImageRef.current = cachedImage;

            if (!currentImage) {
              setCurrentImage(cachedImage);
            } else {
              transitionToImage(cachedImage);
            }

            isLoadingRef.current = false;
            return;
          }

          const resolved = await resolveBackgroundsForPage(pageName);

          if (resolved.urls.length === 0) {
            isLoadingRef.current = false;
            return;
          }

          currentUrlsRef.current = resolved.urls;
          isSlideshowRef.current = resolved.slideshow;

          let selectedUrl: string;

          if (selectedImageRef.current && resolved.urls.includes(selectedImageRef.current)) {
            selectedUrl = selectedImageRef.current;
            currentIndexRef.current = resolved.urls.indexOf(selectedUrl);
          } else {
            const randomIndex = Math.floor(Math.random() * resolved.urls.length);
            currentIndexRef.current = randomIndex;
            selectedUrl = resolved.urls[randomIndex];
          }

          selectedImageRef.current = selectedUrl;
          pageImageCacheRef.current.set(pageName, selectedUrl);

          backgroundService.preload(selectedUrl).then(() => {
            if (!currentImage) {
              setCurrentImage(selectedUrl);
            } else {
              transitionToImage(selectedUrl);
            }
          }).catch(err => {
            console.error('[BackgroundRoot] Preload failed:', err);
            if (!currentImage) {
              setCurrentImage(selectedUrl);
            } else {
              transitionToImage(selectedUrl);
            }
          });

          if (resolved.urls.length > 1) {
            backgroundService.preloadMultiple(resolved.urls.slice(0, 6));
          }

          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          if (resolved.slideshow && resolved.urls.length > 1) {
            intervalRef.current = setInterval(() => {
              currentIndexRef.current = (currentIndexRef.current + 1) % currentUrlsRef.current.length;
              const nextUrl = currentUrlsRef.current[currentIndexRef.current];
              selectedImageRef.current = nextUrl;

              instantSwapImage(nextUrl);
            }, resolved.intervalMs);
          }

          isLoadingRef.current = false;
        } catch (error) {
          console.error('[BackgroundRoot] Error loading background:', error);
          isLoadingRef.current = false;
        }
      };

      loadPageBackground();
    }, 50);

    return () => {
      if (navTimeoutRef.current) {
        clearTimeout(navTimeoutRef.current);
        navTimeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
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
            opacity: isTransitioning ? 0 : (imageLoaded ? 1 : 0.95),
            transition: isSlideshowRef.current
              ? 'none'
              : isTransitioning
                ? 'opacity 500ms ease-in-out'
                : imageLoaded
                  ? 'opacity 300ms ease-in'
                  : 'none',
          }}
        >
          <img
            src={currentImage}
            alt=""
            className="hidden"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      )}
      {nextImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{
            backgroundImage: `url(${nextImage})`,
            opacity: isTransitioning ? 1 : 0,
          }}
        />
      )}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
