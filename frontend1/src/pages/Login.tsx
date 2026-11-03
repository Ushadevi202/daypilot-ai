import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const inputClass =
  'w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors';
const labelClass = 'block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5';

export const Login: React.FC = () => {
  const { loginWithCredentials, registerWithCredentials, isAuthenticated } = useApp();
  const navigate = useNavigate();

  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Already signed in (valid session cookie): go straight to the dashboard
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (isSignUpMode && password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignUpMode) {
        await registerWithCredentials(name, email, password);
      } else {
        await loginWithCredentials(email, password);
      }
      navigate('/');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden transition-colors duration-200">
      {/* Curved Pastel Decorative Shapes on Left and Right (matching the reference screenshot) */}
      <div
        className="absolute -left-20 top-1/2 -translate-y-1/2 w-80 sm:w-96 h-[500px] pointer-events-none rounded-r-[180px] opacity-70 dark:opacity-20"
        style={{
          background: 'radial-gradient(ellipse at left, rgba(204, 251, 241, 0.85) 0%, rgba(224, 242, 254, 0.45) 50%, transparent 80%)',
        }}
      />
      <div
        className="absolute -right-20 top-1/2 -translate-y-1/2 w-80 sm:w-96 h-[500px] pointer-events-none rounded-l-[180px] opacity-70 dark:opacity-20"
        style={{
          background: 'radial-gradient(ellipse at right, rgba(243, 232, 255, 0.85) 0%, rgba(238, 242, 255, 0.45) 50%, transparent 80%)',
        }}
      />

      {/* Center Auth Card */}
      <div className="w-full max-w-[460px] mx-auto z-10 flex flex-col items-center">
        <div className="mb-4 text-4xl select-none animate-bounce duration-1000">👋</div>

        <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 dark:text-slate-100 text-center tracking-tight leading-snug">
          {isSignUpMode ? "Welcome! Let's start Something Great" : "Welcome Back! Let's continue"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center mt-1.5 mb-6">
          {isSignUpMode ? 'Create your account to start planning!' : 'Log in to your account to start planning!'}
        </p>

        {errorMessage && (
          <div
            role="alert"
            className="w-full mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between"
          >
            <span>{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage('')} aria-label="Dismiss">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {isSignUpMode && (
            <div>
              <label htmlFor="login-name" className={labelClass}>Name</label>
              <input
                id="login-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Your Name or Username"
                autoComplete="name"
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label htmlFor="login-email" className={labelClass}>Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email"
              autoComplete="email"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="login-password" className={labelClass}>
              Password{isSignUpMode ? ' (at least 8 characters)' : ''}
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Your Password"
                autoComplete={isSignUpMode ? 'new-password' : 'current-password'}
                required
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer active:scale-[0.99] disabled:opacity-70"
          >
            {isSubmitting ? 'Please wait...' : isSignUpMode ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUpMode(!isSignUpMode);
              setErrorMessage('');
            }}
            className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            {isSignUpMode ? 'I have an account' : "Don't have an account? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
};
