import { Budget } from '@/domain/entities/Budget';

export interface CreateBudgetDTO {
  month: string;
  categoryId: string;
  limitAmount: number;
  warningThreshold?: number;
}

export interface UpdateBudgetDTO extends Partial<CreateBudgetDTO> {
  id: string;
}

export interface IBudgetRepository {
  getByMonth(month: string): Promise<Budget[]>;
  getById(id: string): Promise<Budget | null>;
  create(data: CreateBudgetDTO): Promise<Budget>;
  update(data: UpdateBudgetDTO): Promise<Budget>;
  delete(id: string): Promise<void>;
}
