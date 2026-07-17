import { apiClient } from '@/lib/apiClient';

export const updateMe = async (data: { full_name: string }) => {
  const res = await apiClient.patch('/users/me', data);
  return res.data;
};
