/**
 * React Query hooks for the CRM module.
 *
 * Query keys:
 *   ['crm', 'inquiries']          — contact inquiry list
 *   ['crm', 'inquiry', id]        — single inquiry
 *   ['crm', 'journey-requests']   — journey request list
 *   ['crm', 'journey-request', id]— single journey request
 *   ['crm', 'newsletter']         — subscriber list
 *   ['crm', 'subscriber', id]     — single subscriber
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listInquiries, getInquiry, updateInquiry, deleteInquiry,
  listJourneyRequests, getJourneyRequest, updateJourneyRequest, deleteJourneyRequest,
  listSubscribers, getSubscriber, updateSubscriber, deleteSubscriber,
} from '@/api/crm.api';
import { handleApiError } from '@/lib/handleApiError';
import { useToast } from '@/components/ui/use-toast';

export const CRM_QUERY_KEYS = {
  inquiries: ['crm', 'inquiries'],
  inquiry: (id) => ['crm', 'inquiry', id],
  journeyRequests: ['crm', 'journey-requests'],
  journeyRequest: (id) => ['crm', 'journey-request', id],
  newsletter: ['crm', 'newsletter'],
  subscriber: (id) => ['crm', 'subscriber', id],
};

function useCrmMutation({ mutationFn, onSuccessInvalidate = [], options = {} }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      onSuccessInvalidate.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      options.onSuccess?.(data, variables, context);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}

// ─── Contact Inquiries ────────────────────────────────────────────────────────

export function useInquiries() {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.inquiries,
    queryFn: listInquiries,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

export function useInquiry(id) {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.inquiry(id),
    queryFn: () => getInquiry(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

export function useUpdateInquiry(options = {}) {
  return useCrmMutation({
    mutationFn: ({ id, data }) => updateInquiry(id, data),
    onSuccessInvalidate: [CRM_QUERY_KEYS.inquiries],
    options,
  });
}

export function useDeleteInquiry(options = {}) {
  return useCrmMutation({
    mutationFn: (id) => deleteInquiry(id),
    onSuccessInvalidate: [CRM_QUERY_KEYS.inquiries],
    options,
  });
}

// ─── Journey Requests ────────────────────────────────────────────────────────

export function useJourneyRequests() {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.journeyRequests,
    queryFn: listJourneyRequests,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

export function useJourneyRequest(id) {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.journeyRequest(id),
    queryFn: () => getJourneyRequest(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

export function useUpdateJourneyRequest(options = {}) {
  return useCrmMutation({
    mutationFn: ({ id, data }) => updateJourneyRequest(id, data),
    onSuccessInvalidate: [CRM_QUERY_KEYS.journeyRequests],
    options,
  });
}

export function useDeleteJourneyRequest(options = {}) {
  return useCrmMutation({
    mutationFn: (id) => deleteJourneyRequest(id),
    onSuccessInvalidate: [CRM_QUERY_KEYS.journeyRequests],
    options,
  });
}

// ─── Newsletter Subscribers ───────────────────────────────────────────────────

export function useSubscribers() {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.newsletter,
    queryFn: listSubscribers,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

export function useSubscriber(id) {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.subscriber(id),
    queryFn: () => getSubscriber(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

export function useUpdateSubscriber(options = {}) {
  return useCrmMutation({
    mutationFn: ({ id, data }) => updateSubscriber(id, data),
    onSuccessInvalidate: [CRM_QUERY_KEYS.newsletter],
    options,
  });
}

export function useDeleteSubscriber(options = {}) {
  return useCrmMutation({
    mutationFn: (id) => deleteSubscriber(id),
    onSuccessInvalidate: [CRM_QUERY_KEYS.newsletter],
    options,
  });
}
