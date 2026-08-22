import { useQuery } from '@tanstack/react-query';
import DashboardService from '@/services/dashboard.service';

export const DASHBOARD_QUERY_KEY = ['dashboard', 'overview'];

export function useDashboardOverview() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: () => DashboardService.loadOverview(),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    retry: 1,
  });
}
