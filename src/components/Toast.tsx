'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, Award, ShieldAlert, CheckCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'badge';

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`gaming-panel flex items-start gap-4 p-4 rounded-lg border animate-slide-in relative overflow-hidden ${
              toast.type === 'success' ? 'border-gaming-green/40 bg-surface/90' :
              toast.type === 'error' ? 'border-red-500/40 bg-surface/90' :
              toast.type === 'badge' ? 'border-gaming-gold/40 bg-surface/90 shadow-[0_0_15px_rgba(255,215,0,0.15)]' :
              'border-gaming-neon/40 bg-surface/90'
            }`}
          >
            {/* Top glowing line representing toast state */}
            <div
              className={`absolute top-0 left-0 h-[3px] w-full animate-toast-progress`}
              style={{
                background: toast.type === 'success' ? '#00C853' :
                            toast.type === 'error' ? '#EF4444' :
                            toast.type === 'badge' ? '#FFD700' : '#00E5FF',
                animationDuration: `${toast.duration || 4000}ms`
              }}
            />

            {/* Icon */}
            <div className="mt-0.5">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-gaming-green" />}
              {toast.type === 'error' && <ShieldAlert className="w-5 h-5 text-red-500" />}
              {toast.type === 'badge' && <Award className="w-6 h-6 text-gaming-gold animate-bounce" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-gaming-neon" />}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h4 className={`text-sm font-bold uppercase tracking-wider ${
                toast.type === 'badge' ? 'text-gaming-gold font-mono' : 'text-white'
              }`}>
                {toast.title}
              </h4>
              <p className="text-xs text-text-muted mt-1">{toast.message}</p>
            </div>

            {/* Close button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-text-muted hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-slide-in {
          animation: slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-toast-progress {
          animation-name: toast-progress;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
