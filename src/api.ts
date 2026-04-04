import axios from 'axios';
import type { Transaction, UploadResponse } from './types';

// your Rust backend
const BASE = 'http://localhost:3000';

export const getTransactions = async (): Promise<Transaction[]> => {
  const res = await axios.get(`${BASE}/transactions`);
  return res.data.transactions;
};

export const getSummary = async (): Promise<string> => {
  const res = await axios.get(`${BASE}/summary`);
  return res.data.summary;
};

export const uploadPdf = async (file: File): Promise<UploadResponse> => {
  const form = new FormData();
  form.append('file', file);
  const res = await axios.post(`${BASE}/upload`, form);
  return res.data;
};