import axios from 'axios';

export class ApiError extends Error {
  details?: string[];
  constructor(message: string, details?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.details = details;
  }
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ?? error.message ?? 'An unexpected error occurred';
    const details = error.response?.data?.details as string[] | undefined;
    return Promise.reject(new ApiError(message, details));
  }
);

export default apiClient;
