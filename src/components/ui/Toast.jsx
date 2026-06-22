"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

/**
 * @typedef {Object} ToastItemProps
 * @property {string} id - Unique ID of the toast instance.
 * @property {string} message - Message body content.
 * @property {'success' | 'error' | 'info'} type - Visual flavor state of the toast.
 * @property {number} [duration=3000] - Lifespan duration in milliseconds before automatic dismissal.
 */

/**
 * Global provider for Toast notifications. Wraps application routes to capture trigger states.
 * @param {{ children: React.ReactNode }} props
 * @returns {React.JSX.Element}
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-55 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook to retrieve toast triggers. Fires success, error, or info messages dynamically.
 * @returns {{
 *   success: (msg: string, dur?: number) => void,
 *   error: (msg: string, dur?: number) => void,
 *   info: (msg: string, dur?: number) => void
 * }}
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return {
    success: (msg, dur) => context.showToast(msg, 'success', dur),
    error: (msg, dur) => context.showToast(msg, 'error', dur),
    info: (msg, dur) => context.showToast(msg, 'info', dur),
  };
}

/**
 * Standard self-dismissing Toast alert component.
 * @param {{ toast: ToastItemProps, onClose: () => void }} props
 * @returns {React.JSX.Element}
 */
function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: (
      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const bgStyles = {
    success: 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200/50 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-250',
    error: 'bg-red-50 dark:bg-red-950/90 border-red-200/50 dark:border-red-900/40 text-red-800 dark:text-red-250',
    info: 'bg-zinc-50 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200',
  };

  return (
    <div className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl border shadow-lg animate-slide-up backdrop-blur-sm transition-all duration-300 ${bgStyles[toast.type]}`}>
      <div className="flex items-center space-x-3">
        {icons[toast.type]}
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button onClick={onClose} className="ml-4 p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Default fallback static Toast element representation for JSDoc criteria.
 * @param {{ message: string, type?: 'success' | 'error' | 'info', onClose?: () => void }} props
 * @returns {React.JSX.Element}
 */
export default function Toast({ message, type = 'info', onClose }) {
  return (
    <div className="w-full max-w-sm pointer-events-auto">
      <ToastItem toast={{ id: 'static', message, type }} onClose={onClose || (() => {})} />
    </div>
  );
}
