import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Database,
  BarChart3,
  Receipt,
  Settings,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { sqliteDb } from '../database/sqlite_engine.ts';
import { Transaction, AppSettings, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types/index.ts';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateBalance,
  getMonthlyExpenses,
  getMonthlyIncome,
  getCategoryBreakdown,
  isBudgetExceeded,
  getBudgetUsagePercentage,
  formatINR,
  formatDateIndian,
  validateTransactionInput,
} from '../utils/finance.ts';

interface PhoneSimulatorProps {
  onDataChanged?: () => void;
  onRequestViewCode?: (filePath: string) => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>(sqliteDb.getSettings());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [reportDate, setReportDate] = useState<{ year: number; month: number }>({ year: 2026, month: 10 });
  const [budgetInput, setBudgetInput] = useState<string>('');

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadAllData = async () => {
    setIsLoading(true);
    const data = await sqliteDb.getAllTransactions();
    const currentSettings = sqliteDb.getSettings();
    setTransactions(data);
    setSettings(currentSettings);
    setBudgetInput(currentSettings.monthlyBudget.toString());
    setIsLoading(false);
    onDataChanged?.();
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);
  const balance = calculateBalance(totalIncome, totalExpenses);

  const currentYear = reportDate.year;
  const currentMonth = reportDate.month;
  const thisMonthExpenses = getMonthlyExpenses(transactions, currentYear, currentMonth);
  const thisMonthIncome = getMonthlyIncome(transactions, currentYear, currentMonth);
  const budgetAlert = isBudgetExceeded(thisMonthExpenses, settings.monthlyBudget);
  const budgetProgress = getBudgetUsagePercentage(thisMonthExpenses, settings.monthlyBudget);
  const categoryBreakdown = getCategoryBreakdown(transactions, currentYear, currentMonth);

