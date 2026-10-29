import { Transaction, CategorySummary, getCategoryInfo } from '../types/index.ts';

/**
 * Calculates sum of all income transactions.
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

/**
 * Calculates sum of all expense transactions.
 */
export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

/**
 * Balance = Total Income - Total Expenses.
 */
export function calculateBalance(totalIncome: number, totalExpenses: number): number {
  return Number((totalIncome - totalExpenses).toFixed(2));
}

/**
 * Savings rate = (Income - Expense) / Income * 100
 */
export function calculateSavingsRate(totalIncome: number, totalExpenses: number): number {
  if (totalIncome <= 0) return 0;
  const savings = totalIncome - totalExpenses;
  if (savings <= 0) return 0;
  return Number(((savings / totalIncome) * 100).toFixed(1));
}

/**
 * Extracts year and month (1-12) from ISO date string YYYY-MM-DD.
 */
export function parseIsoDate(isoDate: string): { year: number; month: number; day: number } {
  if (!isoDate) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }
  const parts = isoDate.split('-');
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10),
    day: parseInt(parts[2], 10),
  };
}

/**
 * Filters transactions by calendar year and month.
 */
export function filterTransactionsByMonth(
  transactions: Transaction[],
  year: number,
  month: number
): Transaction[] {
  return transactions.filter((t) => {
    if (!t.transaction_date) return false;
    const { year: tYear, month: tMonth } = parseIsoDate(t.transaction_date);
    return tYear === year && tMonth === month;
  });
}

/**
 * Calculates total expenses for a specific month.
 */
export function getMonthlyExpenses(
  transactions: Transaction[],
  year: number,
  month: number
): number {
  const monthTransactions = filterTransactionsByMonth(transactions, year, month);
  return calculateTotalExpenses(monthTransactions);
}

/**
 * Calculates total income for a specific month.
 */
export function getMonthlyIncome(
  transactions: Transaction[],
  year: number,
  month: number
): number {
  const monthTransactions = filterTransactionsByMonth(transactions, year, month);
  return calculateTotalIncome(monthTransactions);
}

/**
 * Computes category breakdown for expenses (only expenses).
 */
export function getCategoryBreakdown(
  transactions: Transaction[],
  year?: number,
  month?: number
): CategorySummary[] {
  let list = transactions.filter((t) => t.type === 'expense');

  if (year !== undefined && month !== undefined) {
    list = filterTransactionsByMonth(list, year, month);
  }

  const totalExpense = list.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const categoryMap = new Map<string, { amount: number; count: number }>();

  list.forEach((t) => {
    const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
    categoryMap.set(t.category, {
      amount: existing.amount + Number(t.amount || 0),
      count: existing.count + 1,
    });
  });

  const summaries: CategorySummary[] = [];

  categoryMap.forEach((val, category) => {
    const info = getCategoryInfo(category, 'expense');
    const percentage = totalExpense > 0 ? Number(((val.amount / totalExpense) * 100).toFixed(1)) : 0;
    summaries.push({
      category,
      emoji: info.emoji,
      amount: Number(val.amount.toFixed(2)),
      percentage,
      count: val.count,
      color: info.accentColor,
      pastelBg: info.pastelBg,
    });
  });

  // Sort by highest spending first
  return summaries.sort((a, b) => b.amount - a.amount);
}

/**
 * Checks if current month expense exceeds user-defined budget.
 */
export function isBudgetExceeded(monthlyExpense: number, budget: number): boolean {
  if (budget <= 0) return false;
  return monthlyExpense > budget;
}

/**
 * Computes percentage of budget used.
 */
export function getBudgetUsagePercentage(monthlyExpense: number, budget: number): number {
  if (budget <= 0) return 0;
  return Number(((monthlyExpense / budget) * 100).toFixed(1));
}

/**
 * Formats amount into Indian Rupee format (₹xx,xxx.xx).
 */
export function formatINR(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Formats ISO date (YYYY-MM-DD) into readable Indian date: '28 Oct 2026'.
 */
export function formatDateIndian(isoDate: string): string {
  if (!isoDate) return '';
  const { year, month, day } = parseIsoDate(isoDate);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Validates transaction inputs.
 */
export function validateTransactionInput(data: {
  type?: string;
  amount?: number | string;
  title?: string;
  description?: string;
  category?: string;
  transaction_date?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.type || (data.type !== 'income' && data.type !== 'expense')) {
    errors.type = 'Please select transaction type (Income or Expense).';
  }

  const numAmount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
  if (numAmount === undefined || isNaN(numAmount) || numAmount <= 0) {
    errors.amount = 'Amount must be a valid number greater than ₹0.';
  }

  const titleVal = data.title || data.description;
  if (!titleVal || titleVal.trim().length === 0) {
    errors.title = 'Title / description cannot be empty.';
  } else if (titleVal.trim().length > 100) {
    errors.title = 'Title must not exceed 100 characters.';
  }

  if (!data.category || data.category.trim().length === 0) {
    errors.category = 'Please choose a category.';
  }

  if (!data.transaction_date || !/^\d{4}-\d{2}-\d{2}$/.test(data.transaction_date)) {
    errors.transaction_date = 'Please select a valid date in YYYY-MM-DD format.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
