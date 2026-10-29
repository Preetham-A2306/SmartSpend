import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Transaction } from '../types/index.ts';
import { formatINR } from '../utils/finance.ts';

interface DeleteModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
        {/* Soft Red/Coral Warning Avatar */}
        <div className="w-14 h-14 rounded-3xl bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center mx-auto text-2xl shadow-xs">
          🗑️
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-slate-800">Delete Transaction?</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Are you sure you want to permanently remove this transaction? This will update your balance and budget records.
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-3.5 text-left text-xs">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span className="flex items-center space-x-1.5 truncate">
              <span>{transaction.categoryEmoji}</span>
              <span className="truncate">{transaction.title}</span>
            </span>
            <span className={transaction.type === 'expense' ? 'text-red-600' : 'text-emerald-600'}>
              {transaction.type === 'expense' ? '-' : '+'}
              {formatINR(transaction.amount)}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
            <span>{transaction.category}</span>
            <span>{transaction.transaction_date}</span>
          </div>
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-2xl bg-[#FCA5A5] hover:bg-[#F87171] text-[#7F1D1D] font-extrabold text-xs transition-colors shadow-xs"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};
