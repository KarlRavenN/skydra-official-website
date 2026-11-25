"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { isAllowedImageUrl } from "@/lib/utils/image-hosts";

export interface PosterImageProps {
  src: string | null | undefined;
  alt: string;
  /** Text shown in the placeholder when there is no usable poster. */
  placeholderText?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Classes for the placeholder box (defaults match the old inline placeholders). */
  placeholderClassName?: string;
}

/**
 * The ONE component used to show posters. It only hands URLs from allowed
 * hosts to next/image and falls back to a neutral placeholder when the URL is
 * empty, from an unknown host, or fails to load. A bad poster URL can never
 * crash a page.
 */
export function PosterImage({
  src,
  alt,
  placeholderText = "SKYDRA POSTER",
  sizes,
  priority,
  className,
  placeholderClassName,
}: PosterImageProps) {
  const [failed, setFailed] = useState(false);

  if (!isAllowedImageUrl(src) || failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600 font-black text-xl tracking-widest uppercase text-center px-2",
          placeholderClassName
        )}
        role="img"
        aria-label={alt}
      >
        {placeholderText}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
