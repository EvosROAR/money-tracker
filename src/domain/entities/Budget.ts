export interface Budget {
  id: string;
  month: string;
  categoryId: string;
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
  warningThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}
