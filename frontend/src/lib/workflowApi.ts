import { apiClient } from './api';

export const getWorkflows = () => {
  return apiClient.get('/workflows');
};

export const getWorkflow = (id: string) => {
  return apiClient.get(`/workflows/${id}`);
};

export const createWorkflow = (data: any) => {
  return apiClient.post('/workflows', data);
};

export const updateWorkflow = (id: string, data: any) => {
  return apiClient.put(`/workflows/${id}`, data);
};

export const deleteWorkflow = (id: string) => {
  return apiClient.delete(`/workflows/${id}`);
};

export const runWorkflow = (id: string, input = {}) => {
  return apiClient.post(`/workflows/${id}/run`, { input });
};
