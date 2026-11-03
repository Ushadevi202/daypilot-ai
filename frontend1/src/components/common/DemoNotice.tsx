import React from 'react';
import { Info } from 'lucide-react';

export const DemoNotice: React.FC<{ title?: string; children: React.ReactNode }> = ({ title = 'Demo section.', children }) => (
  <div className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
    <Info className="w-4 h-4 mt-0.5 shrink-0" />
    <div>
      <span className="font-bold">{title} </span>
      {children}
    </div>
  </div>
);
