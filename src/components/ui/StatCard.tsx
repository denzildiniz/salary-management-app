import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: ReactNode;
  iconBg: string;
}

export function StatCard({ label, value, subtext, icon, iconBg }: StatCardProps) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-32">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
      </div>
      <div>
        <h3 className="text-3xl font-extrabold text-white leading-none">{value}</h3>
        <span className="text-xs text-slate-400 mt-1 block">{subtext}</span>
      </div>
    </div>
  );
}
