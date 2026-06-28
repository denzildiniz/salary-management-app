import { useState } from 'react';
import {
  Users,
  DollarSign,
  Globe,
  Search,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { nlpQuery } from '../../api';
import { useAnalytics } from '../../hooks/useAnalytics';
import { Spinner } from '../ui/Spinner';
import { ErrorBanner } from '../ui/ErrorBanner';
import { StatCard } from '../ui/StatCard';
import { boldMarkdownToHtml } from '../../utils';
import type { NlpQueryResult } from '../../types';

const SAMPLE_QUERIES = [
  'What is the average salary in Engineering?',
  'How many employees in Germany?',
  'Highest paid in Product',
  'Total payroll spend in Sales',
  'Show gender pay equity info',
];

export default function Dashboard() {
  const { data, loading, error, refetch } = useAnalytics();

  const [searchQuery, setSearchQuery] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<NlpQueryResult | null>(null);

  const handleNlpQuery = async (q: string) => {
    if (!q.trim()) return;
    setSearchQuery(q);
    try {
      setQueryLoading(true);
      const result = await nlpQuery(q);
      setQueryResult(result);
    } catch {
      setQueryResult({
        matched: false,
        answer: 'I had trouble processing that request. Please try again with different wording.',
      });
    } finally {
      setQueryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" label="Aggregating organizational payroll metrics..." />
      </div>
    );
  }

  if (error || !data) {
    return <ErrorBanner message={error || 'Could not fetch analytics data.'} onRetry={refetch} />;
  }

  const { summary, departments, countries, salaryBands, genderPayGap } = data;
  const maxDeptSpend = Math.max(...departments.map((d) => d.total_spend_usd));
  const maxBandCount = Math.max(...salaryBands.map((b) => b.count));
  const maxCountryAvg = Math.max(...countries.map((c) => c.avg_salary_usd));

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Compensation Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Real-time compensation trends, equity ratios, and workforce payroll metrics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Headcount"
          value={summary.headcount.toLocaleString()}
          subtext="Active global employees"
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-indigo-500/10 text-indigo-400"
        />
        <StatCard
          label="Total Payroll Spend"
          value={`$${Math.round(summary.totalSpendUsd / 1_000_000).toLocaleString()}M`}
          subtext={`$${Math.round(summary.totalSpendUsd).toLocaleString()} USD / yr`}
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          label="Average Annual Salary"
          value={`$${Math.round(summary.avgSalaryUsd).toLocaleString()}`}
          subtext="USD base average"
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg="bg-purple-500/10 text-purple-400"
        />
        <StatCard
          label="Gender Pay Gap"
          value={`${summary.globalPayGap}%`}
          subtext={summary.globalPayGap > 0 ? 'Male-skewed gap' : 'Female-skewed gap'}
          icon={<Globe className="w-5 h-5" />}
          iconBg="bg-pink-500/10 text-pink-400"
        />
      </div>

      {/* NLP Query Widget */}
      <section className="glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-[#131b2e] to-slate-900">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Ask ACME Pay</h2>
            <p className="text-xs text-slate-400">Query global salary distributions in plain English.</p>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNlpQuery(searchQuery)}
            placeholder="e.g., average salary in Engineering, headcount in USA, highest paid overall..."
            className="w-full bg-slate-950/80 border border-slate-700/60 focus:border-indigo-500/80 rounded-xl py-3.5 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
          />
          <button
            onClick={() => handleNlpQuery(searchQuery)}
            className="absolute right-3 top-3.5 text-slate-400 hover:text-indigo-400 p-0.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-3.5 flex flex-wrap gap-2">
          {SAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => handleNlpQuery(q)}
              className="text-xs bg-slate-800/60 hover:bg-indigo-600/15 border border-slate-700/50 hover:border-indigo-500/40 text-slate-400 hover:text-indigo-300 px-3 py-1.5 rounded-full transition-all duration-200"
            >
              {q}
            </button>
          ))}
        </div>

        {(queryLoading || queryResult) && (
          <div className="mt-6 border-t border-slate-850 pt-5 animate-fadeIn">
            {queryLoading ? (
              <div className="flex items-center space-x-3 text-sm text-indigo-400">
                <Spinner size="sm" />
                <span className="font-medium">Searching payroll records...</span>
              </div>
            ) : queryResult ? (
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                      queryResult.matched
                        ? 'bg-indigo-600/20 text-indigo-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  {/* Safe: answer is server-generated; boldMarkdownToHtml only converts **x** → <strong>x</strong> */}
                  <p
                    className="text-sm text-slate-200 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: boldMarkdownToHtml(queryResult.answer) }}
                  />
                </div>

                {queryResult.matched &&
                  queryResult.visualizationType === 'table' &&
                  queryResult.data && (
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                      <table className="min-w-full text-xs text-left">
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                            {['ID', 'Name', 'Job Title', 'Dept', 'Country', 'Local Salary', 'USD Equivalent'].map(
                              (h) => (
                                <th key={h} className="px-4 py-2.5">
                                  {h}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {queryResult.data.map((emp) => (
                            <tr key={emp.employee_id} className="hover:bg-slate-800/35 text-slate-300">
                              <td className="px-4 py-2.5 font-semibold text-indigo-400">{emp.employee_id}</td>
                              <td className="px-4 py-2.5 font-medium">
                                {emp.first_name} {emp.last_name}
                              </td>
                              <td className="px-4 py-2.5">{emp.job_title}</td>
                              <td className="px-4 py-2.5">{emp.department}</td>
                              <td className="px-4 py-2.5">{emp.country}</td>
                              <td className="px-4 py-2.5 text-right font-medium">
                                {emp.salary.toLocaleString()} {emp.currency}
                              </td>
                              <td className="px-4 py-2.5 text-right font-bold text-slate-100">
                                ${Math.round(emp.salary_usd).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>
            ) : null}
          </div>
        )}
      </section>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Payroll Bars */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-base font-bold text-white mb-1">Department Payroll Allocations</h3>
          <p className="text-xs text-slate-400 mb-6">Total annual spend in USD by department.</p>
          <div className="space-y-4">
            {departments.map((dept) => {
              const pct = maxDeptSpend > 0 ? (dept.total_spend_usd / maxDeptSpend) * 100 : 0;
              return (
                <div key={dept.department} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-200">{dept.department}</span>
                    <span className="text-slate-400">
                      ${Math.round(dept.total_spend_usd / 1000).toLocaleString()}k USD
                      <span className="text-slate-500 font-normal ml-1">({dept.count} head)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-950/80 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${pct}%` }}
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Average Salaries by Region */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-base font-bold text-white mb-1">Average Salaries by Region</h3>
          <p className="text-xs text-slate-400 mb-6">Average regional salary converted to USD.</p>
          <div className="w-full aspect-[4/3] relative">
            <svg viewBox="0 0 400 240" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = 200 - ratio * 160;
                return (
                  <g key={i} className="opacity-35">
                    <line x1="35" y1={y} x2="390" y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="5" y={y + 4} fill="#94a3b8" fontSize="8" fontWeight="500">
                      {Math.round((ratio * maxCountryAvg) / 1000)}k
                    </text>
                  </g>
                );
              })}
              {countries.map((c, i) => {
                const barH = maxCountryAvg > 0 ? (c.avg_salary_usd / maxCountryAvg) * 160 : 0;
                const x = 45 + i * 58;
                return (
                  <g key={c.country}>
                    <title>{`${c.country}: $${Math.round(c.avg_salary_usd).toLocaleString()} USD`}</title>
                    <rect
                      x={x} y={200 - barH} width={28} height={barH}
                      fill="url(#barGrad)" rx="4"
                      className="hover:fill-indigo-400 transition-all duration-300 cursor-pointer"
                    />
                    <text x={x + 14} y="218" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {c.country}
                    </text>
                  </g>
                );
              })}
              <line x1="35" y1="200" x2="390" y2="200" stroke="#475569" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Salary Band Histogram */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-base font-bold text-white mb-1">Salary Band Distribution</h3>
          <p className="text-xs text-slate-400 mb-6">Headcount distribution across salary bands.</p>
          <div className="w-full aspect-[4/3] relative">
            <svg viewBox="0 0 400 240" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="histoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = 180 - ratio * 140;
                return (
                  <g key={i} className="opacity-35">
                    <line x1="45" y1={y} x2="390" y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="5" y={y + 4} fill="#94a3b8" fontSize="8" fontWeight="500">
                      {Math.round(ratio * maxBandCount).toLocaleString()}
                    </text>
                  </g>
                );
              })}
              {salaryBands.map((sb, i) => {
                const rectH = maxBandCount > 0 ? (sb.count / maxBandCount) * 140 : 0;
                const x = 50 + i * 42;
                return (
                  <g key={sb.band}>
                    <title>{`${sb.band}: ${sb.count} employees`}</title>
                    <rect
                      x={x} y={180 - rectH} width={24} height={rectH}
                      fill="url(#histoGrad)" rx="3"
                      className="hover:fill-purple-400 transition-all duration-300 cursor-pointer"
                    />
                    <text
                      x={x + 12} y="198" fill="#94a3b8" fontSize="7" fontWeight="500"
                      textAnchor="end"
                      transform={`rotate(-35, ${x + 12}, 198)`}
                    >
                      {sb.band}
                    </text>
                  </g>
                );
              })}
              <line x1="45" y1="180" x2="390" y2="180" stroke="#475569" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Gender Pay Gap by Department */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-base font-bold text-white mb-1">Gender Pay Gap by Department</h3>
          <p className="text-xs text-slate-400 mb-6">
            Positive % means males earn more; negative means females earn more.
          </p>
          <div className="space-y-4">
            {genderPayGap.map((gap) => (
              <div
                key={gap.department}
                className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2"
              >
                <span className="font-semibold text-slate-200">{gap.department}</span>
                <div className="flex items-center space-x-6">
                  <div className="hidden sm:flex items-center space-x-2.5 text-[10px] text-slate-400">
                    <span>F: ${Math.round(gap.femaleAvg).toLocaleString()}</span>
                    <span>•</span>
                    <span>M: ${Math.round(gap.maleAvg).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-bold">
                    {gap.gapPercent > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-pink-400" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span className={gap.gapPercent > 0 ? 'text-pink-400' : 'text-emerald-400'}>
                      {Math.abs(gap.gapPercent).toFixed(1)}%
                    </span>
                    <span className="text-slate-500 font-normal text-[10px]">
                      ({gap.gapPercent > 0 ? 'M > F' : 'F > M'})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
