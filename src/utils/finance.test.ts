import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateBalance,
  calculateSavingsRate,
  filterTransactionsByMonth,
  getMonthlyExpenses,
  getMonthlyIncome,
  getCategoryBreakdown,
  isBudgetExceeded,
  getBudgetUsagePercentage,
  validateTransactionInput,
  parseIsoDate,
} from './finance.ts';
import { Transaction } from '../types/index.ts';

const sampleTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    title: 'Tech Internship Stipend',
    amount: 25000,
    category: 'Salary',
    categoryEmoji: '💼',
    transaction_date: '2026-10-01',
    created_at: '2026-10-01 10:00:00',
  },
  {
    id: '2',
    type: 'expense',
    title: 'College Cafeteria & Snacks',
    amount: 1200,
    category: 'Food',
    categoryEmoji: '🍔',
    transaction_date: '2026-10-05',
    created_at: '2026-10-05 12:00:00',
  },
  {
    id: '3',
    type: 'expense',
    title: 'Semester Reference Books',
    amount: 3500,
    category: 'Education',
    categoryEmoji: '📚',
    transaction_date: '2026-10-12',
    created_at: '2026-10-12 14:00:00',
  },
  {
    id: '4',
    type: 'expense',
    title: 'Metro Monthly Pass',
    amount: 800,
    category: 'Transport',
    categoryEmoji: '🚗',
    transaction_date: '2026-10-15',
    created_at: '2026-10-15 09:00:00',
  },
  {
    id: '5',
    type: 'income',
    title: 'Freelance Web Design',
    amount: 5000,
    category: 'Freelance',
    categoryEmoji: '🧑‍💻',
    transaction_date: '2026-09-20',
    created_at: '2026-09-20 18:00:00',
  },
  {
    id: '6',
    type: 'expense',
    title: 'Previous Month Grocery',
    amount: 1500,
    category: 'Food',
    categoryEmoji: '🍔',
    transaction_date: '2026-09-25',
    created_at: '2026-09-25 11:00:00',
  },
];

test('calculateTotalIncome sums only income entries correctly', () => {
  const total = calculateTotalIncome(sampleTransactions);
  assert.equal(total, 30000); // 25000 + 5000
});

test('calculateTotalExpenses sums only expense entries correctly', () => {
  const total = calculateTotalExpenses(sampleTransactions);
  assert.equal(total, 7000); // 1200 + 3500 + 800 + 1500
});

test('calculateBalance correctly calculates income minus expenses', () => {
  const income = calculateTotalIncome(sampleTransactions);
  const expenses = calculateTotalExpenses(sampleTransactions);
  const balance = calculateBalance(income, expenses);
  assert.equal(balance, 23000);
});

test('calculateSavingsRate computes savings percentage', () => {
  const rate = calculateSavingsRate(30000, 7000);
  assert.equal(rate, 76.7); // (23000 / 30000) * 100
});

test('calculateBalance handles negative balance accurately', () => {
  const balance = calculateBalance(1000, 3500);
  assert.equal(balance, -2500);
});

test('filterTransactionsByMonth isolates only matching month and year', () => {
  const oct2026 = filterTransactionsByMonth(sampleTransactions, 2026, 10);
  assert.equal(oct2026.length, 4);

  const sep2026 = filterTransactionsByMonth(sampleTransactions, 2026, 9);
  assert.equal(sep2026.length, 2);
});

test('getMonthlyExpenses calculates expense accurately for a given month', () => {
  const octExpenses = getMonthlyExpenses(sampleTransactions, 2026, 10);
  assert.equal(octExpenses, 5500); // 1200 + 3500 + 800
});

test('getCategoryBreakdown includes ONLY expense transactions', () => {
  const breakdown = getCategoryBreakdown(sampleTransactions, 2026, 10);
  assert.equal(breakdown.length, 3);
  const education = breakdown.find((b) => b.category === 'Education');
  assert.ok(education);
  assert.equal(education?.amount, 3500);
  assert.equal(breakdown.some((b) => b.category === 'Salary'), false);
});

test('budget warning triggers when expense exceeds budget limit', () => {
  assert.equal(isBudgetExceeded(6000, 5000), true);
  assert.equal(isBudgetExceeded(5000, 5000), false);
  assert.equal(isBudgetExceeded(4500, 5000), false);
});

test('validateTransactionInput rejects invalid or empty values', () => {
  const res1 = validateTransactionInput({
    type: 'expense',
    amount: -50,
    title: '',
    category: '',
    transaction_date: '',
  });
  assert.equal(res1.valid, false);
  assert.ok(res1.errors.amount);
  assert.ok(res1.errors.title);

  const res2 = validateTransactionInput({
    type: 'income',
    amount: 1000,
    title: 'Pocket Money',
    category: 'Allowance',
    transaction_date: '2026-10-28',
  });
  assert.equal(res2.valid, true);
});
