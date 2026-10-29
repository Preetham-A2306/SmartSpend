import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const config = {
    success: {
      bg: 'bg-[#DCFCE7]',
      border: 'border-[#BBF7D0]',
      text: 'text-[#14532D]',
      icon: '✅',
    },
    error: {
      bg: 'bg-[#FEE2E2]',
      border: 'border-[#FECACA]',
      text: 'text-[#7F1D1D]',
      icon: '⚠️',
    },
    info: {
      bg: 'bg-[#EDE9FE]',
      border: 'border-[#DDD6FE]',
      text: 'text-[#4C1D95]',
      icon: '💡',
    },
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto ${config.bg} ${config.border} border ${config.text} px-4 py-3 rounded-2xl shadow-lg flex items-center space-x-3 text-xs font-bold transition-all transform animate-in slide-in-from-bottom-3 duration-200 min-w-[280px] max-w-sm`}
    >
      <span className="text-base">{config.icon}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="opacity-70 hover:opacity-100 p-1 rounded-lg transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
};
