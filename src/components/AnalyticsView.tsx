import React, { useState } from 'react';
import {
  PieChart,
  BarChart,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowUpRight,
  PiggyBank,
} from 'lucide-react';
import { Transaction, CategorySummary } from '../types/index.ts';
import { ExpenseCharts } from './ExpenseCharts.tsx';
import { formatINR, formatDateIndian, calculateSavingsRate } from '../utils/finance.ts';
import { StorageService } from '../services/storage.ts';

interface AnalyticsViewProps {
  transactions: Transaction[];
  selectedMonth: { year: number; month: number };
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions, selectedMonth }) => {
  const [filterYear, setFilterYear] = useState<number>(selectedMonth.year);
  const [filterMonth, setFilterMonth] = useState<number>(selectedMonth.month);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Filter transactions for chosen month and year
  const activeTransactions = transactions.filter((t) => {
    const [y, m] = t.transaction_date.split('-').map(Number);
    return y === filterYear && m === filterMonth;
  });

  const monthIncome = activeTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const monthExpenses = activeTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const netSavings = monthIncome - monthExpenses;
  const savingsRate = calculateSavingsRate(monthIncome, monthExpenses);

  // Category breakdown
  const categoryMap = new Map<string, { amount: number; count: number; emoji: string }>();
  activeTransactions
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

  // Historical trend
  const monthAbbrs = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrendData: { monthName: string; income: number; expense: number }[] = [];

  for (let i = 4; i >= 0; i--) {
    const targetDate = new Date(filterYear, filterMonth - 1 - i, 1);
    const y = targetDate.getFullYear();
    const m = targetDate.getMonth() + 1;
    const name = `${monthAbbrs[m - 1]} '${y.toString().slice(-2)}`;

    const inRange = transactions.filter((t) => {
      const [tY, tM] = t.transaction_date.split('-').map(Number);
      return tY === y && tM === m;
    });

    const inc = inRange.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = inRange.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    monthlyTrendData.push({ monthName: name, income: inc, expense: exp });
  }

  const handleExport = () => {
    StorageService.exportToCsv(activeTransactions);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Filters */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center space-x-2">
            <span>📊</span>
            <span>Analytics & Financial Reports</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed spending insights, category breakdown & savings analytics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Month & Year Selectors */}
          <div className="flex items-center space-x-2 bg-[#F8FAFC] p-1.5 rounded-2xl border border-slate-200/80">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExport}
            className="bg-[#F8FAFC] hover:bg-slate-100 text-slate-700 font-bold px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs flex items-center space-x-1.5 shadow-2xs transition-colors"
          >
            <Download size={14} className="text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards for Selected Month */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#14532D]">
              Month Inflow
            </span>
            <span className="w-8 h-8 rounded-xl bg-[#BBF7D0]/60 flex items-center justify-center text-base">
              📈
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#15803D]">{formatINR(monthIncome)}</div>
          <p className="text-[11px] text-[#166534] mt-1 font-medium">From salary, gifts & freelance</p>
        </div>

        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7F1D1D]">
              Month Outflow
            </span>
            <span className="w-8 h-8 rounded-xl bg-[#FECACA]/60 flex items-center justify-center text-base">
              💸
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#B91C1C]">{formatINR(monthExpenses)}</div>
          <p className="text-[11px] text-[#991B1B] mt-1 font-medium">Across all expense categories</p>
        </div>

        <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0C4A6E]">
              Net Savings Rate
            </span>
            <span className="w-8 h-8 rounded-xl bg-[#BAE6FD]/60 flex items-center justify-center text-base">
              🐷
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#0284C7]">{savingsRate}%</div>
          <p className="text-[11px] text-[#0369A1] mt-1 font-medium">
            Net Savings: {formatINR(netSavings)}
          </p>
        </div>
      </div>

      {/* Visual Charts */}
      <ExpenseCharts
        incomeTotal={monthIncome}
        expenseTotal={monthExpenses}
        categoryBreakdown={categoryBreakdown}
        monthlyTrendData={monthlyTrendData}
      />

      {/* Detailed Category Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
        <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center space-x-2">
          <span>🏷️</span>
          <span>Category Breakdown Details</span>
        </h3>

        {categoryBreakdown.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No expenses recorded for the chosen month.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Transactions</th>
                  <th className="py-3 px-3">Percentage</th>
                  <th className="py-3 px-3">Visual Distribution</th>
                  <th className="py-3 px-3 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70">
                {categoryBreakdown.map((cat) => (
                  <tr key={cat.category} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-base">
                          {cat.emoji}
                        </span>
                        <span className="font-extrabold text-slate-800">{cat.category}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-semibold">
                      {cat.count} {cat.count === 1 ? 'transaction' : 'transactions'}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-700">{cat.percentage}%</td>
                    <td className="py-3.5 px-3 w-48">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-extrabold text-sm text-red-600">
                      {formatINR(cat.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
