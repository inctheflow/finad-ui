import axios from 'axios';
import type { Transaction, UploadResponse, AnalyticsData, CashResponse } from './types';

const api = axios.create({ baseURL: 'http://localhost:3000' });

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email: string, password: string): Promise<string> => {
  const res = await api.post('/login', { email, password });
  return res.data.token;
};

export const register = async (email: string, password: string): Promise<string> => {
  const res = await api.post('/register', { email, password });
  return res.data.token;
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const res = await api.get('/transactions');
  return res.data.transactions;
};

export const getSummary = async (): Promise<string> => {
  const res = await api.get('/summary');
  return res.data.summary;
};

export const uploadPdf = async (file: File): Promise<UploadResponse> => {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post('/upload', form);
  return res.data;
};

export const getAnalytics = async (): Promise<AnalyticsData> => {
  const res = await api.get('/analytics');
  return res.data;
};

export const getCashEntries = async (): Promise<CashResponse> => {
  const res = await api.get('/cash');
  return res.data;
};

export const addCashEntry = async (
  date: string,
  amount: number,
  entry_type: 'income' | 'expense',
  description: string,
): Promise<void> => {
  await api.post('/cash', { date, amount, entry_type, description });
};

export const deleteCashEntry = async (id: number): Promise<void> => {
  await api.delete(`/cash/${id}`);
};
