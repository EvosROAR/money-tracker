import { Category } from '../entities/Category';
import { TransactionType } from '../entities/Transaction';

export interface CreateCategoryDTO {
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {
  id: string;
}

export interface ICategoryRepository {
  getAll(type?: TransactionType): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
  create(data: CreateCategoryDTO): Promise<Category>;
  update(data: UpdateCategoryDTO): Promise<Category>;
  delete(id: string): Promise<void>;
  seedDefaults(): Promise<void>;
}
