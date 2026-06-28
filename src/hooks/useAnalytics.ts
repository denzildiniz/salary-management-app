import { useCallback, useEffect, useState } from 'react';
import { getAnalytics } from '../api';
import type { AnalyticsData } from '../types';

interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  loading: boolean;
  error: string;
  refetch: () => void;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getAnalytics();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
