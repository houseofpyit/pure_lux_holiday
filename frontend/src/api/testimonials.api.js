import { apiClient } from '@/api/client';

export async function getPublicTestimonials() {
  return apiClient.get('/api/v1/public/testimonials');
}

export async function getPublicTestimonialById(id) {
  return apiClient.get(`/api/v1/public/testimonials/${encodeURIComponent(id)}`);
}

export async function getPublicPackageTestimonials(slug) {
  return apiClient.get(`/api/v1/public/packages/${encodeURIComponent(slug)}/testimonials`);
}

export async function getPublicDestinationTestimonials(slug) {
  return apiClient.get(`/api/v1/public/destinations/${encodeURIComponent(slug)}/testimonials`);
}
