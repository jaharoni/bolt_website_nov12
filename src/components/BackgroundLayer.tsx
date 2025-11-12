import { useEffect, useState, useRef, useCallback } from "react";
import { getBGConfig, matchRule, type PageBGRule } from "../lib/backgrounds";
import { supabase } from "../lib/supabase";

type BackgroundLayerProps = {
  pageKey: string;
  onIndexChange?: (index: number) => void;
  externalIndex?: number;
  onNext?: () => void;
  onPrev?: () => void;
};

export function BackgroundLayer({
  pageKey,
  onIndexChange,
  externalIndex,
  onNext,
  onPrev,
}: BackgroundLayerProps) {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rule, setRule] = useState<PageBGRule | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const prevPageKeyRef = useRef<string>(pageKey);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    async function loadBackground() {
      const config = await getBGConfig();
      const pageRule = matchRule(config, pageKey);

      if (!isMountedRef.current) return;

      setRule(pageRule);

      let imageList: string[] = [];

      if (pageRule.mode === "specific" && pageRule.images.length > 0) {
        imageList = pageRule.images;
      } else if (pageRule.folders.length > 0) {
        for (const folderSlug of pageRule.folders) {
          const { data: folder } = await supabase
            .from("media_folders")
            .select("id, name, slug")
            .eq("slug", folderSlug)
            .maybeSingle();

          if (folder) {
            const { data: media } = await supabase
              .from("media_items")
              .select("public_url")
              .eq("folder_id", folder.id)
              .eq("is_active", true)
              .eq("media_type", "image")
              .order("created_at");

            if (media && media.length > 0) {
              imageList.push(...media.map((m) => m.public_url));
            }
          }
        }
      }

      if (!isMountedRef.current) return;

      if (imageList.length > 0) {
        const pageChanged = prevPageKeyRef.current !== pageKey;
        prevPageKeyRef.current = pageKey;

        const randomStartIndex = Math.floor(Math.random() * imageList.length);

        if (pageChanged || images.length === 0) {
          if (typeof window === "undefined") {
            setImages(imageList);
            setCurrentIndex(randomStartIndex);
            return;
          }

          const preloadImage = new Image();
          preloadImage.onload = () => {
            if (!isMountedRef.current) return;
            setImages(imageList);
            window.requestAnimationFrame(() => {
              if (isMountedRef.current) {
                setCurrentIndex(randomStartIndex);
              }
            });
          };
          preloadImage.onerror = () => {
            if (!isMountedRef.current) return;
            setImages(imageList);
            setCurrentIndex(randomStartIndex);
          };
          preloadImage.src = imageList[randomStartIndex] ?? "";
        } else {
          setCurrentIndex(randomStartIndex);
        }
      }
    }

    loadBackground();
  }, [pageKey]);

  useEffect(() => {
    if (externalIndex !== undefined && externalIndex !== currentIndex) {
      setCurrentIndex(externalIndex);
    }
  }, [externalIndex]);

  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(currentIndex);
    }
  }, [currentIndex, onIndexChange]);

  useEffect(() => {
    if (!rule?.slideshow || images.length <= 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, rule.intervalMs || 6000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [rule, images.length]);

  const nextImage = useCallback(() => {
    if (images.length > 0) {
      const newIndex = (currentIndex + 1) % images.length;
      setCurrentIndex(newIndex);
      if (onNext) onNext();
    }
  }, [images.length, currentIndex, onNext]);

  const prevImage = useCallback(() => {
    if (images.length > 0) {
      const newIndex = (currentIndex - 1 + images.length) % images.length;
      setCurrentIndex(newIndex);
      if (onPrev) onPrev();
    }
  }, [images.length, currentIndex, onPrev]);

  useEffect(() => {
    const handleNext = () => nextImage();
    const handlePrev = () => prevImage();

    window.addEventListener("backgroundNext", handleNext);
    window.addEventListener("backgroundPrev", handlePrev);

    return () => {
      window.removeEventListener("backgroundNext", handleNext);
      window.removeEventListener("backgroundPrev", handlePrev);
    };
  }, [nextImage, prevImage]);

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
    );
  }

  return (
    <div className="fixed inset-0 -z-10">
      {images.map((img, idx) => (
        <div
          key={img}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: `url(${img})`,
            opacity: idx === currentIndex ? 1 : 0,
            willChange:
              idx === currentIndex || idx === (currentIndex + 1) % images.length
                ? "opacity"
                : "auto",
          }}
        />
      ))}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
