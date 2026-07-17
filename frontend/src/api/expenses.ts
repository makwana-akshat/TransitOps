import { apiClient } from '@/lib/apiClient';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

// ─── Fuel Logs ──────────────────────────────────────────────────────────────
export const fetchFuelLogs = async (params?: Record<string, any>): Promise<PaginatedResponse<any>> => {
  const { data } = await apiClient.get<PaginatedResponse<any>>('/fuel-logs', { params });
  return data;
};

export const createFuelLog = async (payload: any): Promise<ApiResponse<any>> => {
  const { data } = await apiClient.post<ApiResponse<any>>('/fuel-logs', payload);
  return data;
};

export const fetchFuelSummary = async (): Promise<ApiResponse<any>> => {
  const { data } = await apiClient.get<ApiResponse<any>>('/fuel-logs/summary');
  return data;
};

// ─── Expenses ────────────────────────────────────────────────────────────────
export const fetchExpenses = async (params?: Record<string, any>): Promise<PaginatedResponse<any>> => {
  const { data } = await apiClient.get<PaginatedResponse<any>>('/expenses', { params });
  return data;
};

export const createExpense = async (payload: any): Promise<ApiResponse<any>> => {
  const { data } = await apiClient.post<ApiResponse<any>>('/expenses', payload);
  return data;
};

export const fetchExpenseSummary = async (): Promise<ApiResponse<any>> => {
  const { data } = await apiClient.get<ApiResponse<any>>('/expenses/summary');
  return data;
};
