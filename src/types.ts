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