import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PAGE_SEQUENCE = ['/', '/gallery', '/about', '/contact', '/shop'];

interface PageScrollHandlerProps {
  children: React.ReactNode;
}

const PageScrollHandler: React.FC<PageScrollHandlerProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isNavigatingRef = useRef(false);
  const scrollAccumulatorRef = useRef(0);
  const lastScrollTimeRef = useRef(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isNavigatingRef.current || isTransitioning) return;

      const now = Date.now();
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const isAtBottom = scrollTop + windowHeight >= documentHeight - 200;
      const isAtTop = scrollTop <= 200;
      const currentIndex = PAGE_SEQUENCE.indexOf(location.pathname);

      if (currentIndex === -1) return;

        if (now - lastScrollTimeRef.current > 1000) {
          scrollAccumulatorRef.current = 0;
        }
        lastScrollTimeRef.current = now;

        const scrollingDown = e.deltaY > 0;
        const scrollingUp = e.deltaY < 0;

        if (scrollingDown && isAtBottom && currentIndex < PAGE_SEQUENCE.length - 1) {
          scrollAccumulatorRef.current += e.deltaY;

          if (scrollAccumulatorRef.current > 500) {
            e.preventDefault();
            navigateToPage(PAGE_SEQUENCE[currentIndex + 1]);
            scrollAccumulatorRef.current = 0;
          }
        } else if (scrollingUp && isAtTop && currentIndex > 0) {
          scrollAccumulatorRef.current += Math.abs(e.deltaY);

          if (scrollAccumulatorRef.current > 500) {
            e.preventDefault();
            navigateToPage(PAGE_SEQUENCE[currentIndex - 1]);
            scrollAccumulatorRef.current = 0;
          }
        } else {
          scrollAccumulatorRef.current = 0;
        }
    };

    const navigateToPage = (nextPage: string) => {
      isNavigatingRef.current = true;
      setIsTransitioning(true);

      // Disable smooth scrolling during navigation to prevent spring-like effect
      document.documentElement.classList.add('disable-smooth-scroll');

      const content = document.querySelector('[data-page-content]') as HTMLElement;
      if (content) {
        content.style.transition = 'opacity 300ms ease-in-out';
        content.style.opacity = '0';
      }

      setTimeout(() => {
        navigate(nextPage);

        // Reset scroll position to top immediately after navigation
        // This now happens instantly because smooth scrolling is disabled
        window.scrollTo(0, 0);

        requestAnimationFrame(() => {
          setTimeout(() => {
            if (content) {
              content.style.opacity = '1';
            }

            setTimeout(() => {
              if (content) {
                content.style.transition = '';
              }
              // Re-enable smooth scrolling after navigation completes
              document.documentElement.classList.remove('disable-smooth-scroll');
              isNavigatingRef.current = false;
              setIsTransitioning(false);
            }, 300);
          }, 20);
        });
      }, 300);
    };

    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    window.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.body.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      document.removeEventListener('wheel', handleWheel);
      document.body.removeEventListener('wheel', handleWheel);
    };
  }, [navigate, location.pathname, isTransitioning]);

  return (
    <div data-page-content>
      {children}
    </div>
  );
};

export default PageScrollHandler;
