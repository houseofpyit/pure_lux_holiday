import { useMutation } from '@tanstack/react-query';
import { createJourneyRequest, subscribeToNewsletter } from '@/api/forms.api';
import { mapJourneyRequestPayload, mapNewsletterPayload } from '@/services/mappers/public.mapper';

export function useJourneyRequest(options = {}) {
  return useMutation({
    mutationFn: (form) => createJourneyRequest(mapJourneyRequestPayload(form)),
    ...options,
  });
}

export function useNewsletterSubscribe(options = {}) {
  return useMutation({
    mutationFn: ({ email, name }) => subscribeToNewsletter(mapNewsletterPayload(email, name)),
    ...options,
  });
}
