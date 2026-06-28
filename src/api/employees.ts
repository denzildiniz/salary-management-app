import apiClient from './client';
import type {
  Employee,
  EmployeesResponse,
  EmployeeFormData,
  EmployeeQueryParams,
  BulkRaisePayload,
  BulkRaiseResult,
  ImportResponse,
} from '../types';

export const getEmployees = (params: EmployeeQueryParams) =>
  apiClient.get<EmployeesResponse>('/employees', { params }).then((r) => r.data);

export const createEmployee = (data: EmployeeFormData) =>
  apiClient.post<Employee>('/employees', data).then((r) => r.data);

export const updateEmployee = (id: number, data: EmployeeFormData) =>
  apiClient.put<Employee>(`/employees/${id}`, data).then((r) => r.data);

export const deleteEmployee = (id: number) =>
  apiClient.delete(`/employees/${id}`);

export const bulkRaise = (payload: BulkRaisePayload) =>
  apiClient.post<BulkRaiseResult>('/employees/bulk-raise', payload).then((r) => r.data);

export const importEmployeesCsv = (csvText: string) =>
  apiClient
    .post<ImportResponse>('/employees/import', csvText, {
      headers: { 'Content-Type': 'text/csv' },
    })
    .then((r) => r.data);
