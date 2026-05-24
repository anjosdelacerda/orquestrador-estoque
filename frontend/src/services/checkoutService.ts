import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './api';

export interface Product {
  id: string;
  name: string;
  image: string;
  priceInCents: number;
  stockQuantity: number;
  version: number;
}

export interface CheckoutPayload {
  productId: string;
  quantity: number;
}

export interface CheckoutAttempt {
  id: string;
  requestedQuantity: number;
  totalValueInCents: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage: string | null;
}

const PRODUCTS_KEY = ['products'] as const;

async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/api/products');
  return data;
}

async function postCheckout(payload: CheckoutPayload): Promise<CheckoutAttempt> {
  const { data } = await api.post<CheckoutAttempt>('/api/checkout', payload);
  return data;
}

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: fetchProducts,
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postCheckout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}
