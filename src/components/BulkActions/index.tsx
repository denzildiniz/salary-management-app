import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { bulkRaise } from '../../api';
import { useAnalytics } from '../../hooks/useAnalytics';
import { Spinner } from '../ui/Spinner';
import { DEPARTMENTS, COUNTRIES } from '../../constants';
import type { BulkRaiseResult } from '../../types';

const selectCls =
  'w-full bg-slate-950 border border-slate-700/60 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all';

export default function BulkActions() {
  const { data: analyticsData } = useAnalytics();
  const totalHeadcount = analyticsData?.summary.headcount ?? 0;

  const [department, setDepartment] = useState('');
  const [country, setCountry] = useState('');
  const [raiseType, setRaiseType] = useState<'percentage' | 'flat'>('percentage');
  const [value, setValue] = useState('');

  const [previewLoading, setPreviewLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [preview, setPreview] = useState<BulkRaiseResult | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetState = () => {
    setError('');
    setSuccessMessage('');
    setPreview(null);
  };

  const handlePreview = async () => {
    resetState();
    if (!value || isNaN(Number(value))) {
      setError('Please enter a valid numeric adjustment value.');
      return;
    }
    try {
      setPreviewLoading(true);
      const result = await bulkRaise({ department, country, raiseType, value: Number(value), isPreview: true });
      setPreview(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate preview.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleApply = async () => {
    if (!preview) return;
    if (
      !window.confirm(
        `Apply this salary adjustment to ${preview.affectedCount} employees? This will overwrite current salaries.`
      )
    )
      return;

    try {
      setApplyLoading(true);
      const result = await bulkRaise({ department, country, raiseType, value: Number(value), isPreview: false });
      setSuccessMessage(result.message || 'Raises successfully applied!');
      setPreview(null);
      setValue('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to apply raise.');
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Bulk Salary Adjustments</h1>
        <p className="text-slate-400 text-sm mt-1">
          Apply percentage or flat salary increases to specific employee cohorts with atomic safety.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <section className="lg:col-span-1 glass-panel p-6 rounded-2xl h-fit space-y-5">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <span>Configure Adjustment</span>
          </h2>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Department Cohort
            </label>
            <select
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setPreview(null); }}
              className={selectCls}
            >
              <option value="">All Departments (Global)</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Country Cohort
            </label>
            <select
              value={country}
              onChange={(e) => { setCountry(e.target.value); setPreview(null); }}
              className={selectCls}
            >
              <option value="">All Countries</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Adjustment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['percentage', 'flat'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => { setRaiseType(type); setPreview(null); }}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    raiseType === type
                      ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/80'
                      : 'bg-slate-950 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type === 'percentage' ? 'Percentage (%)' : 'Flat Amount ($)'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {raiseType === 'percentage' ? 'Percentage Increase *' : 'Flat Increase (Local Currency) *'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={value}
                onChange={(e) => { setValue(e.target.value); setPreview(null); }}
                placeholder={raiseType === 'percentage' ? 'e.g., 4.5' : 'e.g., 5000'}
                className="w-full bg-slate-950 border border-slate-700/60 focus:border-indigo-500 rounded-xl py-2.5 px-3 pr-12 text-xs text-white focus:outline-none transition-all"
              />
              <span className="absolute right-3.5 top-2.5 text-slate-500 text-xs font-bold">
                {raiseType === 'percentage' ? '%' : 'cash'}
              </span>
            </div>
          </div>

          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

          <button
            type="button"
            onClick={handlePreview}
            disabled={previewLoading || !value}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/10 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {previewLoading && <Spinner size="sm" />}
            <span>{previewLoading ? 'Calculating impact...' : 'Preview Impact'}</span>
          </button>
        </section>

        {/* Impact Area */}
        <section className="lg:col-span-2 space-y-6">
          {successMessage && (
            <div className="p-5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-start space-x-3.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-300 text-sm">Adjustment Completed</h4>
                <p className="text-xs text-emerald-300/80 mt-1">{successMessage}</p>
              </div>
            </div>
          )}

          {!preview && !successMessage && (
            <div className="glass-panel p-10 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
              <HelpCircle className="w-12 h-12 text-slate-600" />
              <div>
                <h3 className="font-bold text-slate-200">No Active Preview</h3>
                <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
                  Enter adjustment values on the left panel and click "Preview Impact" to analyze
                  budget calculations before execution.
                </p>
              </div>
            </div>
          )}

          {preview && (
            <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 space-y-6 animate-scaleUp">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>Adjustment Impact Review</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Dry-run budget results computed across selected employee registers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Affected Headcount
                  </span>
                  <span className="text-2xl font-extrabold text-white mt-3.5">
                    {preview.affectedCount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {totalHeadcount > 0 ? Math.round((preview.affectedCount / totalHeadcount) * 100) : 0}% of global staff
                  </span>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Annual Cost Increase
                  </span>
                  <span
                    className={`text-2xl font-extrabold mt-3.5 ${
                      preview.differenceUsd >= 0 ? 'text-pink-400' : 'text-emerald-400'
                    }`}
                  >
                    {preview.differenceUsd >= 0 ? '+' : ''}$
                    {Math.round(preview.differenceUsd).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">USD base budget addition</span>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Avg. Salary Increase
                  </span>
                  <span className="text-2xl font-extrabold text-indigo-400 mt-3.5">
                    +${Math.round((preview.newTotalSpendUsd - preview.originalTotalSpendUsd) / preview.affectedCount).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">USD per employee</span>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl space-y-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-400">Database Mutability Confirmation</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Applying this adjustment will update the payroll details of{' '}
                      <span className="font-semibold text-slate-200">{preview.affectedCount} employees</span>.
                      Original values will be saved in the previous_salary history log.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 border-t border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setPreview(null)}
                    className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-all"
                  >
                    Discard Preview
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={applyLoading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-all flex items-center space-x-1.5"
                  >
                    {applyLoading && <Spinner size="sm" />}
                    <span>Apply Adjustment</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
