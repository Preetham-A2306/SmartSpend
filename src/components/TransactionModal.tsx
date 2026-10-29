import React, { useState, useEffect } from 'react';
import { X, TrendingDown, TrendingUp, Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { Transaction, TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCategoryInfo } from '../types/index.ts';
import { validateTransactionInput } from '../utils/finance.ts';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'created_at'>, existingId?: string) => void;
  initialTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTransaction,
}) => {
  const isEdit = !!initialTransaction;

  const [type, setType] = useState<TransactionType>(initialTransaction?.type || 'expense');
  const [amount, setAmount] = useState<string>(initialTransaction?.amount ? initialTransaction.amount.toString() : '');
  const [title, setTitle] = useState<string>(initialTransaction?.title || initialTransaction?.description || '');
  const [category, setCategory] = useState<string>(() => {
    if (initialTransaction?.category) return initialTransaction.category;
    return type === 'expense' ? EXPENSE_CATEGORIES[0].name : INCOME_CATEGORIES[0].name;
  });
  const [date, setDate] = useState<string>(() => {
    if (initialTransaction?.transaction_date) return initialTransaction.transaction_date;
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState<string>(initialTransaction?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or update when modal opens or initialTransaction changes
  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmount(initialTransaction.amount.toString());
      setTitle(initialTransaction.title || initialTransaction.description || '');
      setCategory(initialTransaction.category);
      setDate(initialTransaction.transaction_date);
      setNotes(initialTransaction.notes || '');
    } else {
      setType('expense');
      setAmount('');
      setTitle('');
      setCategory(EXPENSE_CATEGORIES[0].name);
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setErrors({});
  }, [initialTransaction, isOpen]);

  if (!isOpen) return null;

  const availableCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const defaultCat = newType === 'expense' ? EXPENSE_CATEGORIES[0].name : INCOME_CATEGORIES[0].name;
    setCategory(defaultCat);
  };

  const handleQuickAdd = (delta: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + delta).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateTransactionInput({
      type,
      amount,
      title,
      category,
      transaction_date: date,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    const catInfo = getCategoryInfo(category, type);

    onSave(
      {
        type,
        amount: parseFloat(amount),
        title: title.trim(),
        description: title.trim(),
        category,
        categoryEmoji: catInfo.emoji,
        transaction_date: date,
        notes: notes.trim() || undefined,
      },
      initialTransaction?.id
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EDE9FE] text-[#6D28D9] flex items-center justify-center text-xl shadow-xs">
              {type === 'expense' ? '💸' : '💰'}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">
                {isEdit ? 'Edit Transaction' : 'Add New Transaction'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEdit ? 'Update details of this record' : 'Keep your personal budget accurate & organized'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Income vs Expense Segmented Control */}
          <div className="bg-[#F8FAFC] p-1.5 rounded-2xl grid grid-cols-2 gap-2 border border-slate-200/60">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
                type === 'expense'
                  ? 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingDown size={16} />
              <span>Expense 💸</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
                type === 'income'
                  ? 'bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp size={16} />
              <span>Income 📈</span>
            </button>
          </div>

          {/* Amount (₹) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-lg font-bold text-slate-400">₹</span>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full bg-[#F8FAFC] border rounded-2xl pl-10 pr-4 py-3 text-lg font-extrabold text-slate-800 focus:outline-none focus:ring-2 ${
                  errors.amount
                    ? 'border-red-400 bg-red-50/40 focus:ring-red-200'
                    : 'border-slate-200 focus:border-[#C4B5FD] focus:ring-[#C4B5FD]/30'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-600 font-semibold mt-1 flex items-center space-x-1">
                <AlertCircle size={13} />
                <span>{errors.amount}</span>
              </p>
            )}

            {/* Quick chips */}
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-[11px] text-slate-400 font-medium">Quick:</span>
              {[100, 500, 1000, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-xl transition-colors"
                >
                  +₹{val}
                </button>
              ))}
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Title / Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lunch with Friends, Course Reference Books"
              className={`w-full bg-[#F8FAFC] border rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                errors.title
                  ? 'border-red-400 bg-red-50/40 focus:ring-red-200'
                  : 'border-slate-200 focus:border-[#C4B5FD] focus:ring-[#C4B5FD]/30'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-600 font-semibold mt-1 flex items-center space-x-1">
                <AlertCircle size={13} />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#C4B5FD] focus:ring-2 focus:ring-[#C4B5FD]/30"
            >
              {availableCategories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Transaction Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-4 top-3 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-[#C4B5FD] focus:ring-2 focus:ring-[#C4B5FD]/30"
              />
            </div>
            {errors.transaction_date && (
              <p className="text-xs text-red-600 font-semibold mt-1 flex items-center space-x-1">
                <AlertCircle size={13} />
                <span>{errors.transaction_date}</span>
              </p>
            )}
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment method (UPI, cash), receipt details, split notes..."
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#C4B5FD] focus:ring-2 focus:ring-[#C4B5FD]/30"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-[#C4B5FD] hover:bg-[#B49EFA] text-[#4C1D95] font-extrabold text-sm transition-all shadow-sm hover:shadow-md border border-[#A78BFA]/40"
            >
              {isEdit ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