  const filteredTransactions = transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && t.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (t.title || t.description || '').toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      const matchNotes = t.notes?.toLowerCase().includes(q) || false;
      return matchTitle || matchCat || matchNotes;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTransaction?.id) return;
    await sqliteDb.deleteTransaction(deletingTransaction.id);
    setDeletingTransaction(null);
    showToast('Transaction deleted from SQLite database');
    await loadAllData();
  };

  const handleSaveBudget = async () => {
    const val = parseFloat(budgetInput.trim());
    if (isNaN(val) || val <= 0) {
      showToast('Please enter a valid budget greater than ₹0', 'error');
      return;
    }
    await sqliteDb.updateBudget(val);
    setSettings(sqliteDb.getSettings());
    showToast(`Monthly budget updated to ${formatINR(val)}`);
    onDataChanged?.();
  };

  const handleClearAll = async () => {
    if (window.confirm('Delete all records from smartspend.db?')) {
      await sqliteDb.clearAllTransactions();
      showToast('All transaction records deleted from smartspend.db', 'info');
      await loadAllData();
    }
  };

  const handleResetDemo = async () => {
    await sqliteDb.resetDemoData();
    showToast('College demo dataset loaded into smartspend.db');
    await loadAllData();
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-[400px] h-[780px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/80 flex flex-col overflow-hidden">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full flex items-center justify-center z-50">
          <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800 mr-2" />
          <div className="w-12 h-1 bg-slate-800 rounded-full" />
        </div>

        <div className="relative w-full h-full bg-[#F8FAFC] rounded-[34px] overflow-hidden flex flex-col text-slate-800 select-none">
          <div className="h-8 pt-1.5 px-6 flex justify-between items-center text-xs font-medium text-slate-600 bg-white/80 backdrop-blur-sm z-30 shrink-0">
            <span className="font-semibold text-slate-800">10:45 AM</span>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">M3</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500" title="SQLite Active" />
              <span>100%</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-16 relative">
            {toastMessage && (
              <div
                className={`absolute top-2 left-4 right-4 z-50 p-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center justify-between transition-all ${
                  toastMessage.type === 'error'
                    ? 'bg-red-600 text-white'
                    : toastMessage.type === 'info'
                    ? 'bg-slate-800 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                <span>{toastMessage.text}</span>
                <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white ml-2">
                  <X size={14} />
                </button>
              </div>
            )}

            {activeTab === 0 && (
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center pt-1">
                  <div>
                    <h1 className="text-xl font-extrabold text-indigo-600 tracking-tight">SmartSpend</h1>
                    <p className="text-xs text-slate-500">Personal Expense Tracker (SQLite)</p>
                  </div>
                  <button
                    onClick={loadAllData}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>

                <div className="w-full bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-indigo-100 font-medium tracking-wide">Total Balance</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                      smartspend.db
                    </span>
                  </div>
                  <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${balance < 0 ? 'text-red-200' : 'text-white'}`}>
                    {formatINR(balance)}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/15 grid grid-cols-2 gap-2">
                    <div className="bg-white/10 rounded-2xl p-2.5">
                      <div className="flex items-center text-[11px] text-emerald-200 font-medium mb-0.5">
                        <TrendingUp size={12} className="mr-1" /> Income
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white truncate">{formatINR(totalIncome)}</div>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-2.5">
                      <div className="flex items-center text-[11px] text-red-200 font-medium mb-0.5">
                        <TrendingDown size={12} className="mr-1" /> Expenses
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white truncate">{formatINR(totalExpenses)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
                  <div className="flex justify-between items-center text-xs font-semibold mb-2">
                    <span className="text-slate-700">October 2026 Spending</span>
                    <span className={budgetAlert ? 'text-red-600 font-bold' : 'text-slate-600'}>
                      {formatINR(thisMonthExpenses)} / {formatINR(settings.monthlyBudget)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        budgetAlert ? 'bg-red-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(100, budgetProgress)}%` }}
                    />
                  </div>
                  {budgetAlert && (
                    <div className="mt-2.5 flex items-center text-red-700 bg-red-50 p-2 rounded-xl text-[11px] font-medium border border-red-200">
                      <AlertTriangle size={14} className="mr-1.5 shrink-0 text-red-600" />
                      <span>Budget exceeded!</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2 px-1">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Transactions</h3>
                    <button
                      onClick={() => setActiveTab(1)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View All ({transactions.length})
                    </button>
                  </div>

                  <div className="space-y-2">
                    {transactions.slice(0, 4).map((t) => (
                      <TransactionItemTile
                        key={t.id}
                        transaction={t}
                        onEdit={() => handleOpenEdit(t)}
                        onDelete={() => setDeletingTransaction(t)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h1 className="text-lg font-bold text-slate-900">All Transactions</h1>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {filteredTransactions.length} of {transactions.length} rows
                  </span>
                </div>

                <div className="relative">
                  <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-2 mt-2">
                  {filteredTransactions.map((t) => (
                    <TransactionItemTile
                      key={t.id}
                      transaction={t}
                      onEdit={() => handleOpenEdit(t)}
                      onDelete={() => setDeletingTransaction(t)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="p-4 space-y-4">
                <h1 className="text-lg font-bold text-slate-900">Reports</h1>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                    <span className="text-[11px] font-bold text-emerald-700">Monthly Income</span>
                    <div className="text-base font-extrabold text-emerald-800 mt-1">{formatINR(thisMonthIncome)}</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
                    <span className="text-[11px] font-bold text-red-700">Monthly Expense</span>
                    <div className="text-base font-extrabold text-red-800 mt-1">{formatINR(thisMonthExpenses)}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="p-4 space-y-4">
                <h1 className="text-lg font-bold text-slate-900">Settings</h1>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-slate-800">Monthly Budget (₹)</h3>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                    />
                    <button
                      onClick={handleSaveBudget}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {(activeTab === 0 || activeTab === 1) && (
            <button
              onClick={handleOpenAdd}
              aria-label="Add transaction"
              className="absolute right-5 bottom-18 z-40 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center space-x-1.5 text-xs font-bold"
            >
              <Plus size={18} />
              <span>Add</span>
            </button>
          )}

          <div className="h-16 bg-white border-t border-slate-200/80 px-2 flex justify-around items-center shrink-0 z-30">
            <button onClick={() => setActiveTab(0)} className={`flex flex-col items-center ${activeTab === 0 ? 'text-indigo-600' : 'text-slate-500'}`}>
              <Wallet size={18} />
              <span className="text-[10px] font-semibold mt-0.5">Dashboard</span>
            </button>
            <button onClick={() => setActiveTab(1)} className={`flex flex-col items-center ${activeTab === 1 ? 'text-indigo-600' : 'text-slate-500'}`}>
              <Receipt size={18} />
              <span className="text-[10px] font-semibold mt-0.5">Transactions</span>
            </button>
            <button onClick={() => setActiveTab(2)} className={`flex flex-col items-center ${activeTab === 2 ? 'text-indigo-600' : 'text-slate-500'}`}>
              <BarChart3 size={18} />
              <span className="text-[10px] font-semibold mt-0.5">Reports</span>
            </button>
            <button onClick={() => setActiveTab(3)} className={`flex flex-col items-center ${activeTab === 3 ? 'text-indigo-600' : 'text-slate-500'}`}>
              <Settings size={18} />
              <span className="text-[10px] font-semibold mt-0.5">Settings</span>
            </button>
          </div>
        </div>

        {isFormOpen && (
          <TransactionFormModal
            existing={editingTransaction}
            onClose={() => setIsFormOpen(false)}
            onSaved={async (msg) => {
              setIsFormOpen(false);
              showToast(msg);
              await loadAllData();
            }}
          />
        )}
      </div>
    </div>
  );
};

interface TransactionItemTileProps {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}

const TransactionItemTile: React.FC<TransactionItemTileProps> = ({ transaction, onEdit, onDelete }) => {
  const isExpense = transaction.type === 'expense';

  return (
    <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between">
      <div className="flex items-center space-x-3 overflow-hidden">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
            isExpense ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          {transaction.categoryEmoji || transaction.category.substring(0, 2).toUpperCase()}
        </div>

        <div className="truncate">
          <p className="text-xs font-bold text-slate-900 truncate">{transaction.title || transaction.description}</p>
          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
            <span className="font-medium text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
              {transaction.category}
            </span>
            <span>{formatDateIndian(transaction.transaction_date)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <div className={`text-xs font-extrabold ${isExpense ? 'text-red-600' : 'text-emerald-600'}`}>
          {isExpense ? '-' : '+'}
          {formatINR(transaction.amount)}
        </div>
        <div className="flex items-center space-x-0.5">
          <button onClick={onEdit} className="p-1 rounded-lg text-slate-400 hover:text-indigo-600">
            <Edit2 size={13} />
          </button>
          <button onClick={onDelete} className="p-1 rounded-lg text-slate-400 hover:text-red-600">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

interface TransactionFormModalProps {
  existing: Transaction | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({ existing, onClose, onSaved }) => {
  const isEdit = existing !== null;

  const [type, setType] = useState<'expense' | 'income'>(existing?.type || 'expense');
  const [amount, setAmount] = useState<string>(existing?.amount ? existing.amount.toString() : '');
  const [title, setTitle] = useState<string>(existing?.title || existing?.description || '');
  const [category, setCategory] = useState<string>(() => {
    if (existing?.category) return existing.category;
    return type === 'expense' ? EXPENSE_CATEGORIES[0].name : INCOME_CATEGORIES[0].name;
  });
  const [date, setDate] = useState<string>(() => {
    if (existing?.transaction_date) return existing.transaction_date;
    return new Date().toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState<string>(existing?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0].name : INCOME_CATEGORIES[0].name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    setErrors({});
    setIsSubmitting(true);

    try {
      const numAmount = parseFloat(amount.trim());
      const cleanTitle = title.trim();
      const cleanNotes = notes.trim() || undefined;

      if (isEdit && existing?.id) {
        await sqliteDb.updateTransaction({
          ...existing,
          type,
          amount: numAmount,
          title: cleanTitle,
          description: cleanTitle,
          category,
          transaction_date: date,
          notes: cleanNotes,
        });
        onSaved('Transaction updated in SQLite!');
      } else {
        await sqliteDb.insertTransaction({
          type,
          amount: numAmount,
          title: cleanTitle,
          description: cleanTitle,
          category,
          categoryEmoji: type === 'expense' ? '💸' : '💰',
          transaction_date: date,
          notes: cleanNotes,
        });
        onSaved('New transaction saved to SQLite!');
      }
    } catch (err: any) {
      setErrors({ form: err.message || 'SQLite error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col justify-end z-50 animate-in fade-in">
      <div className="bg-white rounded-t-[32px] p-5 max-h-[90%] overflow-y-auto space-y-4 shadow-2xl">
        <div className="flex justify-between items-center pb-1 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">{isEdit ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 rounded-lg font-bold ${type === 'expense' ? 'bg-red-500 text-white' : 'text-slate-600'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 rounded-lg font-bold ${type === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Amount (₹) *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 border rounded-xl p-2 text-sm font-bold"
            />
            {errors.amount && <p className="text-red-500 text-[10px] mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border rounded-xl p-2 text-xs"
            />
            {errors.title && <p className="text-red-500 text-[10px] mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border rounded-xl p-2 text-xs"
            >
              {(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex space-x-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border font-bold">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold">
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
