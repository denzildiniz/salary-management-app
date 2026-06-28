import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { deleteEmployee } from '../../api';
import { useEmployees } from '../../hooks/useEmployees';
import { EmployeeFilters } from './EmployeeFilters';
import { EmployeeTable } from './EmployeeTable';
import { EmployeeModal } from './EmployeeModal';
import type { Employee } from '../../types';

const PAGE_SIZE = 10;

export default function Directory() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [country, setCountry] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const queryParams = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    department,
    country,
    minSalary,
    maxSalary,
    sortBy,
    sortOrder,
  };

  const { employees, totalCount, loading, refetch } = useEmployees(queryParams);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleSort = (col: string) => {
    setSortBy(col);
    setSortOrder((prev) => (sortBy === col && prev === 'ASC' ? 'DESC' : 'ASC'));
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to terminate this employee record?')) return;
    try {
      await deleteEmployee(id);
      refetch();
    } catch {
      alert('Failed to delete employee.');
    }
  };

  const openCreate = () => {
    setSelectedEmp(null);
    setModalType('create');
    setIsModalOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setSelectedEmp(emp);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Employee Directory</h1>
          <p className="text-slate-400 text-sm mt-1">
            Search, sort, filter, and manage organizational employee profiles.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      <EmployeeFilters
        search={searchInput}
        department={department}
        country={country}
        minSalary={minSalary}
        maxSalary={maxSalary}
        onSearchChange={setSearchInput}
        onDepartmentChange={handleFilterChange(setDepartment)}
        onCountryChange={handleFilterChange(setCountry)}
        onMinSalaryChange={handleFilterChange(setMinSalary)}
        onMaxSalaryChange={handleFilterChange(setMaxSalary)}
      />

      <EmployeeTable
        employees={employees}
        loading={loading}
        totalCount={totalCount}
        page={page}
        totalPages={totalPages}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={openEdit}
        onDelete={handleDelete}
        onPageChange={setPage}
      />

      <EmployeeModal
        isOpen={isModalOpen}
        modalType={modalType}
        selectedEmp={selectedEmp}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}
