import { apiClient } from './api';

export const getJobs = async () => {
  // Optionally, add auth token if needed
  return apiClient.get('/jobs');
};
