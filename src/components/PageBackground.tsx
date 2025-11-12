import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useRandomPageImage } from "../hooks/useRandomPageImage";
import { backgroundPreloader } from "../lib/backgroundPreloader";
import { supabase } from "../lib/supabase";

export default function PageBackground() {
  const location = useLocation();
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const pageKey = path === "/" ? "home" : path.slice(1).split("/")[0];

  const { item, loading } = useRandomPageImage(pageKey);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [carouselEnabled, setCarouselEnabled] = useState(false);
  const [carouselInterval, setCarouselInterval] = useState(8000);

  useEffect(() => {
    async function loadCarouselConfig() {
      if (pageKey === "home") {
        const zoneKey = "home.background";
        const { data: zone } = await supabase
          .from("site_zones")
          .select("carousel_enabled, carousel_interval_ms")
          .eq("key", zoneKey)
          .maybeSingle();

        if (zone) {
          setCarouselEnabled(zone.carousel_enabled ?? false);
          setCarouselInterval(zone.carousel_interval_ms ?? 8000);
        }
      } else {
        setCarouselEnabled(false);
      }
    }

    loadCarouselConfig();
  }, [pageKey]);

  useEffect(() => {
    if (carouselEnabled && pageKey === "home" && !loading) {
      const timer = setInterval(async () => {
        backgroundPreloader.clearPageCache(pageKey);
        const newMedia = await backgroundPreloader.preloadForPage(pageKey, true);
        if (newMedia && newMedia.id !== item?.id) {
          setIsTransitioning(true);
          setTimeout(() => {
            setDisplayUrl(newMedia.public_url);
            setIsTransitioning(false);
          }, 300);
        }
      }, carouselInterval);

      return () => clearInterval(timer);
    }
  }, [carouselEnabled, carouselInterval, pageKey, loading, item?.id]);

  useEffect(() => {
    if (!item) {
      setDisplayUrl(null);
      return;
    }

    const url = item.public_url;

    setIsTransitioning(true);
    const transitionTimer = setTimeout(() => {
      setDisplayUrl(url);
      setIsTransitioning(false);
    }, 50);

    return () => clearTimeout(transitionTimer);
  }, [item?.id]);

  if (loading && !displayUrl) {
    return (
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
        <div className="absolute inset-0 bg-black/30" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {displayUrl ? (
        <img
          src={displayUrl}
          alt={item?.alt_text ?? ""}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          decoding="async"
          loading="eager"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
      )}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
