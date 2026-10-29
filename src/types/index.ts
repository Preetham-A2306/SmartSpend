export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  user_id?: string;
  type: TransactionType;
  title: string;
  description?: string; // Backwards-compatible alias
  amount: number;
  category: string;
  categoryEmoji: string;
  transaction_date: string; // ISO format 'YYYY-MM-DD'
  notes?: string;
  created_at: string;
}

export interface CategoryInfo {
  name: string;
  emoji: string;
  type: TransactionType;
  pastelBg: string;
  borderColor: string;
  textColor: string;
  accentColor: string; // Used for charts
}

export interface AppSettings {
  monthlyBudget: number;
  userName: string;
  currency: string;
  categoryBudgets: Record<string, number>;
  supabaseConnected: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export interface CategorySummary {
  category: string;
  emoji: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
  pastelBg: string;
}

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { name: 'Food', emoji: '🍔', type: 'expense', pastelBg: '#FEE2E2', borderColor: '#FECACA', textColor: '#B91C1C', accentColor: '#F87171' },
  { name: 'Transport', emoji: '🚗', type: 'expense', pastelBg: '#FFEDD5', borderColor: '#FED7AA', textColor: '#C2410C', accentColor: '#FB923C' },
  { name: 'Shopping', emoji: '🛍️', type: 'expense', pastelBg: '#FCE7F3', borderColor: '#FBCFE8', textColor: '#BE185D', accentColor: '#F472B6' },
  { name: 'Education', emoji: '📚', type: 'expense', pastelBg: '#EDE9FE', borderColor: '#DDD6FE', textColor: '#6D28D9', accentColor: '#A78BFA' },
  { name: 'Entertainment', emoji: '🎮', type: 'expense', pastelBg: '#F3E8FF', borderColor: '#E9D5FF', textColor: '#7E22CE', accentColor: '#C084FC' },
  { name: 'Bills', emoji: '🏠', type: 'expense', pastelBg: '#FEF9C3', borderColor: '#FEF08A', textColor: '#A16207', accentColor: '#FACC15' },
  { name: 'Healthcare', emoji: '🏥', type: 'expense', pastelBg: '#CFFAFE', borderColor: '#A5F3FC', textColor: '#0E7490', accentColor: '#38BDF8' },
  { name: 'Travel', emoji: '✈️', type: 'expense', pastelBg: '#E0F2FE', borderColor: '#BAE6FD', textColor: '#0369A1', accentColor: '#60A5FA' },
  { name: 'Other', emoji: '📦', type: 'expense', pastelBg: '#F1F5F9', borderColor: '#E2E8F0', textColor: '#475569', accentColor: '#94A3B8' },
];

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { name: 'Salary', emoji: '💼', type: 'income', pastelBg: '#DCFCE7', borderColor: '#BBF7D0', textColor: '#15803D', accentColor: '#4ADE80' },
  { name: 'Scholarship', emoji: '🎓', type: 'income', pastelBg: '#E0E7FF', borderColor: '#C7D2FE', textColor: '#4338CA', accentColor: '#818CF8' },
  { name: 'Allowance', emoji: '💰', type: 'income', pastelBg: '#D1FAE5', borderColor: '#A7F3D0', textColor: '#047857', accentColor: '#34D399' },
  { name: 'Freelance', emoji: '🧑‍💻', type: 'income', pastelBg: '#CCFBF1', borderColor: '#99F6E4', textColor: '#0F766E', accentColor: '#2DD4BF' },
  { name: 'Gift', emoji: '🎁', type: 'income', pastelBg: '#FFE4E6', borderColor: '#FECDD3', textColor: '#BE123C', accentColor: '#FB7185' },
  { name: 'Other', emoji: '📦', type: 'income', pastelBg: '#F1F5F9', borderColor: '#E2E8F0', textColor: '#475569', accentColor: '#94A3B8' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryInfo(categoryName: string, type: TransactionType = 'expense'): CategoryInfo {
  const found = ALL_CATEGORIES.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
  if (found) return found;
  return {
    name: categoryName,
    emoji: type === 'income' ? '💵' : '💸',
    type,
    pastelBg: '#F1F5F9',
    borderColor: '#E2E8F0',
    textColor: '#475569',
    accentColor: '#94A3B8',
  };
}
