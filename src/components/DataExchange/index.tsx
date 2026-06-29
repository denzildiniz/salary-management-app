import { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Download,
  FileText,
  Terminal,
  Upload,
} from 'lucide-react';
import { importEmployeesCsv } from '../../api';
import { ApiError } from '../../api/client';
import { Spinner } from '../ui/Spinner';

const CSV_TEMPLATE_HEADERS =
  'first_name,last_name,email,job_title,department,salary,currency,country,date_of_joining,performance_rating,gender,previous_salary\n';
const CSV_TEMPLATE_ROWS =
  'Kaviraj,Rane,kaviraj.rane@acme.com,Software Engineer,Engineering,110000,USD,USA,2024-06-26,4,Male,\nJane,Smith,jane.smith@acme.com,Product Manager,Product,92000,EUR,Germany,2022-04-12,5,Female,85000\n';

export default function DataExchange() {
  const [file, setFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setSuccess(null);
    setError(null);
    setValidationErrors([]);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setImportLoading(true);
    setSuccess(null);
    setError(null);
    setValidationErrors([]);

    try {
      const csvText = await file.text();
      const result = await importEmployeesCsv(csvText);
      setSuccess(result.message || `Successfully processed ${result.insertedOrUpdated} employee records.`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.details && err.details.length > 0) {
          setValidationErrors(err.details);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setImportLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE_HEADERS + CSV_TEMPLATE_ROWS], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'acme_employees_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    const base = import.meta.env.VITE_API_BASE_URL || '/api';
    window.open(`${base}/employees/export`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Data Exchange</h1>
        <p className="text-slate-400 text-sm mt-1">
          Import payroll sheets or export employee registers to CSV worksheets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Import */}
        <section className="glass-panel p-6 rounded-2xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              <span>Import Payroll Worksheet</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Upload a <code>.csv</code> worksheet. Rows matching existing emails will update; new
              rows will be registered as new records.
            </p>
          </div>

          <form onSubmit={handleImport} className="space-y-4">
            <label className="border-2 border-dashed border-slate-700/60 hover:border-indigo-500/60 bg-slate-950/40 hover:bg-slate-950/70 p-8 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="sr-only"
              />
              <FileText className="w-10 h-10 text-slate-500 mb-3" />
              <span className="text-xs font-semibold text-slate-300 block">
                {file ? file.name : 'Select or drag employee CSV worksheet'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Comma-separated values (.csv) only'}
              </span>
            </label>

            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-start space-x-3.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-emerald-300 font-medium leading-relaxed">{success}</span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl flex items-start space-x-3.5">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-300">Worksheet validation failed</h4>
                  <p className="text-[11px] text-red-400/95 mt-0.5 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {validationErrors.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Validation Error Console</span>
                </div>
                <div className="p-3 max-h-40 overflow-y-auto font-mono text-[10px] text-red-400 space-y-1">
                  {validationErrors.map((e, i) => (
                    <div key={i}>{`> ${e}`}</div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={importLoading || !file}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center space-x-2"
            >
              {importLoading && <Spinner size="sm" />}
              <span>{importLoading ? 'Uploading and validating...' : 'Upload Worksheet'}</span>
            </button>
          </form>
        </section>

        {/* Export & Templates */}
        <section className="glass-panel p-6 rounded-2xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Download className="w-5 h-5 text-indigo-400" />
              <span>Export &amp; Templates</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Download structural worksheet templates for bulk registers or request a full backup export.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleDownloadTemplate}
              className="border border-slate-800/80 hover:border-indigo-500/40 bg-slate-900/10 hover:bg-indigo-600/5 p-6 rounded-xl flex flex-col justify-between items-start cursor-pointer group transition-all duration-200 text-left"
            >
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-105 transition-all">
                <FileText className="w-5 h-5" />
              </div>
              <div className="mt-8">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">CSV Template</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Download structural CSV format header reference file containing examples.
                </p>
              </div>
            </button>

            <button
              onClick={handleExportAll}
              className="border border-slate-800/80 hover:border-emerald-500/40 bg-slate-900/10 hover:bg-emerald-600/5 p-6 rounded-xl flex flex-col justify-between items-start cursor-pointer group transition-all duration-200 text-left"
            >
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-105 transition-all">
                <Database className="w-5 h-5" />
              </div>
              <div className="mt-8">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Export Full Database</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Download complete registry sheet containing all active listings.
                </p>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
