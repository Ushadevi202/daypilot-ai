import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BackendBanner: React.FC = () => {
  const { backendError, dataLoading, refreshData, clearBackendError } = useApp();
  if (!backendError) return null;

  return (
    <div
      role="alert"
      className="bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs sm:text-sm px-4 py-2 flex items-center gap-3"
    >
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span className="flex-1">{backendError}</span>
      <button
        type="button"
        onClick={() => refreshData()}
        disabled={dataLoading}
        className="inline-flex items-center gap-1 font-semibold underline disabled:opacity-60"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Retry
      </button>
      <button type="button" onClick={clearBackendError} aria-label="Dismiss">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
