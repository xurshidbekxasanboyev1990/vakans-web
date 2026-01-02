import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';
import { IS_DEVELOPMENT } from './constants';

// Admin panelda DevTools ko'rsatish uchun
const isAdminPage = () => {
  if (typeof window !== 'undefined') {
    return window.location.pathname.startsWith('/admin');
  }
  return false;
};

// QueryClient yaratish
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - ma'lumotlar qancha vaqt "yangi" deb hisoblanadi
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // Cache time - ma'lumotlar keshda qancha vaqt saqlanadi
      gcTime: 1000 * 60 * 30, // 30 minutes (was cacheTime)
      
      // Retry settings
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch settings
      refetchOnWindowFocus: false, // Oyna fokusga kelganda qayta so'rov yubormaslik
      refetchOnMount: true,
      refetchOnReconnect: true,
      
      // Network mode
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools faqat admin panelda ko'rinadi */}
      {IS_DEVELOPMENT && isAdminPage() && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

// Export queryClient for manual cache manipulation
export { queryClient };
