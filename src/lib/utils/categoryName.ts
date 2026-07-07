import { Category } from '@/domain/entities/Category';
import { DEFAULT_CATEGORIES } from '@/lib/constants/defaultCategories';
import { SupportedLanguage } from '@/lib/constants';

const DEFAULT_CATEGORY_ID_PATTERN = /^default_(\d+)$/;

export const getDefaultCategorySeed = (categoryId: string) => {
  const match = DEFAULT_CATEGORY_ID_PATTERN.exec(categoryId);
  if (!match) return null;

  const index = Number(match[1]);
  return DEFAULT_CATEGORIES[index] ?? null;
};

export const getCategoryDisplayName = (
  categoryId: string,
  storedName: string,
  language: SupportedLanguage,
): string => {
  const defaultCategory = getDefaultCategorySeed(categoryId);
  if (defaultCategory) {
    return language === 'id' ? defaultCategory.nameId : defaultCategory.name;
  }

  const matchedDefault = DEFAULT_CATEGORIES.find(
    (category) => category.nameId === storedName || category.name === storedName,
  );

  if (matchedDefault) {
    return language === 'id' ? matchedDefault.nameId : matchedDefault.name;
  }

  return storedName;
};

export const getLocalizedCategoryName = (
  category: Category,
  language: SupportedLanguage,
): string => getCategoryDisplayName(category.id, category.name, language);
