import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  ArrowRight,
  Wallet,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Transaction, AppSettings, CategorySummary } from '../types/index.ts';
import { SummaryCards } from './SummaryCard.tsx';
import { ExpenseCharts } from './ExpenseCharts.tsx';
import { formatINR, formatDateIndian, isBudgetExceeded, getBudgetUsagePercentage } from '../utils/finance.ts';

interface DashboardViewProps {
  transactions: Transaction[];
  settings: AppSettings;
  selectedMonth: { year: number; month: number };
  onNavigateTab: (tab: any) => void;
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  settings,
  selectedMonth,
  onNavigateTab,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  // Financial metrics
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpenses;
  const totalSavings = Math.max(0, totalBalance);
  const savingsRate = totalIncome > 0 ? Number(((totalSavings / totalIncome) * 100).toFixed(1)) : 0;

  // Selected month calculations
  const monthTransactions = transactions.filter((t) => {
    const [y, m] = t.transaction_date.split('-').map(Number);
    return y === selectedMonth.year && m === selectedMonth.month;
  });

  const monthExpenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const budgetExceeded = isBudgetExceeded(monthExpenses, settings.monthlyBudget);
  const budgetUsage = getBudgetUsagePercentage(monthExpenses, settings.monthlyBudget);

  // Category breakdown for doughnut chart
  const categoryMap = new Map<string, { amount: number; count: number; emoji: string }>();
  monthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const cur = categoryMap.get(t.category) || { amount: 0, count: 0, emoji: t.categoryEmoji };
      categoryMap.set(t.category, {
        amount: cur.amount + t.amount,
        count: cur.count + 1,
        emoji: t.categoryEmoji,
      });
    });

  const categoryBreakdown: CategorySummary[] = [];
  const palette = ['#F87171', '#FB923C', '#F472B6', '#A78BFA', '#C084FC', '#FACC15', '#38BDF8', '#60A5FA', '#94A3B8'];
  let colorIdx = 0;
  categoryMap.forEach((val, cat) => {
    const percentage = monthExpenses > 0 ? Number(((val.amount / monthExpenses) * 100).toFixed(1)) : 0;
    categoryBreakdown.push({
      category: cat,
      emoji: val.emoji,
      amount: val.amount,
      percentage,
      count: val.count,
      color: palette[colorIdx % palette.length],
      pastelBg: '#F8FAFC',
    });
    colorIdx++;
  });
  categoryBreakdown.sort((a, b) => b.amount - a.amount);

  // 6-month historical trend calculation
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrendData: { monthName: string; income: number; expense: number }[] = [];

  for (let i = 4; i >= 0; i--) {
    const targetDate = new Date(selectedMonth.year, selectedMonth.month - 1 - i, 1);
    const y = targetDate.getFullYear();
    const m = targetDate.getMonth() + 1;
    const name = `${months[m - 1]} '${y.toString().slice(-2)}`;

    const inRange = transactions.filter((t) => {
      const [tY, tM] = t.transaction_date.split('-').map(Number);
      return tY === y && tM === m;
    });

    const inc = inRange.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = inRange.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    monthlyTrendData.push({ monthName: name, income: inc, expense: exp });
  }

  // Recent 6 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards */}
      <SummaryCards
        totalBalance={totalBalance}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        totalSavings={totalSavings}
        savingsRate={savingsRate}
        monthlyExpenseCount={monthTransactions.filter((t) => t.type === 'expense').length}
      />

      {/* Monthly Budget Health Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">🎯</span>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                Monthly Budget Health
              </h3>
              <p className="text-xs text-slate-400">
                Limit set to {formatINR(settings.monthlyBudget)} for this month
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                budgetExceeded
                  ? 'bg-red-100 text-red-700'
                  : budgetUsage >= 80
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {budgetExceeded
                ? '⚠️ Exceeded Limit'
                : budgetUsage >= 80
                ? '⚡ 80% Spent'
                : '✅ On Track'}
            </span>
            <span className="text-xs font-extrabold text-slate-700">
              {formatINR(monthExpenses)} / {formatINR(settings.monthlyBudget)}
            </span>
          </div>
        </div>

        {/* Progress Bar with Soft Colors */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetExceeded
                ? 'bg-red-400'
                : budgetUsage >= 80
                ? 'bg-amber-400'
                : 'bg-[#BBF7D0]'
            }`}
            style={{ width: `${Math.min(100, budgetUsage)}%` }}
          />
        </div>

        {budgetExceeded && (
          <div className="mt-3 flex items-center space-x-2 bg-[#FEE2E2]/60 border border-[#FECACA] rounded-2xl p-3 text-xs text-[#7F1D1D] font-medium">
            <AlertTriangle size={15} className="text-red-500 shrink-0" />
            <span>
              Spending alert! You have spent {formatINR(monthExpenses - settings.monthlyBudget)} over your monthly limit.
            </span>
          </div>
        )}
      </div>

      {/* Analytics Charts Grid */}
      <ExpenseCharts
        incomeTotal={monthIncome}
        expenseTotal={monthExpenses}
        categoryBreakdown={categoryBreakdown}
        monthlyTrendData={monthlyTrendData}
      />

      {/* Recent Transactions List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base flex items-center space-x-2">
              <span>💳</span>
              <span>Recent Transactions</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Your latest financial activity</p>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="flex items-center space-x-1 text-xs font-bold text-[#6D28D9] hover:text-[#5B21B6] transition-colors bg-[#F5F3FF] px-3 py-1.5 rounded-xl border border-[#DDD6FE]"
          >
            <span>View All ({transactions.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-[#F8FAFC] flex items-center justify-center mx-auto text-3xl">
              💸
            </div>
            <p className="text-sm font-bold text-slate-700">No transactions recorded yet</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Start by recording your first income or expense transaction to visualize your financial health.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-2 bg-[#C4B5FD] hover:bg-[#B49EFA] text-[#4C1D95] font-extrabold text-xs px-4 py-2.5 rounded-xl inline-flex items-center space-x-1.5 shadow-xs"
            >
              <Plus size={14} />
              <span>Add Your First Record</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Title / Description</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Type</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70">
                {recentTransactions.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3.5 px-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-base shrink-0">
                            {tx.categoryEmoji}
                          </span>
                          <span className="font-bold text-slate-700">{tx.category}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="max-w-xs">
                          <p className="font-bold text-slate-800 truncate">{tx.title}</p>
                          {tx.notes && <p className="text-[11px] text-slate-400 truncate">{tx.notes}</p>}
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-slate-500 font-medium">
                        {formatDateIndian(tx.transaction_date)}
                      </td>
                      <td className="py-3.5 px-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isExpense
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isExpense ? 'Expense' : 'Income'}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <span
                          className={`font-extrabold text-sm ${
                            isExpense ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          {isExpense ? '-' : '+'}
                          {formatINR(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
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
