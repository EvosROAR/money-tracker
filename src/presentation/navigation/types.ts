import { NavigatorScreenParams } from '@react-navigation/native';

import { TransactionType } from '@/domain/entities/Transaction';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Transactions: NavigatorScreenParams<TransactionsStackParamList> | undefined;
  Budget: NavigatorScreenParams<BudgetStackParamList> | undefined;
  Reports: NavigatorScreenParams<ReportsStackParamList> | undefined;
  Settings: undefined;
};

export type TransactionsStackParamList = {
  TransactionList: undefined;
  TransactionForm: { transactionId?: string; type?: TransactionType };
  RecurringList: undefined;
  RecurringForm: { recurringId?: string; type?: TransactionType };
};

export type BudgetStackParamList = {
  BudgetList: undefined;
  BudgetForm: { budgetId?: string; month?: string };
};

export type ReportsStackParamList = {
  ReportsMain: undefined;
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  Profile: undefined;
  CategoryList: undefined;
  CategoryForm: { categoryId?: string; type?: TransactionType };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
