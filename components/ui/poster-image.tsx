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
  /** When false, renders at the image's natural aspect ratio (w-full h-auto) instead of filling a fixed box. */
  fill?: boolean;
  /** Intrinsic width hint when fill is false. */
  width?: number;
  /** Intrinsic height hint when fill is false. */
  height?: number;
  /** Image optimization quality (1-100). */
  quality?: number;
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
  fill = true,
  width = 1200,
  height = 1500,
  quality,
  className,
  placeholderClassName,
}: PosterImageProps) {
  const [failed, setFailed] = useState(false);

  if (!isAllowedImageUrl(src) || failed) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center bg-zinc-900 text-zinc-600 font-black text-xl tracking-widest uppercase text-center px-2",
          fill ? "h-full" : "aspect-[4/5]",
          placeholderClassName
        )}
        role="img"
        aria-label={alt}
      >
        {placeholderText}
      </div>
    );
  }

  if (!fill) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        sizes={sizes}
        className={cn("block h-auto w-full", className)}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      quality={quality}
      priority={priority}
      sizes={sizes}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
