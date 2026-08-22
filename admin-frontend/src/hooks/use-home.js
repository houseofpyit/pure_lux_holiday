/**
 * React Query hooks for the Home CMS module.
 *
 * Query keys:
 *   ['home', 'hero']        — hero section singleton
 *   ['home', 'collections'] — luxury collections list
 *
 * All data mutations invalidate the relevant query key so the UI
 * automatically reflects the latest saved state.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import HomeService from '@/services/home.service';

export const HOME_QUERY_KEYS = {
  hero: ['home', 'hero'],
  aboutSection: ['home', 'about-section'],
  cta: ['home', 'cta'],
  collections: ['home', 'collections'],
  featuredDestinations: ['home', 'featured-destinations'],
  experiences: ['home', 'experiences'],
  whyChooseUs: ['home', 'why-choose-us'],
  statistics: ['home', 'statistics'],
  testimonials: ['home', 'testimonials'],
  travelJournal: ['home', 'travel-journal'],
};

// ─── useHero ────────────────────────────────────────────────────────────────

/**
 * Fetch the hero section from the backend.
 * Returns the UI-ready form shape from HomeService.loadHero().
 */
export function useHero() {
  return useQuery({
    queryKey: HOME_QUERY_KEYS.hero,
    queryFn: async () => {
      const hero = await HomeService.loadHero();

      // Resolve image URLs so the preview can display them immediately.
      // Run both fetches in parallel; failures are silently ignored.
      const [bgMedia, mobileMedia] = await Promise.all([
        HomeService.getMedia(hero.background_image_id),
        HomeService.getMedia(hero.mobile_background_image_id),
      ]);

      return {
        ...hero,
        background_image_url: bgMedia?.full_url ?? null,
        mobile_background_image_url: mobileMedia?.full_url ?? null,
      };
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// ─── useUpdateHero ───────────────────────────────────────────────────────────

/**
 * Mutation to save the hero section.
 * On success invalidates ['home', 'hero'] so the form reloads fresh data.
 *
 * @param {object} [options]  Optional useMutation options (onSuccess, onError, etc.)
 */
export function useUpdateHero(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formValues) => HomeService.updateHero(formValues),
    onSuccess: (updatedData, ...rest) => {
      // Merge the saved data with the existing cached image URLs so the
      // preview doesn't go blank (apiToForm always resets them to null).
      const existing = queryClient.getQueryData(HOME_QUERY_KEYS.hero);
      queryClient.setQueryData(HOME_QUERY_KEYS.hero, {
        ...updatedData,
        background_image_url: updatedData.background_image_url ?? existing?.background_image_url ?? null,
        mobile_background_image_url: updatedData.mobile_background_image_url ?? existing?.mobile_background_image_url ?? null,
      });
      options.onSuccess?.(updatedData, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useUploadHeroMedia ──────────────────────────────────────────────────────

/**
 * Mutation to upload a media file for the hero section.
 * Does NOT invalidate the hero query — the caller must manually
 * store the returned media_id in the form before saving.
 *
 * @param {object} [options]  Optional useMutation options.
 */
export function useUploadHeroMedia(options = {}) {
  return useMutation({
    mutationFn: ({ file, folder, onProgress }) =>
      HomeService.uploadHeroMedia(file, folder, onProgress),
    onSuccess: options.onSuccess,
    onError: options.onError,
  });
}

// ─── useAboutSection ────────────────────────────────────────────────────────

export function useAboutSection() {
  return useQuery({
    queryKey: HOME_QUERY_KEYS.aboutSection,
    queryFn: () => HomeService.loadAboutSection(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// ─── useUpdateAboutSection ──────────────────────────────────────────────────

export function useUpdateAboutSection(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formValues) => HomeService.updateAboutSection(formValues),
    onSuccess: (updatedData, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.aboutSection, updatedData);
      options.onSuccess?.(updatedData, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useCTA ─────────────────────────────────────────────────────────────────

export function useCTA() {
  return useQuery({
    queryKey: HOME_QUERY_KEYS.cta,
    queryFn: () => HomeService.loadCTA(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// ─── useUpdateCTA ───────────────────────────────────────────────────────────

export function useUpdateCTA(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formValues) => HomeService.updateCTA(formValues),
    onSuccess: (updatedData, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.cta, updatedData);
      queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEYS.cta });
      options.onSuccess?.(updatedData, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useCollections ──────────────────────────────────────────────────────────

/**
 * Fetch all collections from the backend.
 * Returns UI-ready items with resolved image_url from HomeService.loadCollections().
 */
export function useCollections() {
  return useQuery({
    queryKey: HOME_QUERY_KEYS.collections,
    queryFn: () => HomeService.loadCollections(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// ─── useCreateCollection ─────────────────────────────────────────────────────

/**
 * Mutation to create a new collection.
 * On success invalidates ['home', 'collections'].
 *
 * @param {object} [options]  Optional useMutation options (onSuccess, onError, etc.)
 */
export function useCreateCollection(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formValues) => HomeService.createCollection(formValues),
    onSuccess: (newItem, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.collections, (old = []) => [
        ...old,
        newItem,
      ]);
      options.onSuccess?.(newItem, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useUpdateCollection ─────────────────────────────────────────────────────

/**
 * Mutation to update an existing collection.
 * On success updates the matching item in the cache directly.
 *
 * @param {object} [options]  Optional useMutation options.
 */
export function useUpdateCollection(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formValues }) => HomeService.updateCollection(id, formValues),
    onSuccess: (updatedItem, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.collections, (old = []) =>
        old.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      );
      options.onSuccess?.(updatedItem, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useDeleteCollection ─────────────────────────────────────────────────────

/**
 * Mutation to delete a collection by ID.
 * On success removes the item from the cache.
 *
 * @param {object} [options]  Optional useMutation options.
 */
export function useDeleteCollection(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => HomeService.deleteCollection(id),
    onSuccess: (_data, id, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.collections, (old = []) =>
        old.filter((item) => item.id !== id),
      );
      options.onSuccess?.(_data, id, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useReorderCollections ───────────────────────────────────────────────────

/**
 * Mutation to reorder collections.
 * On success updates the full list in the cache with the server response.
 *
 * @param {object} [options]  Optional useMutation options.
 */
export function useReorderCollections(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items) => HomeService.reorderCollections(items),
    onSuccess: (reorderedItems, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.collections, reorderedItems);
      options.onSuccess?.(reorderedItems, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useFeaturedDestinations ─────────────────────────────────────────────────

/**
 * Fetch all featured destinations from the backend.
 * Returns UI-ready items with resolved image_url.
 */
export function useFeaturedDestinations() {
  return useQuery({
    queryKey: HOME_QUERY_KEYS.featuredDestinations,
    queryFn: () => HomeService.loadFeaturedDestinations(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// ─── useCreateFeaturedDestination ────────────────────────────────────────────

/**
 * Mutation to create a new featured destination.
 * On success appends the new item to the cache.
 *
 * @param {object} [options]
 */
export function useCreateFeaturedDestination(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formValues) => HomeService.createFeaturedDestination(formValues),
    onSuccess: (newItem, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.featuredDestinations, (old = []) => [
        ...old,
        newItem,
      ]);
      options.onSuccess?.(newItem, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useUpdateFeaturedDestination ────────────────────────────────────────────

/**
 * Mutation to update an existing featured destination.
 * On success replaces the matching item in the cache.
 *
 * @param {object} [options]
 */
export function useUpdateFeaturedDestination(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formValues }) => HomeService.updateFeaturedDestination(id, formValues),
    onSuccess: (updatedItem, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.featuredDestinations, (old = []) =>
        old.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      );
      options.onSuccess?.(updatedItem, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useDeleteFeaturedDestination ────────────────────────────────────────────

/**
 * Mutation to delete a featured destination by ID.
 * On success removes the item from the cache.
 *
 * @param {object} [options]
 */
export function useDeleteFeaturedDestination(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => HomeService.deleteFeaturedDestination(id),
    onSuccess: (_data, id, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.featuredDestinations, (old = []) =>
        old.filter((item) => item.id !== id),
      );
      options.onSuccess?.(_data, id, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useReorderFeaturedDestinations ──────────────────────────────────────────

/**
 * Mutation to reorder featured destinations.
 * On success updates the full list in the cache with the server response.
 *
 * @param {object} [options]
 */
export function useReorderFeaturedDestinations(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items) => HomeService.reorderFeaturedDestinations(items),
    onSuccess: (reorderedItems, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.featuredDestinations, reorderedItems);
      options.onSuccess?.(reorderedItems, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useExperiences ──────────────────────────────────────────────────────────

export function useExperiences() {
  return useQuery({
    queryKey: HOME_QUERY_KEYS.experiences,
    queryFn: () => HomeService.loadExperiences(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// ─── useCreateExperience ─────────────────────────────────────────────────────

export function useCreateExperience(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => HomeService.createExperience(formValues),
    onSuccess: (newItem, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.experiences, (old = []) => [...old, newItem]);
      options.onSuccess?.(newItem, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useUpdateExperience ─────────────────────────────────────────────────────

export function useUpdateExperience(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formValues }) => HomeService.updateExperience(id, formValues),
    onSuccess: (updatedItem, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.experiences, (old = []) =>
        old.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      );
      options.onSuccess?.(updatedItem, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useDeleteExperience ─────────────────────────────────────────────────────

export function useDeleteExperience(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => HomeService.deleteExperience(id),
    onSuccess: (_data, id, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.experiences, (old = []) =>
        old.filter((item) => item.id !== id),
      );
      options.onSuccess?.(_data, id, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useReorderExperiences ───────────────────────────────────────────────────

export function useReorderExperiences(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items) => HomeService.reorderExperiences(items),
    onSuccess: (reorderedItems, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.experiences, reorderedItems);
      options.onSuccess?.(reorderedItems, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useWhyChooseUs ──────────────────────────────────────────────────────────

export function useWhyChooseUs() {
  return useQuery({
    queryKey: HOME_QUERY_KEYS.whyChooseUs,
    queryFn: () => HomeService.loadWhyChooseUs(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// ─── useCreateWhyChooseUs ────────────────────────────────────────────────────

export function useCreateWhyChooseUs(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => HomeService.createWhyChooseUs(formValues),
    onSuccess: (newItem, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.whyChooseUs, (old = []) => [...old, newItem]);
      options.onSuccess?.(newItem, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useUpdateWhyChooseUs ────────────────────────────────────────────────────

export function useUpdateWhyChooseUs(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formValues }) => HomeService.updateWhyChooseUs(id, formValues),
    onSuccess: (updatedItem, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.whyChooseUs, (old = []) =>
        old.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      );
      options.onSuccess?.(updatedItem, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useDeleteWhyChooseUs ────────────────────────────────────────────────────

export function useDeleteWhyChooseUs(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => HomeService.deleteWhyChooseUs(id),
    onSuccess: (_data, id, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.whyChooseUs, (old = []) =>
        old.filter((item) => item.id !== id),
      );
      options.onSuccess?.(_data, id, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useReorderWhyChooseUs ───────────────────────────────────────────────────

export function useReorderWhyChooseUs(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items) => HomeService.reorderWhyChooseUs(items),
    onSuccess: (reorderedItems, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.whyChooseUs, reorderedItems);
      options.onSuccess?.(reorderedItems, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useStatistics ────────────────────────────────────────────────────────────

export function useStatistics() {
  return useQuery({
    queryKey: HOME_QUERY_KEYS.statistics,
    queryFn: () => HomeService.loadStatistics(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// ─── useCreateStatistic ───────────────────────────────────────────────────────

export function useCreateStatistic(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => HomeService.createStatistic(formValues),
    onSuccess: (newItem, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.statistics, (old = []) => [...old, newItem]);
      options.onSuccess?.(newItem, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useUpdateStatistic ───────────────────────────────────────────────────────

export function useUpdateStatistic(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formValues }) => HomeService.updateStatistic(id, formValues),
    onSuccess: (updatedItem, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.statistics, (old = []) =>
        old.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      );
      options.onSuccess?.(updatedItem, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useDeleteStatistic ───────────────────────────────────────────────────────

export function useDeleteStatistic(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => HomeService.deleteStatistic(id),
    onSuccess: (_data, id, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.statistics, (old = []) =>
        old.filter((item) => item.id !== id),
      );
      options.onSuccess?.(_data, id, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useReorderStatistics ─────────────────────────────────────────────────────

export function useReorderStatistics(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items) => HomeService.reorderStatistics(items),
    onSuccess: (reorderedItems, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.statistics, reorderedItems);
      options.onSuccess?.(reorderedItems, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useTestimonials ──────────────────────────────────────────────────────────

export function useTestimonials() {
  return useQuery({
    queryKey: HOME_QUERY_KEYS.testimonials,
    queryFn: () => HomeService.loadTestimonials(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// ─── useCreateTestimonial ─────────────────────────────────────────────────────

export function useCreateTestimonial(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => HomeService.createTestimonial(formValues),
    onSuccess: (newItem, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.testimonials, (old = []) => [...old, newItem]);
      options.onSuccess?.(newItem, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useUpdateTestimonial ─────────────────────────────────────────────────────

export function useUpdateTestimonial(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formValues }) => HomeService.updateTestimonial(id, formValues),
    onSuccess: (updatedItem, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.testimonials, (old = []) =>
        old.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      );
      options.onSuccess?.(updatedItem, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useDeleteTestimonial ─────────────────────────────────────────────────────

export function useDeleteTestimonial(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => HomeService.deleteTestimonial(id),
    onSuccess: (_data, id, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.testimonials, (old = []) =>
        old.filter((item) => item.id !== id),
      );
      options.onSuccess?.(_data, id, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useReorderTestimonials ───────────────────────────────────────────────────

export function useReorderTestimonials(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items) => HomeService.reorderTestimonials(items),
    onSuccess: (reorderedItems, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.testimonials, reorderedItems);
      options.onSuccess?.(reorderedItems, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useTravelJournal ─────────────────────────────────────────────────────────

/**
 * Fetch all blog articles for the Travel Journal CMS.
 * Returns UI-ready items with resolved image_url.
 * Query key: ['home', 'travel-journal']
 */
export function useTravelJournal() {
  return useQuery({
    queryKey: HOME_QUERY_KEYS.travelJournal,
    queryFn: () => HomeService.loadArticles(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// ─── useToggleHomepageFeatured ────────────────────────────────────────────────

/**
 * Mutation to toggle the homepage_featured flag on an article.
 * On success updates the matching item in the cache directly.
 *
 * @param {object} [options]  Optional useMutation options.
 */
export function useToggleHomepageFeatured(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (/** @type {{ id: string, featured: boolean }} */ variables) =>
      HomeService.toggleHomepageFeatured(variables.id, variables.featured),
    onSuccess: (updatedItem, ...rest) => {
      queryClient.setQueryData(HOME_QUERY_KEYS.travelJournal, (old = []) =>
        old.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      );
      options.onSuccess?.(updatedItem, ...rest);
    },
    onError: options.onError,
  });
}
