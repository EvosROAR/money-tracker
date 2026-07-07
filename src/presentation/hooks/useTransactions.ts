import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Transaction } from '@/domain/entities/Transaction';
import {
  CreateTransactionDTO,
  TransactionFilters,
  UpdateTransactionDTO,
} from '@/domain/repositories/ITransactionRepository';
import { transactionRepository } from '@/infrastructure/firebase/firestore/FirestoreTransactionRepository';
import { useAuthStore } from '@/store/authStore';

const transactionKeys = {
  all: (userId: string) => ['transactions', userId] as const,
  list: (userId: string, filters?: TransactionFilters) =>
    [...transactionKeys.all(userId), filters ?? {}] as const,
  detail: (userId: string, id: string) => [...transactionKeys.all(userId), id] as const,
  recent: (userId: string, limit: number) =>
    [...transactionKeys.all(userId), 'recent', limit] as const,
};

export const useTransactions = (filters?: TransactionFilters) => {
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: transactionKeys.list(userId ?? '', filters),
    queryFn: () => transactionRepository.getAll(filters),
    enabled: !!userId,
  });

  const invalidate = () => {
    if (userId) {
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all(userId) });
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateTransactionDTO) => transactionRepository.create(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTransactionDTO) => transactionRepository.update(data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionRepository.delete(id),
    onSuccess: invalidate,
  });

  return {
    transactions: query.data ?? [],
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
    createTransaction: createMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useRecentTransactions = (limit = 5) => {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: transactionKeys.recent(userId ?? '', limit),
    queryFn: () => transactionRepository.getRecent(limit),
    enabled: !!userId,
  });
};

export const useTransaction = (id: string | undefined) => {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: transactionKeys.detail(userId ?? '', id ?? ''),
    queryFn: () => (id ? transactionRepository.getById(id) : Promise.resolve(null)),
    enabled: !!userId && !!id,
  });
};

export const useAllTransactions = () => {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: transactionKeys.all(userId ?? ''),
    queryFn: () => transactionRepository.getAll(),
    enabled: !!userId,
  });
};

export type { Transaction };
