import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'ai';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm focus:ring-indigo-500 shadow-indigo-600/20',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 focus:ring-slate-400',
    outline: 'border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 focus:ring-slate-400',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 focus:ring-slate-400',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500 shadow-rose-600/20',
    ai: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:opacity-95 shadow-sm shadow-indigo-500/25 focus:ring-purple-500',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5 font-semibold',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
