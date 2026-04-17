// mirrors your Rust Record struct exactly
export interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
}

// what the /summary endpoint returns
export interface SummaryResponse {
  summary: string;
}

// what the /transactions endpoint returns
export interface TransactionsResponse {
  transactions: Transaction[];
}

// what the /upload endpoint returns
export interface UploadResponse {
  message: string;
  count: number;
}

export interface TopExpense {
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface AnalyticsData {
  monthly_average: number;
  top_expenses: TopExpense[];
  tips: string[];
}

export interface CashEntry {
  id: number;
  date: string;
  amount: number;
  entry_type: 'income' | 'expense';
  description: string;
}

export interface CashResponse {
  entries: CashEntry[];
  total_income: number;
  total_expense: number;
  net: number;
}