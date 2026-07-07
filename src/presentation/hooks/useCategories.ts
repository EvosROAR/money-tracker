import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Category } from '@/domain/entities/Category';
import { TransactionType } from '@/domain/entities/Transaction';
import {
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from '@/domain/repositories/ICategoryRepository';
import { categoryRepository } from '@/infrastructure/firebase/firestore/FirestoreCategoryRepository';
import { useAuthStore } from '@/store/authStore';

const categoryKeys = {
  all: (userId: string) => ['categories', userId] as const,
  list: (userId: string, type?: TransactionType) =>
    [...categoryKeys.all(userId), type ?? 'all'] as const,
  detail: (userId: string, id: string) => [...categoryKeys.all(userId), id] as const,
};

export const useCategories = (type?: TransactionType) => {
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: categoryKeys.list(userId ?? '', type),
    queryFn: () => categoryRepository.getAll(type),
    enabled: !!userId,
  });

  const invalidate = () => {
    if (userId) {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all(userId) });
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryDTO) => categoryRepository.create(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCategoryDTO) => categoryRepository.update(data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryRepository.delete(id),
    onSuccess: invalidate,
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useCategory = (id: string | undefined) => {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: categoryKeys.detail(userId ?? '', id ?? ''),
    queryFn: () => (id ? categoryRepository.getById(id) : Promise.resolve(null)),
    enabled: !!userId && !!id,
  });
};

export const filterCategoriesByType = (
  categories: Category[],
  type: TransactionType,
): Category[] => categories.filter((c) => c.type === type);
