/**
 * React Query hooks for the About CMS module.
 *
 * Query keys:
 *   ['about', 'page']        — singleton About page content
 *   ['about', 'statistics']  — company statistics
 *   ['about', 'core-values'] — core values list
 *   ['about', 'leadership']  — leadership team
 *   ['about', 'timeline']    — company timeline
 *   ['about', 'awards']      — awards
 *   ['about', 'partners']    — partners
 *   ['about', 'faqs']        — FAQs
 *
 * Architecture mirrors use-home.js exactly.
 * Component → hook → AboutService → about.api.js → Axios → Backend
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AboutService from '@/services/about.service';

export const ABOUT_QUERY_KEYS = {
  page:       ['about', 'page'],
  statistics: ['about', 'statistics'],
  coreValues: ['about', 'core-values'],
  leadership: ['about', 'leadership'],
  timeline:   ['about', 'timeline'],
  awards:     ['about', 'awards'],
  partners:   ['about', 'partners'],
  faqs:       ['about', 'faqs'],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generic list query factory. */
function makeListQuery(key, loader) {
  return function useList() {
    return useQuery({
      queryKey: key,
      queryFn: loader,
      staleTime: 1000 * 60 * 5,
      retry: 1,
    });
  };
}

/** Generic create mutation factory. */
function makeCreate(key, creator) {
  return function useCreate(options = {}) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (form) => creator(form),
      onSuccess: (item, ...rest) => {
        qc.setQueryData(key, (old = []) => [...old, item]);
        options.onSuccess?.(item, ...rest);
      },
      onError: options.onError,
    });
  };
}

/** Generic update mutation factory. */
function makeUpdate(key, updater) {
  return function useUpdate(options = {}) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, form }) => updater(id, form),
      onSuccess: (item, ...rest) => {
        qc.setQueryData(key, (old = []) =>
          old.map((x) => (x.id === item.id ? item : x)),
        );
        options.onSuccess?.(item, ...rest);
      },
      onError: options.onError,
    });
  };
}

/** Generic delete mutation factory. */
function makeDelete(key) {
  return function useDelete(options = {}) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id) => AboutService[`delete${key}`]?.(id),
      onSuccess: (_d, id, ...rest) => {
        qc.setQueryData(ABOUT_QUERY_KEYS[key.toLowerCase()] ?? key, (old = []) =>
          old.filter((x) => x.id !== id),
        );
        options.onSuccess?.(_d, id, ...rest);
      },
      onError: options.onError,
    });
  };
}

/** Generic reorder mutation factory. */
function makeReorder(key, reorderer) {
  return function useReorder(options = {}) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (items) => reorderer(items),
      onSuccess: (items, ...rest) => {
        qc.setQueryData(key, items);
        options.onSuccess?.(items, ...rest);
      },
      onError: options.onError,
    });
  };
}

// ─── About Page ───────────────────────────────────────────────────────────────

export function useAboutPage() {
  return useQuery({
    queryKey: ABOUT_QUERY_KEYS.page,
    queryFn: () => AboutService.loadAboutPage(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useUpdateAboutPage(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form) => AboutService.updateAboutPage(form),
    onSuccess: (data, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.page, data);
      options.onSuccess?.(data, ...rest);
    },
    onError: options.onError,
  });
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export const useAboutStatistics = makeListQuery(ABOUT_QUERY_KEYS.statistics, () => AboutService.loadStatistics());

export function useCreateAboutStatistic(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form) => AboutService.createStatistic(form),
    onSuccess: (item, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.statistics, (old = []) => [...old, item]);
      options.onSuccess?.(item, ...rest);
    },
    onError: options.onError,
  });
}

export function useUpdateAboutStatistic(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }) => AboutService.updateStatistic(id, form),
    onSuccess: (item, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.statistics, (old = []) =>
        old.map((x) => (x.id === item.id ? item : x)),
      );
      options.onSuccess?.(item, ...rest);
    },
    onError: options.onError,
  });
}

