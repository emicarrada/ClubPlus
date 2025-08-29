import { QueryClient } from '@tanstack/react-query';

// React Query configuration optimized for Club+ MVP
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Cache time - how long data stays in cache after being unused
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      // Refetch configuration
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      // Global mutation configuration
      retry: false,
      // Global error handling for mutations
      onError: (error: any) => {
        console.error('Mutation error:', error);
        // You can add global error handling here (toast notifications, etc.)
      },
    },
  },
});
