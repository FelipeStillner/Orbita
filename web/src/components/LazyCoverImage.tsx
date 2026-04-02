import { useEffect, useRef, useState } from "react";

const ROOT_MARGIN = "200px";

interface Props {
  src: string;
  alt: string;
  className?: string;
}

/**
 * Only sets img src when the container intersects the viewport (plus margin),
 * so off-screen cards do not download images until scrolled near.
 */
export function LazyCoverImage({ src, alt, className }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          obs.disconnect();
        }
      },
      { root: null, rootMargin: ROOT_MARGIN, threshold: 0 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={className}>
      {shouldLoad ? (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          decoding="async"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-900" aria-hidden />
      )}
    </div>
  );
}
