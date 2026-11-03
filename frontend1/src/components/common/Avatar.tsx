import React, { useState } from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnlineDot?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
  showOnlineDot = false,
}) => {
  const [hasError, setHasError] = useState(false);

  // Generate consistent initial letter
  const initial = name?.trim() ? name.trim().charAt(0).toUpperCase() : null;

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs font-bold',
    lg: 'w-10 h-10 text-sm font-bold',
    xl: 'w-16 h-16 text-xl font-extrabold',
  };

  const dotSizeClasses = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  // Color gradient based on name character code
  const getGradient = (char: string | null) => {
    if (!char) return 'from-indigo-600 via-indigo-500 to-sky-400';
    const code = char.charCodeAt(0) % 5;
    switch (code) {
      case 0:
        return 'from-indigo-600 to-purple-600';
      case 1:
        return 'from-sky-500 to-indigo-600';
      case 2:
        return 'from-emerald-500 to-teal-700';
      case 3:
        return 'from-amber-500 to-rose-600';
      default:
        return 'from-purple-600 to-pink-600';
    }
  };

  const showImage = src && !hasError && src.trim() !== '';

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt={name || 'User Avatar'}
          onError={() => setHasError(true)}
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-indigo-500/20`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr ${getGradient(initial)} flex items-center justify-center text-white shadow-xs ring-2 ring-indigo-500/25 select-none`}
        >
          {initial ? <span>{initial}</span> : <User className="w-1/2 h-1/2" />}
        </div>
      )}

      {showOnlineDot && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${dotSizeClasses[size]} rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900`}
        />
      )}
    </div>
  );
};
