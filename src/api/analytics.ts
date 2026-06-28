import apiClient from './client';
import type { AnalyticsData, NlpQueryResult } from '../types';

export const getAnalytics = () =>
  apiClient.get<AnalyticsData>('/analytics').then((r) => r.data);

export const nlpQuery = (q: string) =>
  apiClient.get<NlpQueryResult>('/query', { params: { q } }).then((r) => r.data);
