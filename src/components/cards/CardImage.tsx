"use client";

import { useMemo, useState } from "react";

const LOCAL_CARD_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];

/**
 * Renders a card's real artwork from Supabase/local assets.
 * If none of the candidate sources load, renders `fallback` instead.
 */
export default function CardImage({
  cardId,
  alt,
  imageUrl,
  imgClassName,
  fallback,
}: {
  cardId: number;
  alt: string;
  imageUrl?: string | null;
  imgClassName?: string;
  fallback: React.ReactNode;
}) {
  const sources = useMemo(() => {
    const localSources = LOCAL_CARD_EXTENSIONS.map((ext) => `/cards/${cardId}.${ext}`);
    return imageUrl ? [imageUrl, ...localSources] : localSources;
  }, [cardId, imageUrl]);

  const sourceKey = sources.join("|");
  const [failureState, setFailureState] = useState<{ key: string; failed: string[] }>({
    key: "",
    failed: [],
  });
  const failedSources = failureState.key === sourceKey ? failureState.failed : [];
  const activeSource = sources.find((source) => !failedSources.includes(source));

  if (!activeSource) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={activeSource}
      src={activeSource}
      alt={alt}
      loading="lazy"
      onError={() =>
        setFailureState((current) => ({
          key: sourceKey,
          failed:
            current.key === sourceKey
              ? [...current.failed, activeSource]
              : [activeSource],
        }))
      }
      className={imgClassName}
    />
  );
}
