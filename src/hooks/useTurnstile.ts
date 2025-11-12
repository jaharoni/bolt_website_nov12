import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: any) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string;
    };
    onTurnstileLoad?: () => void;
  }
}

export function useTurnstile(onSuccess: (token: string) => void) {
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (typeof window.turnstile !== 'undefined') {
        setIsReady(true);
        return;
      }

      const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile="true"]');
      if (existing) {
        existing.addEventListener('load', () => setIsReady(true), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.turnstile = 'true';

      window.onTurnstileLoad = () => {
        setIsReady(true);
      };

      script.onload = () => {
        if (typeof window.turnstile !== 'undefined') {
          setIsReady(true);
        }
      };

      document.head.appendChild(script);

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (e) {
            console.warn('Error removing Turnstile widget:', e);
          }
        }
      };
    }, []);

  useEffect(() => {
    if (!isReady || !containerRef.current || widgetIdRef.current || !window.turnstile) {
      return;
    }

    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      // Silently handle missing site key - don't warn in production
      return;
    }

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'dark',
        size: 'compact',
        callback: (tkn: string) => {
          setToken(tkn);
          onSuccess(tkn);
        },
        'error-callback': () => {
          setToken(null);
        },
        'expired-callback': () => {
          setToken(null);
        },
      });
    } catch (error) {
      console.warn('Error rendering Turnstile widget:', error);
    }
  }, [isReady, onSuccess]);

  const reset = () => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
        setToken(null);
      } catch (e) {
        console.warn('Error resetting Turnstile:', e);
      }
    }
  };

  const execute = () => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        const currentToken = window.turnstile.getResponse(widgetIdRef.current);
        if (currentToken) {
          setToken(currentToken);
          onSuccess(currentToken);
        }
      } catch (e) {
        console.warn('Error executing Turnstile:', e);
      }
    }
  };

  return {
    containerRef,
    token,
    isReady,
    reset,
    execute,
  };
}
