import { useEffect, useRef, useState } from 'react';

interface ScrollParallaxOptions {
  speed?: number;
  minScroll?: number;
  maxScroll?: number;
}

interface ScrollState {
  scrollY: number;
  scrollProgress: number;
  scrollDirection: 'up' | 'down' | 'none';
  scrollVelocity: number;
}

export function useScrollParallax(options: ScrollParallaxOptions = {}) {
  const { speed = 0.5, minScroll = 0, maxScroll = 1 } = options;

  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollY: 0,
    scrollProgress: 0,
    scrollDirection: 'none',
    scrollVelocity: 0,
  });

  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollProgress = scrollHeight > 0 ? currentScrollY / scrollHeight : 0;

          const direction = currentScrollY > lastScrollY.current ? 'down' : currentScrollY < lastScrollY.current ? 'up' : 'none';

          const timeDelta = currentTime - lastScrollTime.current;
          const scrollDelta = currentScrollY - lastScrollY.current;
          const velocity = timeDelta > 0 ? scrollDelta / timeDelta : 0;

          const clampedProgress = Math.max(minScroll, Math.min(maxScroll, scrollProgress));

          setScrollState({
            scrollY: currentScrollY,
            scrollProgress: clampedProgress,
            scrollDirection: direction,
            scrollVelocity: velocity,
          });

          lastScrollY.current = currentScrollY;
          lastScrollTime.current = currentTime;
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [minScroll, maxScroll]);

  const getParallaxTransform = (customSpeed?: number) => {
    const actualSpeed = customSpeed ?? speed;
    const translateY = (scrollState.scrollProgress - 0.5) * 100 * actualSpeed;
    return `translateY(${translateY}px)`;
  };

  const getParallaxStyle = (customSpeed?: number) => {
    return {
      transform: getParallaxTransform(customSpeed),
      transition: 'transform 0.1s ease-out',
    };
  };

  return {
    ...scrollState,
    getParallaxTransform,
    getParallaxStyle,
  };
}

export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, {
      threshold: 0.1,
      ...options,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, hasIntersected, options]);

  return { isIntersecting, hasIntersected };
}
