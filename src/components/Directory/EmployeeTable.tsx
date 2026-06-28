import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Edit2, History, Trash2 } from 'lucide-react';
import { Spinner } from '../ui/Spinner';
import type { Employee } from '../../types';

interface SortColumn {
  key: string;
  label: string;
  align?: 'right' | 'center';
}

const SORT_COLUMNS: SortColumn[] = [
  { key: 'employee_id', label: 'ID' },
  { key: 'first_name', label: 'Employee' },
  { key: 'job_title', label: 'Job Title' },
  { key: 'department', label: 'Dept' },
  { key: 'country', label: 'Country' },
  { key: 'salary', label: 'Salary', align: 'right' },
  { key: 'salary_usd', label: 'USD Equivalent', align: 'right' },
  { key: 'performance_rating', label: 'Rating', align: 'center' },
];

interface Props {
  employees: Employee[];
  loading: boolean;
  totalCount: number;
  page: number;
  totalPages: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  onSort: (col: string) => void;
  onEdit: (emp: Employee) => void;
  onDelete: (id: number) => void;
  onPageChange: (page: number) => void;
}

export function EmployeeTable({
  employees, loading, totalCount, page, totalPages,
  sortBy, sortOrder, onSort, onEdit, onDelete, onPageChange,
}: Props) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full text-slate-300 text-sm text-left">
          <thead>
            <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-xs">
              {SORT_COLUMNS.map(({ key, label, align }) => (
                <th
                  key={key}
                  onClick={() => onSort(key)}
                  className={`px-6 py-4 cursor-pointer hover:text-indigo-400 ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : ''}`}
                >
                  <div className={`flex items-center space-x-1.5 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : ''}`}>
                    <span>{label}</span>
                    {sortBy === key ? (
                      sortOrder === 'ASC'
                        ? <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
                        : <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/80 bg-slate-900/10">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <Spinner size="sm" label="Retrieving directory page..." />
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-500 font-medium">
                  No employees matching the criteria found.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-800/25 transition-all">
                  <td className="px-6 py-4 font-semibold text-indigo-400 whitespace-nowrap">
                    {emp.employee_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-slate-100 font-bold text-sm leading-tight">
                        {emp.first_name} {emp.last_name}
                      </span>
                      <span className="text-xs text-slate-500">{emp.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{emp.job_title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-md border border-slate-700/50">
                      {emp.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{emp.country}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-slate-200">
                        {emp.salary.toLocaleString()} {emp.currency}
                      </span>
                      {emp.previous_salary && (
                        <span className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
                          <History className="w-3 h-3" />
                          <span>Was: {emp.previous_salary.toLocaleString()}</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-slate-100 whitespace-nowrap">
                    ${Math.round(emp.salary_usd).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        emp.performance_rating >= 4
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : emp.performance_rating <= 2
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                      }`}
                    >
                      ★ {emp.performance_rating}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onEdit(emp)}
                        className="p-1.5 hover:bg-indigo-600/15 border border-slate-700/60 hover:border-indigo-500/40 text-slate-400 hover:text-indigo-400 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(emp.id)}
                        className="p-1.5 hover:bg-red-600/15 border border-slate-700/60 hover:border-red-500/40 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-slate-900/60 border-t border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          Showing{' '}
          <span className="font-semibold text-slate-200">{employees.length}</span> of{' '}
          <span className="font-semibold text-slate-200">{totalCount.toLocaleString()}</span>{' '}
          employees
        </p>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1 || loading}
            className="p-2 border border-slate-700/60 hover:border-slate-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-300 font-semibold px-2">
            Page {page} of {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || totalPages === 0 || loading}
            className="p-2 border border-slate-700/60 hover:border-slate-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
