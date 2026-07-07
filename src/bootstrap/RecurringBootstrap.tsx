import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { processDueRecurringTransactions } from '@/application/recurring/RecurringTransactionProcessor';
import { useAuthStore } from '@/store/authStore';

export const RecurringBootstrap = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    void processDueRecurringTransactions()
      .then((created) => {
        if (created > 0) {
          void queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
          void queryClient.invalidateQueries({ queryKey: ['recurring_transactions', userId] });
        }
      })
      .catch(() => {
        // Rules belum di-deploy atau offline — jangan ganggu app
      });
  }, [isAuthenticated, userId, queryClient]);

  return null;
};
