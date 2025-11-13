import { useEffect, useState } from "react";
import { useRandomPageImage } from "../hooks/useRandomPageImage";

type DecodableImage = HTMLImageElement & {
  decoding?: 'sync' | 'async' | 'auto';
  decode?: () => Promise<void>;
};

async function decodeImage(url: string): Promise<void> {
  try {
    const img = new Image() as DecodableImage;
    img.decoding = 'async';
    img.src = url;

    if (typeof img.decode === 'function') {
      await img.decode();
    } else {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image load failed'));
      });
    }
  } catch (error) {
    console.warn('Image decode error:', error);
  }
}

interface RandomizedPageBackgroundProps {
  pageKey: string;
  className?: string;
}

export default function RandomizedPageBackground({
  pageKey,
  className = "",
}: RandomizedPageBackgroundProps) {
  const { item, loading } = useRandomPageImage(pageKey);
  const [frontUrl, setFrontUrl] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!item) {
      setFrontUrl(null);
      setBackUrl(null);
      return;
    }

    const url = item.public_url;

    let alive = true;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    (async () => {
      setBackUrl(url);

      await decodeImage(url);

      if (!alive) return;

      setFrontUrl(url);

      timeout = setTimeout(() => {
        if (alive) {
          setBackUrl(null);
        }
      }, 400);
    })();

    return () => {
      alive = false;
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [item]);

  if (loading && !frontUrl) {
    return (
      <div className={`absolute inset-0 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
        <div className="absolute inset-0 bg-black/30" />
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 ${className}`}>
      {frontUrl ? (
        <img
          src={frontUrl}
          alt={item?.alt_text ?? ""}
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 opacity-100"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
      )}
      {backUrl && (
        <img
          src={backUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 opacity-0"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          decoding="async"
        />
      )}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
