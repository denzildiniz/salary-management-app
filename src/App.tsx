import { useState } from 'react';
import {
  Briefcase,
  Database,
  LayoutDashboard,
  TrendingUp,
  UserCircle,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import Dashboard from './components/Dashboard';
import Directory from './components/Directory';
import BulkActions from './components/BulkActions';
import DataExchange from './components/DataExchange';

type Tab = 'dashboard' | 'directory' | 'bulk' | 'exchange';

interface NavItem {
  id: Tab;
  label: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Compensation Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'directory', label: 'Employee Directory', icon: <Users className="w-5 h-5" /> },
  { id: 'bulk', label: 'Bulk Raise Adjustments', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'exchange', label: 'Data Exchange (CSV)', icon: <Database className="w-5 h-5" /> },
];

const TAB_COMPONENTS: Record<Tab, ReactNode> = {
  dashboard: <Dashboard />,
  directory: <Directory />,
  bulk: <BulkActions />,
  exchange: <DataExchange />,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-600/25">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ACME
                </span>
                <span className="text-slate-400 font-semibold text-sm ml-1.5 uppercase tracking-widest">
                  CompManager
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-300 font-medium">HR Session Secure</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <UserCircle className="w-7 h-7 text-indigo-400" />
                <span className="text-sm font-medium hidden md:inline">Kaviraj R. (HR Manager)</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="md:w-64 flex-shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-3 md:pb-0 scrollbar-none border-b md:border-b-0 md:border-r border-slate-800 pr-0 md:pr-4">
            {NAV_ITEMS.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm w-full whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-indigo-600/15 text-indigo-400 border-l-2 border-indigo-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Page Content */}
        <main className="flex-1 min-w-0">{TAB_COMPONENTS[activeTab]}</main>
      </div>

      <footer className="bg-[#080c14] border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>&copy; 2026 ACME Corp. Confidential &mdash; Authorized HR Access Only.</p>
      </footer>
    </div>
  );
}
