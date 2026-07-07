import { Transaction, TransactionType } from '../entities/Transaction';

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface CreateTransactionDTO {
  type: TransactionType;
  amount: number;
  categoryId: string;
  note?: string;
  date: Date;
}

export interface UpdateTransactionDTO extends Partial<CreateTransactionDTO> {
  id: string;
}

export interface ITransactionRepository {
  getAll(filters?: TransactionFilters): Promise<Transaction[]>;
  getById(id: string): Promise<Transaction | null>;
  create(data: CreateTransactionDTO): Promise<Transaction>;
  update(data: UpdateTransactionDTO): Promise<Transaction>;
  delete(id: string): Promise<void>;
  getRecent(limit: number): Promise<Transaction[]>;
}
