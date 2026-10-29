import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  X,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types/index.ts';
import { formatINR, formatDateIndian } from '../utils/finance.ts';
import { StorageService } from '../services/storage.ts';

interface TransactionsViewProps {
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Filter & Sort logic
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Type filter
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        // Category filter
        if (categoryFilter !== 'all' && t.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchCat = t.category.toLowerCase().includes(q);
          const matchNotes = t.notes?.toLowerCase().includes(q) || false;
          return matchTitle || matchCat || matchNotes;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'date-desc') return b.transaction_date.localeCompare(a.transaction_date);
        if (sortOrder === 'date-asc') return a.transaction_date.localeCompare(b.transaction_date);
        if (sortOrder === 'amount-desc') return b.amount - a.amount;
        if (sortOrder === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, typeFilter, categoryFilter, searchQuery, sortOrder]);

  const handleExport = () => {
    StorageService.exportToCsv(filteredTransactions);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setSortOrder('date-desc');
  };

  const totalFilteredSum = filteredTransactions.reduce(
    (acc, cur) => acc + (cur.type === 'income' ? cur.amount : -cur.amount),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center space-x-2">
              <span>💳</span>
              <span>All Transactions</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filteredTransactions.length} of {transactions.length} total entries
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              title="Download filtered transactions as CSV"
              className="bg-[#F8FAFC] hover:bg-slate-100 text-slate-700 font-bold px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs flex items-center space-x-1.5 transition-colors shadow-2xs"
            >
              <Download size={14} className="text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="bg-[#C4B5FD] hover:bg-[#B49EFA] text-[#4C1D95] font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center space-x-1.5 transition-all shadow-xs border border-[#A78BFA]/40"
            >
              <Plus size={15} />
              <span>+ Add Transaction</span>
            </button>
          </div>
        </div>

        {/* Search, Filter Pills & Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Search bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, category, notes..."
              className="w-full bg-[#F8FAFC] border border-slate-200/90 rounded-2xl pl-10 pr-8 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#C4B5FD] focus:ring-2 focus:ring-[#C4B5FD]/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Type Filter Pills */}
          <div className="bg-[#F8FAFC] p-1 rounded-2xl border border-slate-200/90 flex items-center justify-between text-xs font-bold">
            <button
              onClick={() => setTypeFilter('all')}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All 💳
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                typeFilter === 'income'
                  ? 'bg-[#DCFCE7] text-[#15803D] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Income 📈
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                typeFilter === 'expense'
                  ? 'bg-[#FEE2E2] text-[#B91C1C] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Expense 💸
            </button>
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200/90 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#C4B5FD] focus:ring-2 focus:ring-[#C4B5FD]/20"
            >
              <option value="all">All Categories 🏷️</option>
              <optgroup label="Expenses">
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Income">
                {INCOME_CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Sort order Dropdown */}
          <div>
            <select
              value={sortOrder}
              onChange={(e: any) => setSortOrder(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200/90 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#C4B5FD] focus:ring-2 focus:ring-[#C4B5FD]/20"
            >
              <option value="date-desc">Date (Newest First) 🗓️</option>
              <option value="date-asc">Date (Oldest First) 🗓️</option>
              <option value="amount-desc">Amount (Highest First) 💰</option>
              <option value="amount-asc">Amount (Lowest First) 💰</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Transactions Table Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-[#F8FAFC] flex items-center justify-center mx-auto text-3xl">
              🔍
            </div>
            <p className="text-base font-bold text-slate-700">No matching transactions found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              We couldn&rsquo;t find any records matching your search or filters. Try relaxing your filters or record a new transaction.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Title & Notes</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70">
                {filteredTransactions.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-9 h-9 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-center text-base shrink-0 shadow-2xs">
                            {tx.categoryEmoji}
                          </span>
                          <span className="font-bold text-slate-800">{tx.category}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="max-w-md">
                          <p className="font-extrabold text-slate-800 text-sm">{tx.title}</p>
                          {tx.notes && (
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{tx.notes}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 font-medium whitespace-nowrap">
                        {formatDateIndian(tx.transaction_date)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isExpense
                              ? 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]'
                              : 'bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]'
                          }`}
                        >
                          {isExpense ? 'Expense 💸' : 'Income 📈'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`font-extrabold text-sm ${
                            isExpense ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          {isExpense ? '-' : '+'}
                          {formatINR(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Edit transaction"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-[#6D28D9] hover:bg-[#F3E8FF] transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx)}
                            title="Delete transaction"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
