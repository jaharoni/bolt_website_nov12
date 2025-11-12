import { useEffect, useRef, useState } from "react";
import { preloadDecode } from "../lib/imagePreload";

type Props = {
  src: string | null;
  alt?: string;
  className?: string;
};

export default function CrossfadeBackground({ src, alt = "", className = "" }: Props) {
  const [front, setFront] = useState<string | null>(null);
  const [back, setBack] = useState<string | null>(null);
  const flipping = useRef(false);

  useEffect(() => {
    if (!src) return;
    let alive = true;

    (async () => {
      if (front === src || back === src) return;

      flipping.current = true;
      setBack(src);
      try { await preloadDecode(src); } catch {}
      if (!alive) return;

      setFront(src);
      setTimeout(() => { if (alive) setBack(null); flipping.current = false; }, 450);
    })();

    return () => { alive = false; };
  }, [src, front, back]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} style={{ contain: "paint", willChange: "opacity" }}>
      {front && (
        <img
          key={`front-${front}`}
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-400 opacity-100"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          src={front}
          alt={alt}
          decoding="async"
        />
      )}
      {back && (
        <img
          key={`back-${back}`}
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-400 opacity-0"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          src={back}
          alt=""
          aria-hidden="true"
          decoding="async"
        />
      )}
    </div>
  );
}
