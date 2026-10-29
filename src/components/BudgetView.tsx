import React, { useState } from 'react';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Save,
  Edit3,
} from 'lucide-react';
import { Transaction, AppSettings, EXPENSE_CATEGORIES } from '../types/index.ts';
import { formatINR } from '../utils/finance.ts';

interface BudgetViewProps {
  transactions: Transaction[];
  settings: AppSettings;
  selectedMonth: { year: number; month: number };
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  transactions,
  settings,
  selectedMonth,
  onUpdateSettings,
  onShowToast,
}) => {
  const [overallBudgetInput, setOverallBudgetInput] = useState<string>(
    settings.monthlyBudget.toString()
  );
  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>(
    settings.categoryBudgets || {}
  );
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempCategoryLimit, setTempCategoryLimit] = useState<string>('');

  // Selected month calculations
  const monthTransactions = transactions.filter((t) => {
    const [y, m] = t.transaction_date.split('-').map(Number);
    return y === selectedMonth.year && m === selectedMonth.month;
  });

  const monthExpenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const remainingBudget = settings.monthlyBudget - monthExpenses;
  const overallUsage =
    settings.monthlyBudget > 0
      ? Number(((monthExpenses / settings.monthlyBudget) * 100).toFixed(1))
      : 0;

  // Compute spend per category
  const categorySpendMap: Record<string, number> = {};
  monthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categorySpendMap[t.category] = (categorySpendMap[t.category] || 0) + t.amount;
    });

  const handleSaveOverallBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(overallBudgetInput);
    if (isNaN(val) || val <= 0) {
      onShowToast('Please enter a valid monthly budget greater than ₹0.', 'error');
      return;
    }
    onUpdateSettings({ monthlyBudget: val });
    onShowToast(`Monthly budget updated to ${formatINR(val)}!`, 'success');
  };

  const handleStartEditCategory = (catName: string, currentLimit: number) => {
    setEditingCategory(catName);
    setTempCategoryLimit(currentLimit ? currentLimit.toString() : '1000');
  };

  const handleSaveCategoryLimit = (catName: string) => {
    const val = parseFloat(tempCategoryLimit);
    if (isNaN(val) || val <= 0) {
      onShowToast('Please enter a valid category limit.', 'error');
      return;
    }
    const updated = { ...categoryLimits, [catName]: val };
    setCategoryLimits(updated);
    onUpdateSettings({ categoryBudgets: updated });
    setEditingCategory(null);
    onShowToast(`${catName} budget updated to ${formatINR(val)}!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center space-x-2">
            <span>🎯</span>
            <span>Monthly Budget Planner</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Set smart spending targets, avoid debt, and build healthy financial habits
          </p>
        </div>

        {/* Edit Overall Budget Form */}
        <form onSubmit={handleSaveOverallBudget} className="flex items-center space-x-2">
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
            <input
              type="number"
              value={overallBudgetInput}
              onChange={(e) => setOverallBudgetInput(e.target.value)}
              className="bg-[#F8FAFC] border border-slate-200 rounded-2xl pl-8 pr-3 py-2 text-xs font-extrabold text-slate-800 w-32 focus:outline-none focus:border-[#C4B5FD] focus:ring-2 focus:ring-[#C4B5FD]/20"
            />
          </div>
          <button
            type="submit"
            className="bg-[#C4B5FD] hover:bg-[#B49EFA] text-[#4C1D95] font-extrabold px-3.5 py-2 rounded-2xl text-xs flex items-center space-x-1.5 transition-all shadow-2xs border border-[#A78BFA]/40"
          >
            <Save size={14} />
            <span>Update Budget</span>
          </button>
        </form>
      </div>

      {/* Main Budget Health Hero Card */}
      <div className="bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#E0E7FF] border border-[#DDD6FE] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D28D9]">
              Overall Budget Target
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#4C1D95]">
              {formatINR(settings.monthlyBudget)}
            </div>
            <p className="text-xs text-[#5B21B6] font-medium">Monthly spending threshold</p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Total Spent So Far
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-800">
              {formatINR(monthExpenses)}
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  overallUsage > 100
                    ? 'bg-red-100 text-red-800'
                    : overallUsage >= 80
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {overallUsage}% Used
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Remaining Budget
            </span>
            <div
              className={`text-3xl sm:text-4xl font-extrabold ${
                remainingBudget >= 0 ? 'text-[#15803D]' : 'text-red-600'
              }`}
            >
              {formatINR(remainingBudget)}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {remainingBudget >= 0 ? 'Safe buffer for remaining days' : 'Budget limit exceeded!'}
            </p>
          </div>
        </div>

        {/* Master Progress Bar */}
        <div className="mt-6">
          <div className="w-full h-4 bg-white/70 rounded-full overflow-hidden p-0.5 border border-white">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallUsage > 100
                  ? 'bg-red-500'
                  : overallUsage >= 80
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallUsage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category-Wise Budgets Grid */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base flex items-center space-x-2">
              <span>🛍️</span>
              <span>Category-Wise Budget Limits</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Set customized spending ceilings for each expense category
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
            {EXPENSE_CATEGORIES.length} Categories
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {EXPENSE_CATEGORIES.map((cat) => {
            const limit = categoryLimits[cat.name] || 1500;
            const spent = categorySpendMap[cat.name] || 0;
            const percentage = limit > 0 ? Number(((spent / limit) * 100).toFixed(1)) : 0;
            const isExceeded = spent > limit;
            const isWarning = percentage >= 80 && !isExceeded;

            const isEditingThis = editingCategory === cat.name;

            return (
              <div
                key={cat.name}
                className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{cat.emoji}</span>
                    <span className="font-extrabold text-sm text-slate-800">{cat.name}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isExceeded
                        ? 'bg-red-100 text-red-800'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isExceeded ? 'Exceeded' : isWarning ? 'Warning' : 'Healthy'}
                  </span>
                </div>

                {/* Spent vs Limit */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs text-slate-500 font-medium">Spent:</span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {formatINR(spent)} /{' '}
                      <span className="text-slate-500 font-semibold">{formatINR(limit)}</span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExceeded ? 'bg-red-400' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>{percentage}% used</span>
                    <span>{formatINR(Math.max(0, limit - spent))} left</span>
                  </div>
                </div>

                {/* Edit Category Limit */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  {isEditingThis ? (
                    <div className="flex items-center space-x-1.5 w-full">
                      <span className="font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        value={tempCategoryLimit}
                        onChange={(e) => setTempCategoryLimit(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveCategoryLimit(cat.name)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded-lg text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="bg-slate-200 text-slate-700 px-2 py-1 rounded-lg text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-slate-400 text-[11px]">Target: {formatINR(limit)}</span>
                      <button
                        onClick={() => handleStartEditCategory(cat.name, limit)}
                        className="text-slate-400 hover:text-[#6D28D9] flex items-center space-x-1 font-semibold"
                      >
                        <Edit3 size={12} />
                        <span>Edit Limit</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivational Savings Tip Card */}
      <div className="bg-[#FEF9C3]/70 border border-[#FEF08A] rounded-3xl p-6 text-xs text-[#713F12] space-y-2">
        <div className="flex items-center space-x-2 font-bold text-[#854D0E] text-sm">
          <Sparkles size={18} className="text-amber-500" />
          <span>Smart Spending Rule of Thumb: 50/30/20</span>
        </div>
        <p className="leading-relaxed">
          Allocate <strong>50%</strong> of income to needs (groceries, rent, bills), <strong>30%</strong> to wants (dining out, entertainment, shopping), and <strong>20%</strong> straight to emergency savings and investments. SmartSpend helps you maintain this balance effortlessly!
        </p>
      </div>
    </div>
  );
};
