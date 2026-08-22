import { QueryClient } from '@tanstack/react-query';
import { cacheTimes } from '@/lib/api-cache';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: cacheTimes.list,
			gcTime: 1000 * 60 * 60,
			refetchOnWindowFocus: false,
			retry: (failureCount, error) => {
				if (error?.status >= 400 && error?.status < 500) return false;
				return failureCount < 1;
			},
		},
	},
});
