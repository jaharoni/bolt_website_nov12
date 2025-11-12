import { useEffect, useState } from "react";
import { Media } from "../lib/types";
import { backgroundPreloader } from "../lib/backgroundPreloader";

export function useRandomPageImage(pageKey: string) {
  const [item, setItem] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const media = await backgroundPreloader.preloadForPage(pageKey, false);
        if (alive) {
          setItem(media);
          setLoading(false);
        }
      } catch (error) {
        console.warn(`Error loading page background for ${pageKey}:`, error);
        if (alive) {
          setItem(null);
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [pageKey]);

  return { item, loading };
}
