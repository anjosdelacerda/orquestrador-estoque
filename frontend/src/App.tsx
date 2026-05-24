import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StorePage } from './app/views/StorePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StorePage />
    </QueryClientProvider>
  );
}
