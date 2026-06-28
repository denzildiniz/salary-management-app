import { useCallback, useEffect, useState } from 'react';
import { getEmployees } from '../api';
import type { Employee, EmployeeQueryParams } from '../types';

interface UseEmployeesReturn {
  employees: Employee[];
  totalCount: number;
  loading: boolean;
  refetch: () => void;
}

export function useEmployees(params: EmployeeQueryParams): UseEmployeesReturn {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const { page, limit, search, department, country, minSalary, maxSalary, sortBy, sortOrder } =
    params;

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getEmployees({
        page,
        limit,
        search,
        department,
        country,
        minSalary,
        maxSalary,
        sortBy,
        sortOrder,
      });
      setEmployees(result.employees);
      setTotalCount(result.pagination.totalCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    // primitive deps — stable across re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, department, country, minSalary, maxSalary, sortBy, sortOrder]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { employees, totalCount, loading, refetch };
}
