import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { createEmployee, updateEmployee } from '../../api';
import { Spinner } from '../ui/Spinner';
import { DEPARTMENTS, COUNTRIES, CURRENCIES, CURRENCY_LABELS, GENDERS, PERFORMANCE_RATINGS } from '../../constants';
import type { Employee, EmployeeFormData } from '../../types';

const DEFAULT_FORM: EmployeeFormData = {
  first_name: '',
  last_name: '',
  email: '',
  job_title: '',
  department: 'Engineering',
  salary: '',
  currency: 'USD',
  country: 'USA',
  date_of_joining: new Date().toISOString().split('T')[0],
  performance_rating: '3',
  gender: 'Male',
};

const inputCls =
  'w-full bg-slate-950 border border-slate-700/60 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all';
const labelCls = 'text-xs text-slate-400 font-semibold uppercase tracking-wider';

interface Props {
  isOpen: boolean;
  modalType: 'create' | 'edit';
  selectedEmp: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EmployeeModal({ isOpen, modalType, selectedEmp, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<EmployeeFormData>(DEFAULT_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (modalType === 'edit' && selectedEmp) {
      setForm({
        first_name: selectedEmp.first_name,
        last_name: selectedEmp.last_name,
        email: selectedEmp.email,
        job_title: selectedEmp.job_title,
        department: selectedEmp.department,
        salary: selectedEmp.salary.toString(),
        currency: selectedEmp.currency,
        country: selectedEmp.country,
        date_of_joining: selectedEmp.date_of_joining,
        performance_rating: selectedEmp.performance_rating.toString(),
        gender: selectedEmp.gender,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setError('');
  }, [isOpen, modalType, selectedEmp]);

  const set = (field: keyof EmployeeFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.first_name || !form.last_name || !form.email || !form.job_title || !form.salary) {
      setError('Please fill in all required fields.');
      return;
    }
    if (isNaN(Number(form.salary)) || Number(form.salary) <= 0) {
      setError('Salary must be a positive number.');
      return;
    }

    try {
      setSubmitting(true);
      if (modalType === 'create') {
        await createEmployee(form);
      } else if (selectedEmp) {
        await updateEmployee(selectedEmp.id, form);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <h3 className="font-bold text-white text-base">
            {modalType === 'create'
              ? 'Create Employee Profile'
              : `Modify Profile (${selectedEmp?.employee_id})`}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg flex items-center space-x-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelCls}>First Name *</label>
              <input type="text" required value={form.first_name} onChange={set('first_name')} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Last Name *</label>
              <input type="text" required value={form.last_name} onChange={set('last_name')} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Email Address *</label>
              <input type="email" required value={form.email} onChange={set('email')} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Job Title *</label>
              <input type="text" required value={form.job_title} onChange={set('job_title')} className={inputCls} />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Department *</label>
              <select value={form.department} onChange={set('department')} className={inputCls}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Gender *</label>
              <select value={form.gender} onChange={set('gender')} className={inputCls}>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Country *</label>
              <select value={form.country} onChange={set('country')} className={inputCls}>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Date of Joining *</label>
              <input type="date" required value={form.date_of_joining} onChange={set('date_of_joining')} className={inputCls} />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Salary (Local Currency) *</label>
              <input type="text" required value={form.salary} onChange={set('salary')} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Currency Code *</label>
              <select value={form.currency} onChange={set('currency')} className={inputCls}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{CURRENCY_LABELS[c]}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className={labelCls}>Performance Rating *</label>
              <select value={form.performance_rating} onChange={set('performance_rating')} className={inputCls}>
                {PERFORMANCE_RATINGS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-all flex items-center space-x-1.5"
            >
              {submitting && <Spinner size="sm" />}
              <span>{modalType === 'create' ? 'Create Profile' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
