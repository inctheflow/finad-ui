import axios from 'axios';
import type { Transaction, UploadResponse, AnalyticsData, CashResponse, AccountInfo, TellerAccount, TellerSyncResult } from './types';

const api = axios.create({ baseURL: 'http://localhost:3000' });

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on expired / invalid token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

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

export const sendChatMessage = async (message: string): Promise<string> => {
  const res = await api.post('/chat', { message });
  return res.data.reply;
};

export const getAccount = async (): Promise<AccountInfo> => {
  const res = await api.get('/account');
  return res.data;
};

export const updateAccount = async (data: {
  phone?: string;
  security_question?: string;
  security_answer?: string;
}): Promise<void> => {
  await api.put('/account', data);
};

export const changePassword = async (
  current_password: string,
  new_password: string,
): Promise<void> => {
  await api.put('/account/password', { current_password, new_password });
};

export const tellerEnroll = async (
  access_token: string,
  enrollment_id: string,
  institution_name: string,
): Promise<{ message: string; accounts: number }> => {
  const res = await api.post('/teller/enroll', { access_token, enrollment_id, institution_name });
  return res.data;
};

export const tellerSync = async (): Promise<TellerSyncResult> => {
  const res = await api.post('/teller/sync');
  return res.data;
};

export const getTellerAccounts = async (): Promise<TellerAccount[]> => {
  const res = await api.get('/teller/accounts');
  return res.data.accounts;
};

export const disconnectTellerAccount = async (id: number): Promise<void> => {
  await api.delete(`/teller/accounts/${id}`);
};
