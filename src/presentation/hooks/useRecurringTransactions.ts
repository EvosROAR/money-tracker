import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { RecurringTransaction } from '@/domain/entities/RecurringTransaction';
import {
  CreateRecurringTransactionDTO,
  UpdateRecurringTransactionDTO,
} from '@/domain/repositories/IRecurringTransactionRepository';
import { recurringTransactionRepository } from '@/infrastructure/firebase/firestore/FirestoreRecurringTransactionRepository';
import { useAuthStore } from '@/store/authStore';

const recurringKeys = {
  all: (userId: string) => ['recurring_transactions', userId] as const,
  detail: (userId: string, id: string) => [...recurringKeys.all(userId), id] as const,
};

export const useRecurringTransactions = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: recurringKeys.all(userId ?? ''),
    queryFn: () => recurringTransactionRepository.getAll(),
    enabled: !!userId,
  });

  const invalidate = () => {
    if (userId) {
      void queryClient.invalidateQueries({ queryKey: recurringKeys.all(userId) });
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateRecurringTransactionDTO) => recurringTransactionRepository.create(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateRecurringTransactionDTO) => recurringTransactionRepository.update(data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => recurringTransactionRepository.delete(id),
    onSuccess: invalidate,
  });

  return {
    recurringTransactions: query.data ?? [],
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    refetch: query.refetch,
    createRecurring: createMutation.mutateAsync,
    updateRecurring: updateMutation.mutateAsync,
    deleteRecurring: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useRecurringTransaction = (id: string | undefined) => {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: recurringKeys.detail(userId ?? '', id ?? ''),
    queryFn: () => (id ? recurringTransactionRepository.getById(id) : Promise.resolve(null)),
    enabled: !!userId && !!id,
  });
};

export type { RecurringTransaction };
