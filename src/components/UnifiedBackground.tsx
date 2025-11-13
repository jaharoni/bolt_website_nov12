import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import ImageService from '../lib/imageService';
import { useDeviceDetection, getImageOrientationForDevice } from '../hooks/useDeviceDetection';

interface BackgroundImage {
  id: string;
  public_url: string;
  storage_path: string;
  bucket_name: string;
  title: string;
  alt_text: string;
}

interface UnifiedBackgroundProps {
  pageContext?: string;
  mode?: 'static' | 'carousel';
  onBackgroundsLoaded?: (backgrounds: BackgroundImage[]) => void;
  externalIndex?: number;
}

const globalBackgroundCache: { [key: string]: BackgroundImage[] } = {};
const preloadedImages: { [key: string]: HTMLImageElement } = {};

export default function UnifiedBackground({
  pageContext = 'background',
  mode = 'static',
  onBackgroundsLoaded,
  externalIndex
}: UnifiedBackgroundProps) {
  const [backgrounds, setBackgrounds] = useState<BackgroundImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const deviceInfo = useDeviceDetection();
  const location = useLocation();
  const requiredOrientation = getImageOrientationForDevice(deviceInfo);
  const currentCacheKey = `${pageContext}_${requiredOrientation}`;
  const onBackgroundsLoadedRef = useRef(onBackgroundsLoaded);

  useEffect(() => {
    onBackgroundsLoadedRef.current = onBackgroundsLoaded;
  }, [onBackgroundsLoaded]);

  useEffect(() => {
    if (externalIndex !== undefined && externalIndex !== currentIndex) {
      setCurrentIndex(externalIndex);
    }
  }, [externalIndex, currentIndex]);

  useEffect(() => {
    const cachedBackgrounds = globalBackgroundCache[currentCacheKey];
    if (cachedBackgrounds && cachedBackgrounds.length > 0) {
      setBackgrounds(cachedBackgrounds);
      setHasError(false);
      setIsReady(true);
      onBackgroundsLoadedRef.current?.(cachedBackgrounds);
      return;
    }

    if (!isSupabaseConfigured) {
      console.warn('[UnifiedBackground] Supabase not configured; using gradient fallback.');
      setBackgrounds([]);
      setHasError(true);
      setIsReady(true);
      return;
    }

    const loadBackgrounds = async () => {
      try {
        const { data: folderData, error: folderError } = await supabase
          .from('media_folders')
          .select('id')
          .eq('slug', 'backgrounds')
          .maybeSingle();

        if (folderError || !folderData) {
          console.warn('Backgrounds folder not found');
          setHasError(true);
          setIsReady(true);
          return;
        }

        const backgroundsFolderId = folderData.id;

        const selectBase = () =>
          supabase
            .from('media_items')
            .select('id, public_url, storage_path, bucket_name, title, alt_text, folder_id')
            .eq('folder_id', backgroundsFolderId)
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
            .limit(10);

        let { data, error } = await selectBase()
          .eq('page_context', pageContext)
          .in('device_orientation', [requiredOrientation, 'both']);

        if (!error && (!data || data.length === 0)) {
          ({ data, error } = await selectBase().eq('page_context', pageContext));
        }

        if (!error && (!data || data.length === 0)) {
          ({ data, error } = await selectBase());
        }

        if (error) {
          console.warn('Background query error:', error.message);
          setHasError(true);
          setIsReady(true);
          return;
        }

        if (data && data.length > 0) {
          globalBackgroundCache[currentCacheKey] = data;
          setBackgrounds(data);
          setHasError(false);

          if (externalIndex === undefined) {
            const randomIndex = Math.floor(Math.random() * data.length);
            setCurrentIndex(randomIndex);
          }

          onBackgroundsLoadedRef.current?.(data);
          await preloadAllImages(data);
        } else {
          console.warn(`No background images found for context: ${pageContext}`);
          setBackgrounds([]);
          setHasError(true);
          setIsReady(true);
        }
      } catch (err) {
        console.warn('Error loading backgrounds:', err);
        setHasError(true);
        setIsReady(true);
      }
    };

    loadBackgrounds();
  }, [currentCacheKey, pageContext, requiredOrientation, externalIndex, location.pathname]);

  const preloadAllImages = async (imagesToPreload: BackgroundImage[]) => {
    const preloadPromises = imagesToPreload.map((bg) => {
      const optimizedUrl = ImageService.getOptimizedUrl(
        bg.bucket_name,
        bg.storage_path,
        'fullscreen'
      );

      if (preloadedImages[optimizedUrl]) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          preloadedImages[optimizedUrl] = img;
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to preload: ${optimizedUrl}`);
          resolve();
        };
        img.src = optimizedUrl;
      });
    });

    await Promise.all(preloadPromises);
    setIsReady(true);
  };

  // Show gradient fallback instead of black screen
  if (!isReady || backgrounds.length === 0 || hasError) {
    return (
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)'
        }}
      />
    );
  }

  if (mode === 'carousel') {
    return null;
  }

  const currentBackground = backgrounds[currentIndex];
  const optimizedUrl = ImageService.getOptimizedUrl(
    currentBackground.bucket_name,
    currentBackground.storage_path,
    'fullscreen'
  );

  return (
    <>
      <div
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)'
        }}
      />
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src={optimizedUrl}
          alt={currentBackground.alt_text || ''}
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
    </>
  );
}
