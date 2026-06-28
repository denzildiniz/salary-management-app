import { AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="bg-red-500/10 border border-red-500/25 p-6 rounded-xl flex items-start space-x-4 max-w-2xl mx-auto my-12">
      <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="font-semibold text-red-200">Error</h3>
        <p className="text-sm text-red-300/80 mt-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-red-500/20 text-red-200 text-xs font-semibold rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
