import { getCategoryDisplayName, getLocalizedCategoryName } from '@/lib/utils/categoryName';
import { Category } from '@/domain/entities/Category';

describe('categoryName utils', () => {
  it('returns English name for default category id', () => {
    expect(getCategoryDisplayName('default_3', 'Tagihan', 'en')).toBe('Bills');
    expect(getCategoryDisplayName('default_7', 'Hewan Peliharaan', 'en')).toBe('Pet');
    expect(getCategoryDisplayName('default_9', 'Gaji', 'en')).toBe('Salary');
    expect(getCategoryDisplayName('default_14', 'Lainnya', 'en')).toBe('Other');
  });

  it('returns Indonesian name for default category id', () => {
    expect(getCategoryDisplayName('default_3', 'Bills', 'id')).toBe('Tagihan');
  });

  it('maps stored Indonesian name to English when id is unknown', () => {
    expect(getCategoryDisplayName('custom-id', 'Transportasi', 'en')).toBe('Transport');
    expect(getCategoryDisplayName('custom-id', 'Kesehatan', 'en')).toBe('Health');
  });

  it('keeps custom category names unchanged', () => {
    expect(getCategoryDisplayName('custom-id', 'Pinjol', 'en')).toBe('Pinjol');
  });

  it('localizes category entity', () => {
    const category: Category = {
      id: 'default_1',
      name: 'Transportasi',
      type: 'expense',
      icon: 'car',
      color: '#4ECDC4',
      isDefault: true,
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(getLocalizedCategoryName(category, 'en')).toBe('Transport');
  });
});
