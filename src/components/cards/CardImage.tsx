"use client";

import { useState } from "react";

/**
 * Renders a card's real artwork from /public/cards/{id}.jpg.
 * If the image is missing or fails to load, renders `fallback` instead
 * (the decorative placeholder). This lets images be added incrementally —
 * a card with no image yet simply shows the placeholder.
 */
export default function CardImage({
  cardId,
  alt,
  imgClassName,
  fallback,
}: {
  cardId: number;
  alt: string;
  imgClassName?: string;
  fallback: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/cards/${cardId}.jpg`}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={imgClassName}
    />
  );
}
