import { API_BASE_URL } from '@/api/client';

const URL_FIELDS = ['full_url', 'file_url', 'url', 'image_url', 'src', 'path'];

export function buildMediaUrl(value) {
  if (!value) return null;
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(https?:)?\/\//i.test(trimmed) || /^(data|blob):/i.test(trimmed)) return trimmed;

  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function resolveMedia(media) {
  if (!media) return null;

  if (typeof media === 'string') {
    return {
      id: null,
      url: buildMediaUrl(media),
      altText: '',
      raw: media,
    };
  }

  const urlField = URL_FIELDS.find((field) => media[field]);
  const url = buildMediaUrl(urlField ? media[urlField] : null);

  return {
    id: media.id || media.media_id || null,
    url,
    altText: media.alt_text || media.altText || '',
    type: media.media_type || media.type || null,
    filename: media.filename || media.name || null,
    raw: media,
  };
}

export function getMediaUrl(media) {
  return resolveMedia(media)?.url || null;
}
