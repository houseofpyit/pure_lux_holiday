import { apiClient } from '@/api/client';

export async function getPublicGallery() {
  return apiClient.get('/api/v1/public/gallery');
}

export async function getPublicGalleryAlbums() {
  return apiClient.get('/api/v1/public/gallery/albums');
}

export async function getPublicGalleryAlbumBySlug(slug) {
  return apiClient.get(`/api/v1/public/gallery/albums/${encodeURIComponent(slug)}`);
}
