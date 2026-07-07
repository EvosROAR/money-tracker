import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Budget } from '@/domain/entities/Budget';
import {
  CreateBudgetDTO,
  UpdateBudgetDTO,
} from '@/domain/repositories/IBudgetRepository';
import { budgetRepository } from '@/infrastructure/firebase/firestore/FirestoreBudgetRepository';
import { enrichBudgetsWithSpent, parseMonthKey } from '@/lib/utils/reports';
import { useAllTransactions } from '@/presentation/hooks/useTransactions';
import { useAuthStore } from '@/store/authStore';

const budgetKeys = {
  all: (userId: string) => ['budgets', userId] as const,
  month: (userId: string, month: string) => [...budgetKeys.all(userId), month] as const,
  detail: (userId: string, id: string) => [...budgetKeys.all(userId), id] as const,
};

export const useBudgets = (monthKey: string) => {
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const { data: transactions = [] } = useAllTransactions();
  const month = parseMonthKey(monthKey);

  const query = useQuery({
    queryKey: budgetKeys.month(userId ?? '', monthKey),
    queryFn: () => budgetRepository.getByMonth(monthKey),
    enabled: !!userId && !!monthKey,
  });

  const budgets = useMemo(
    () => enrichBudgetsWithSpent(query.data ?? [], transactions, month),
    [query.data, transactions, month],
  );

  const invalidate = () => {
    if (userId) {
      void queryClient.invalidateQueries({ queryKey: budgetKeys.all(userId) });
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateBudgetDTO) => budgetRepository.create(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateBudgetDTO) => budgetRepository.update(data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetRepository.delete(id),
    onSuccess: invalidate,
  });

  return {
    budgets,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    refetch: query.refetch,
    createBudget: createMutation.mutateAsync,
    updateBudget: updateMutation.mutateAsync,
    deleteBudget: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useBudget = (id: string | undefined) => {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: budgetKeys.detail(userId ?? '', id ?? ''),
    queryFn: () => (id ? budgetRepository.getById(id) : Promise.resolve(null)),
    enabled: !!userId && !!id,
  });
};

export type { Budget };
