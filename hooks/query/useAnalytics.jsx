import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/platform/analytics-api';

const ANALYTICS_KEYS = {
  dashboard: (period) => ['analytics', 'dashboard', period],
};

/**
 * Hook to fetch dashboard analytics data
 * @param {Object} options
 * @param {string} options.token - Auth token (required)
 * @param {string} [options.period='30d'] - Period: '7d' or '30d'
 * @param {boolean} [options.enabled=true] - Enable/disable query
 * @returns {Object} Query result with analytics data
 */
export function useAnalyticsDashboard({ token, period = '30d', enabled = true } = {}) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.dashboard(period),
    queryFn: () => analyticsApi.getDashboard({ token, period }),
    enabled: enabled && !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes (analytics data updates frequently)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // Refresh analytics on window focus
    retry: 1,
  });
}

export { ANALYTICS_KEYS };