export function useDeleteAboutStatistic(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => AboutService.deleteStatistic(id),
    onSuccess: (_d, id, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.statistics, (old = []) => old.filter((x) => x.id !== id));
      options.onSuccess?.(_d, id, ...rest);
    },
    onError: options.onError,
  });
}

export function useReorderAboutStatistics(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items) => AboutService.reorderStatistics(items),
    onSuccess: (items, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.statistics, items);
      options.onSuccess?.(items, ...rest);
    },
    onError: options.onError,
  });
}

// ─── Core Values ─────────────────────────────────────────────────────────────

export const useCoreValues = makeListQuery(ABOUT_QUERY_KEYS.coreValues, () => AboutService.loadCoreValues());

export function useCreateCoreValue(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form) => AboutService.createCoreValue(form),
    onSuccess: (item, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.coreValues, (old = []) => [...old, item]);
      options.onSuccess?.(item, ...rest);
    },
    onError: options.onError,
  });
}

export function useUpdateCoreValue(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }) => AboutService.updateCoreValue(id, form),
    onSuccess: (item, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.coreValues, (old = []) =>
        old.map((x) => (x.id === item.id ? item : x)),
      );
      options.onSuccess?.(item, ...rest);
    },
    onError: options.onError,
  });
}

export function useDeleteCoreValue(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => AboutService.deleteCoreValue(id),
    onSuccess: (_d, id, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.coreValues, (old = []) => old.filter((x) => x.id !== id));
      options.onSuccess?.(_d, id, ...rest);
    },
    onError: options.onError,
  });
}

export function useReorderCoreValues(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items) => AboutService.reorderCoreValues(items),
    onSuccess: (items, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.coreValues, items);
      options.onSuccess?.(items, ...rest);
    },
    onError: options.onError,
  });
}

// ─── Leadership ───────────────────────────────────────────────────────────────

export const useLeadership = makeListQuery(ABOUT_QUERY_KEYS.leadership, () => AboutService.loadLeadership());

export function useCreateLeader(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form) => AboutService.createLeader(form),
    onSuccess: (item, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.leadership, (old = []) => [...old, item]);
      options.onSuccess?.(item, ...rest);
    },
    onError: options.onError,
  });
}

export function useUpdateLeader(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }) => AboutService.updateLeader(id, form),
    onSuccess: (item, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.leadership, (old = []) =>
        old.map((x) => (x.id === item.id ? item : x)),
      );
      options.onSuccess?.(item, ...rest);
    },
    onError: options.onError,
  });
}

export function useDeleteLeader(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => AboutService.deleteLeader(id),
    onSuccess: (_d, id, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.leadership, (old = []) => old.filter((x) => x.id !== id));
      options.onSuccess?.(_d, id, ...rest);
    },
    onError: options.onError,
  });
}

export function useReorderLeadership(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items) => AboutService.reorderLeadership(items),
    onSuccess: (items, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.leadership, items);
      options.onSuccess?.(items, ...rest);
    },
    onError: options.onError,
  });
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export const useTimeline = makeListQuery(ABOUT_QUERY_KEYS.timeline, () => AboutService.loadTimeline());

export function useCreateTimelineItem(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form) => AboutService.createTimelineItem(form),
    onSuccess: (item, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.timeline, (old = []) => [...old, item]);
      options.onSuccess?.(item, ...rest);
    },
    onError: options.onError,
  });
}

export function useUpdateTimelineItem(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }) => AboutService.updateTimelineItem(id, form),
    onSuccess: (item, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.timeline, (old = []) =>
        old.map((x) => (x.id === item.id ? item : x)),
      );
      options.onSuccess?.(item, ...rest);
    },
    onError: options.onError,
  });
}

export function useDeleteTimelineItem(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => AboutService.deleteTimelineItem(id),
    onSuccess: (_d, id, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.timeline, (old = []) => old.filter((x) => x.id !== id));
      options.onSuccess?.(_d, id, ...rest);
    },
    onError: options.onError,
  });
}

