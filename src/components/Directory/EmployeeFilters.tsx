import { Search, SlidersHorizontal } from 'lucide-react';
import { DEPARTMENTS, COUNTRIES } from '../../constants';

interface Props {
  search: string;
  department: string;
  country: string;
  minSalary: string;
  maxSalary: string;
  onSearchChange: (v: string) => void;
  onDepartmentChange: (v: string) => void;
  onCountryChange: (v: string) => void;
  onMinSalaryChange: (v: string) => void;
  onMaxSalaryChange: (v: string) => void;
}

const inputCls =
  'w-full bg-slate-950/80 border border-slate-700/60 focus:border-indigo-500/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none transition-all';

export function EmployeeFilters({
  search, department, country, minSalary, maxSalary,
  onSearchChange, onDepartmentChange, onCountryChange,
  onMinSalaryChange, onMaxSalaryChange,
}: Props) {
  return (
    <section className="glass-panel p-5 rounded-2xl space-y-4">
      <div className="flex items-center space-x-2 text-slate-300 font-bold text-sm">
        <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
        <span>Filter Workforce</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search ID, name, title..."
            className={`${inputCls} pl-9`}
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        <select value={department} onChange={(e) => onDepartmentChange(e.target.value)} className={inputCls}>
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <select value={country} onChange={(e) => onCountryChange(e.target.value)} className={inputCls}>
          <option value="">All Countries</option>
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <input
          type="number"
          value={minSalary}
          onChange={(e) => onMinSalaryChange(e.target.value)}
          placeholder="Min Salary (USD)"
          className={inputCls}
        />

        <input
          type="number"
          value={maxSalary}
          onChange={(e) => onMaxSalaryChange(e.target.value)}
          placeholder="Max Salary (USD)"
          className={inputCls}
        />
      </div>
    </section>
  );
}
