import { useCallback } from 'react';

import { Category } from '@/domain/entities/Category';
import {
  getCategoryDisplayName,
  getLocalizedCategoryName,
} from '@/lib/utils/categoryName';
import { useSettingsStore } from '@/store/settingsStore';

export const useCategoryDisplayName = () => {
  const language = useSettingsStore((s) => s.language);

  const resolveName = useCallback(
    (categoryId: string, storedName: string) =>
      getCategoryDisplayName(categoryId, storedName, language),
    [language],
  );

  const resolveCategory = useCallback(
    (category: Category) => getLocalizedCategoryName(category, language),
    [language],
  );

  return { resolveName, resolveCategory, language };
};
