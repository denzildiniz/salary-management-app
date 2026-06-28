interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-12 h-12 border-4',
};

export function Spinner({ size = 'md', label }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={`${sizeMap[size]} border-indigo-500 border-t-transparent rounded-full animate-spin`}
      />
      {label && <p className="text-slate-400 font-medium text-sm">{label}</p>}
    </div>
  );
}