export function useReorderTimeline(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items) => AboutService.reorderTimeline(items),
    onSuccess: (items, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.timeline, items);
      options.onSuccess?.(items, ...rest);
    },
    onError: options.onError,
  });
}

// ─── Awards ───────────────────────────────────────────────────────────────────

export const useAwards = makeListQuery(ABOUT_QUERY_KEYS.awards, () => AboutService.loadAwards());

export function useCreateAward(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form) => AboutService.createAward(form),
    onSuccess: (item, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.awards, (old = []) => [...old, item]);
      options.onSuccess?.(item, ...rest);
    },
    onError: options.onError,
  });
}

export function useUpdateAward(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }) => AboutService.updateAward(id, form),
    onSuccess: (item, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.awards, (old = []) =>
        old.map((x) => (x.id === item.id ? item : x)),
      );
      options.onSuccess?.(item, ...rest);
    },
    onError: options.onError,
  });
}

export function useDeleteAward(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => AboutService.deleteAward(id),
    onSuccess: (_d, id, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.awards, (old = []) => old.filter((x) => x.id !== id));
      options.onSuccess?.(_d, id, ...rest);
    },
    onError: options.onError,
  });
}

export function useReorderAwards(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items) => AboutService.reorderAwards(items),
    onSuccess: (items, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.awards, items);
      options.onSuccess?.(items, ...rest);
    },
    onError: options.onError,
  });
}

// ─── Partners ─────────────────────────────────────────────────────────────────

export const usePartners = makeListQuery(ABOUT_QUERY_KEYS.partners, () => AboutService.loadPartners());

export function useCreatePartner(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form) => AboutService.createPartner(form),
    onSuccess: (item, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.partners, (old = []) => [...old, item]);
      options.onSuccess?.(item, ...rest);
    },
    onError: options.onError,
  });
}

export function useUpdatePartner(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }) => AboutService.updatePartner(id, form),
    onSuccess: (item, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.partners, (old = []) =>
        old.map((x) => (x.id === item.id ? item : x)),
      );
      options.onSuccess?.(item, ...rest);
    },
    onError: options.onError,
  });
}

export function useDeletePartner(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => AboutService.deletePartner(id),
    onSuccess: (_d, id, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.partners, (old = []) => old.filter((x) => x.id !== id));
      options.onSuccess?.(_d, id, ...rest);
    },
    onError: options.onError,
  });
}

export function useReorderPartners(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items) => AboutService.reorderPartners(items),
    onSuccess: (items, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.partners, items);
      options.onSuccess?.(items, ...rest);
    },
    onError: options.onError,
  });
}

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export const useAboutFaqs = makeListQuery(ABOUT_QUERY_KEYS.faqs, () => AboutService.loadFaqs());

export function useCreateAboutFaq(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form) => AboutService.createFaq(form),
    onSuccess: (item, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.faqs, (old = []) => [...old, item]);
      options.onSuccess?.(item, ...rest);
    },
    onError: options.onError,
  });
}

export function useUpdateAboutFaq(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }) => AboutService.updateFaq(id, form),
    onSuccess: (item, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.faqs, (old = []) =>
        old.map((x) => (x.id === item.id ? item : x)),
      );
      options.onSuccess?.(item, ...rest);
    },
    onError: options.onError,
  });
}

export function useDeleteAboutFaq(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => AboutService.deleteFaq(id),
    onSuccess: (_d, id, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.faqs, (old = []) => old.filter((x) => x.id !== id));
      options.onSuccess?.(_d, id, ...rest);
    },
    onError: options.onError,
  });
}

export function useReorderAboutFaqs(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items) => AboutService.reorderFaqs(items),
    onSuccess: (items, ...rest) => {
      qc.setQueryData(ABOUT_QUERY_KEYS.faqs, items);
      options.onSuccess?.(items, ...rest);
    },
    onError: options.onError,
  });
}
