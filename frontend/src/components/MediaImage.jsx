import React from 'react';
import { buildMediaUrl, resolveMedia } from '@/lib/media';

export default function MediaImage({
  media,
  src,
  alt = '',
  fallbackSrc,
  className = '',
  ...props
}) {
  const resolved = resolveMedia(media);
  const imageUrl = src || resolved?.url || (fallbackSrc ? buildMediaUrl(fallbackSrc) : null);
  const imageAlt = alt || resolved?.altText || '';

  if (!imageUrl) return null;

  return (
    <img
      src={imageUrl}
      alt={imageAlt}
      className={className}
      loading="lazy"
      {...props}
    />
  );
}
